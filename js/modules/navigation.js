// NavigationModule - ナビゲーション機能の実装
// DOM Selectors
const SELECTORS = {
  HAMBURGER: '#hamburger',
  MENU: '#nav-menu',
  NAV_LINK: '.nav-link',
  SECTIONS: 'section[id]',
  ACTIVE_LINK: '.nav-link.active'
};

// Default Configuration
const DEFAULT_CONFIG = {
  mobileBreakpoint: 768,
  scrollOffset: 100,
  animationDuration: 300,
  throttleDelay: 100,
  debounceDelay: 250,
  scrollThreshold: 50,
  minViewportWidth: 320,
  maxViewportWidth: 2560,
  focusTimeout: 100,
  menuTransitionDelay: 300
};

// Configuration Validation
const CONFIG_VALIDATION = {
  mobileBreakpoint: { min: 320, max: 2560, type: 'number' },
  scrollOffset: { min: 0, max: 500, type: 'number' },
  animationDuration: { min: 0, max: 2000, type: 'number' },
  throttleDelay: { min: 16, max: 1000, type: 'number' },
  debounceDelay: { min: 16, max: 1000, type: 'number' },
  scrollThreshold: { min: 0, max: 200, type: 'number' }
};

// Event Types
const EVENTS = {
  CLICK: 'click',
  SCROLL: 'scroll',
  RESIZE: 'resize',
  KEYDOWN: 'keydown'
};

// CSS Classes
const CLASSES = {
  ACTIVE: 'active',
  MOBILE_MENU: 'mobile-menu'
};

// ARIA Attributes
const ARIA = {
  EXPANDED: 'aria-expanded'
};

const NavigationModule = {
  // 設定
  config: { ...DEFAULT_CONFIG },

  // 状態管理
  state: {
    isMobile: false,
    isMenuOpen: false,
    currentSection: '',
    scrollHandler: null,
    resizeHandler: null,
    isInitialized: false,
    eventListeners: new Map() // イベントリスナーの追跡用Map
  },

  // DOM要素のキャッシュ
  elements: {
    hamburger: null,
    menu: null,
    links: [],
    sections: [],
    activeLink: null
  },

  // Initialize module
  init: function() {
    if (this.state.isInitialized) {
      this.logDebug('NavigationModule already initialized');
      return;
    }

    const startTime = performance.now();

    try {
      this.cacheElements();
      this.setupEventListeners();
      this.checkBreakpoint();
      this.updateActiveLink();

      this.state.isInitialized = true;

      const duration = performance.now() - startTime;
      this.logPerformance('Initialization', duration);
      this.logDebug('NavigationModule initialized successfully');
    } catch (error) {
      this.handleError('Initialization error', error);
    }
  },

  // DOM要素のキャッシュ
  cacheElements: function() {
    this.elements.hamburger = TeaSalesApp.utils.querySelector(SELECTORS.HAMBURGER);
    this.elements.menu = TeaSalesApp.utils.querySelector(SELECTORS.MENU);
    this.elements.links = Array.from(TeaSalesApp.utils.querySelectorAll(SELECTORS.NAV_LINK));
    this.elements.sections = Array.from(TeaSalesApp.utils.querySelectorAll(SELECTORS.SECTIONS));
    this.elements.activeLink = TeaSalesApp.utils.querySelector(SELECTORS.ACTIVE_LINK);
  },

  // イベントリスナーの設定
  setupEventListeners: function() {
    this.setupHamburgerListener();
    this.setupNavLinkListeners();
    this.setupScrollListener();
    this.setupResizeListener();
    this.setupKeyboardListener();
    this.setupOutsideClickListener();
  },

  // Setup hamburger menu listener
  setupHamburgerListener: function() {
    if (this.elements.hamburger) {
      this.addEventListener(this.elements.hamburger, EVENTS.CLICK, () => this.toggleMenu());
    }
  },

  // Setup navigation link listeners
  setupNavLinkListeners: function() {
    this.elements.links.forEach(link => {
      this.addEventListener(link, EVENTS.CLICK, (e) => this.handleLinkClick(e));
    });
  },

  // Setup scroll listener with throttling
  setupScrollListener: function() {
    this.state.scrollHandler = TeaSalesApp.utils.throttle(() => {
      this.updateActiveLink();
    }, this.config.throttleDelay);

    this.addEventListener(document, EVENTS.SCROLL, this.state.scrollHandler);
  },

  // Setup resize listener with debouncing
  setupResizeListener: function() {
    this.state.resizeHandler = TeaSalesApp.utils.debounce(() => {
      this.handleResize();
    }, this.config.debounceDelay);

    this.addEventListener(window, EVENTS.RESIZE, this.state.resizeHandler);
  },

  // Setup keyboard listener
  setupKeyboardListener: function() {
    this.addEventListener(document, EVENTS.KEYDOWN, (e) => this.handleKeydown(e));
  },

  // Setup outside click listener
  setupOutsideClickListener: function() {
    this.addEventListener(document, EVENTS.CLICK, (e) => this.handleOutsideClick(e));
  },

  // Helper method to add event listeners with tracking
  addEventListener: function(element, event, handler) {
    if (!element || !event || !handler) {
      return;
    }

    // イベントリスナーを追跡用Mapに登録
    const listenerKey = `${event}_${Date.now()}_${Math.random()}`;
    this.state.eventListeners.set(listenerKey, { element, event, handler });

    // イベントリスナーを追加
    TeaSalesApp.utils.addEventListener(element, event, handler);

    if (TeaSalesApp.config.debug) {
      console.log(`Event listener added: ${event} on element`, listenerKey);
    }
  },

  // Helper method to remove event listeners with tracking
  _removeEventListener: function(element, event, handler) {
    if (!element || !event || !handler) {
      return;
    }

    // 追跡用Mapから該当するリスナーを検索して削除
    for (const [key, listener] of this.state.eventListeners.entries()) {
      if (listener.element === element && listener.event === event && listener.handler === handler) {
        this.state.eventListeners.delete(key);
        break;
      }
    }

    // イベントリスナーを削除
    TeaSalesApp.utils.removeEventListener(element, event, handler);

    if (TeaSalesApp.config.debug) {
      console.log(`Event listener removed: ${event} from element`);
    }
  },

  // Remove all event listeners (for cleanup)
  _removeAllEventListeners: function() {
    if (TeaSalesApp.config.debug) {
      console.log(`Removing ${this.state.eventListeners.size} event listeners`);
    }

    for (const [key, listener] of this.state.eventListeners.entries()) {
      try {
        this._removeEventListener(listener.element, listener.event, listener.handler);
      } catch (error) {
        this.handleError('Error removing event listener', error, this.ERROR_LEVELS.WARN);
      }
    }

    this.state.eventListeners.clear();
  },

  // ハンバーガーメニューの切り替え
  toggleMenu: function() {
    if (!this.elements.menu) return;

    this.state.isMenuOpen = !this.state.isMenuOpen;

    if (this.state.isMenuOpen) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  },

  // メニューを開く
  openMenu: function() {
    if (!this.elements.menu || !this.elements.hamburger) return;

    TeaSalesApp.utils.addClass(this.elements.menu, CLASSES.ACTIVE);
    TeaSalesApp.utils.setAria(this.elements.hamburger, ARIA.EXPANDED, 'true');
    this.state.isMenuOpen = true;

    // フォーカスをメニューに移動
    if (this.state.isMobile) {
      this.focusFirstMenuItem();
    }
  },

  // メニューを閉じる
  closeMenu: function() {
    if (!this.elements.menu || !this.elements.hamburger) return;

    TeaSalesApp.utils.removeClass(this.elements.menu, CLASSES.ACTIVE);
    TeaSalesApp.utils.setAria(this.elements.hamburger, ARIA.EXPANDED, 'false');
    this.state.isMenuOpen = false;
  },

  // リンククリックの処理
  handleLinkClick: function(event) {
    const link = event.currentTarget;
    const href = link.getAttribute('href');

    if (href.startsWith('#')) {
      event.preventDefault();
      const targetId = href.substring(1);
      this.smoothScroll(targetId);

      // モバイルの場合はメニューを閉じる
      if (this.state.isMobile) {
        this.closeMenu();
      }
    }
  },

  // スムーズスクロール
  smoothScroll: function(targetId) {
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    // アクティブリンクの更新
    this.setActiveLink(targetId);

    // スクロール実行
    const offset = this.config.scrollOffset;
    const targetPosition = targetElement.offsetTop - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // スクロール完了後にフォーカス
    setTimeout(() => {
      TeaSalesApp.utils.focus(targetElement);
    }, this.config.focusTimeout);
  },

  // アクティブリンクの設定
  setActiveLink: function(sectionId) {
    // 現在のアクティブリンクを解除
    if (this.elements.activeLink) {
      TeaSalesApp.utils.removeClass(this.elements.activeLink, CLASSES.ACTIVE);
    }

    // 新しいアクティブリンクを設定
    const newActiveLink = this.elements.links.find(link => {
      const href = link.getAttribute('href');
      return href === `#${sectionId}`;
    });

    if (newActiveLink) {
      TeaSalesApp.utils.addClass(newActiveLink, CLASSES.ACTIVE);
      this.elements.activeLink = newActiveLink;
      this.state.currentSection = sectionId;
    }
  },

  // アクティブリンクの更新（スクロール位置に基づく）
  updateActiveLink: function() {
    if (this.elements.sections.length === 0) return;

    const scrollPosition = window.scrollY + this.config.scrollOffset + this.config.scrollThreshold;
    let currentSection = '';

    // パフォーマンス最適化：ループの早期終了
    for (let i = 0; i < this.elements.sections.length; i++) {
      const section = this.elements.sections[i];
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.id;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = sectionId;
        break; // 一致したらループを終了
      }
    }

    if (currentSection && currentSection !== this.state.currentSection) {
      this.setActiveLink(currentSection);
    }
  },

  // キーボードイベントの処理
  handleKeydown: function(event) {
    if (!this.state.isMenuOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeMenu();
        if (this.elements.hamburger) {
          TeaSalesApp.utils.focus(this.elements.hamburger);
        }
        break;

      case 'Tab':
        if (!this.state.isMobile) return;

        // Shift+Tabで最後の要素から出ようとするとき
        if (event.shiftKey && document.activeElement === this.getFirstMenuItem()) {
          event.preventDefault();
          this.focusLastMenuItem();
        }
        // Tabで最初の要素に戻ろうとするとき
        else if (!event.shiftKey && document.activeElement === this.getLastMenuItem()) {
          event.preventDefault();
          this.focusFirstMenuItem();
        }
        break;
    }
  },

  // メニュー外クリックの処理
  handleOutsideClick: function(event) {
    if (!this.state.isMenuOpen || !this.state.isMobile) return;

    const isClickInsideMenu = this.elements.menu && this.elements.menu.contains(event.target);
    const isClickOnHamburger = this.elements.hamburger && this.elements.hamburger.contains(event.target);

    if (!isClickInsideMenu && !isClickOnHamburger) {
      this.closeMenu();
    }
  },

  // ウィンドウリサイズの処理
  handleResize: function() {
    this.checkBreakpoint();

    // デスクトップに切り替わったらメニューを閉じる
    if (!this.state.isMobile && this.state.isMenuOpen) {
      this.closeMenu();
    }
  },

  // ブレークポイントのチェック
  checkBreakpoint: function() {
    this.state.isMobile = window.innerWidth < this.config.mobileBreakpoint;

    // モバイルメニューの表示/非表示を切り替え
    if (this.elements.menu) {
      if (this.state.isMobile) {
        TeaSalesApp.utils.addClass(this.elements.menu, CLASSES.MOBILE_MENU);
      } else {
        TeaSalesApp.utils.removeClass(this.elements.menu, CLASSES.MOBILE_MENU);
      }
    }
  },

  // フォーカス管理メソッド
  focusFirstMenuItem: function() {
    const firstItem = this.getFirstMenuItem();
    if (firstItem) {
      TeaSalesApp.utils.focus(firstItem);
    }
  },

  focusLastMenuItem: function() {
    const lastItem = this.getLastMenuItem();
    if (lastItem) {
      TeaSalesApp.utils.focus(lastItem);
    }
  },

  getFirstMenuItem: function() {
    const menuItems = this.elements.menu ? this.elements.menu.querySelectorAll('a, button') : [];
    return menuItems.length > 0 ? menuItems[0] : null;
  },

  getLastMenuItem: function() {
    const menuItems = this.elements.menu ? this.elements.menu.querySelectorAll('a, button') : [];
    return menuItems.length > 0 ? menuItems[menuItems.length - 1] : null;
  },

  // ユーティリティメソッド
  manageFocus: function(element) {
    TeaSalesApp.utils.focus(element);
  },

  // Error levels for classification
  ERROR_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  // Enhanced error handling method
  handleError: function(message, error, level = this.ERROR_LEVELS.ERROR) {
    const timestamp = new Date().toISOString();
    const errorData = {
      timestamp,
      level,
      message,
      error: error.message,
      stack: error.stack,
      moduleState: {
        isMobile: this.state.isMobile,
        isMenuOpen: this.state.isMenuOpen,
        isInitialized: this.state.isInitialized,
        eventListenersCount: this.state.eventListeners.size
      }
    };

    // エラーレベルに応じた出力
    switch (level) {
      case this.ERROR_LEVELS.ERROR:
        console.error(`🚨 NavigationModule ${message}:`, errorData);
        break;
      case this.ERROR_LEVELS.WARN:
        console.warn(`⚠️ NavigationModule ${message}:`, errorData);
        break;
      case this.ERROR_LEVELS.INFO:
        console.info(`ℹ️ NavigationModule ${message}:`, errorData);
        break;
      case this.ERROR_LEVELS.DEBUG:
        if (TeaSalesApp.config.debug) {
          console.debug(`🔍 NavigationModule ${message}:`, errorData);
        }
        break;
    }

    // エラーカウントの追跡（デバッグモード時）
    if (TeaSalesApp.config.debug) {
      if (!this.state.errorCount) {
        this.state.errorCount = 0;
      }
      this.state.errorCount++;

      console.debug(`NavigationModule error count: ${this.state.errorCount}`);
    }
  },

  // Log performance metrics
  logPerformance: function(operation, duration) {
    if (!TeaSalesApp.config.debug) return;

    const timestamp = new Date().toISOString();
    console.debug(`⚡ NavigationModule Performance: ${operation} took ${duration}ms`, {
      timestamp,
      operation,
      duration,
      moduleState: {
        isMobile: this.state.isMobile,
        isMenuOpen: this.state.isMenuOpen,
        eventListenersCount: this.state.eventListeners.size
      }
    });
  },

  // Log debug information
  logDebug: function(message, data = {}) {
    if (!TeaSalesApp.config.debug) return;

    const timestamp = new Date().toISOString();
    console.debug(`🔍 NavigationModule ${message}:`, {
      timestamp,
      ...data,
      moduleState: {
        isMobile: this.state.isMobile,
        isMenuOpen: this.state.isMenuOpen,
        currentSection: this.state.currentSection,
        eventListenersCount: this.state.eventListeners.size
      }
    });
  },

  // イベントリスナーのクリーンアップ
  cleanup: function() {
    try {
      // すべてのイベントリスナーを削除
      this._removeAllEventListeners();

      // Reset state
      this.state.isInitialized = false;
      this.state.isMenuOpen = false;
      this.state.scrollHandler = null;
      this.state.resizeHandler = null;
      this.state.eventListeners.clear();

      // Clear elements
      this.elements = {
        hamburger: null,
        menu: null,
        links: [],
        sections: [],
        activeLink: null
      };

      if (TeaSalesApp.config.debug) {
        console.log('NavigationModule cleaned up successfully');
      }
    } catch (error) {
      this.handleError('Cleanup error', error);
    }
  },

  // Configuration validation method
  validateConfig: function(config) {
    const errors = [];

    for (const [key, validation] of Object.entries(CONFIG_VALIDATION)) {
      if (config.hasOwnProperty(key)) {
        const value = config[key];

        if (typeof value !== validation.type) {
          errors.push(`${key} must be of type ${validation.type}`);
          continue;
        }

        if (value < validation.min || value > validation.max) {
          errors.push(`${key} must be between ${validation.min} and ${validation.max}`);
        }
      }
    }

    return errors;
  },

  // Configuration method
  configure: function(options) {
    if (!options || typeof options !== 'object') {
      this.handleError('Configuration error', new Error('Configuration must be an object'), this.ERROR_LEVELS.WARN);
      return;
    }

    // Validate configuration options
    const validationErrors = this.validateConfig(options);
    if (validationErrors.length > 0) {
      this.handleError('Configuration validation error', new Error(validationErrors.join(', ')), this.ERROR_LEVELS.WARN);
      return;
    }

    this.config = { ...DEFAULT_CONFIG, ...options };

    if (TeaSalesApp.config.debug) {
      console.log('NavigationModule configuration updated:', this.config);
    }
  },

  // Get current state
  getState: function() {
    return {
      isMobile: this.state.isMobile,
      isMenuOpen: this.state.isMenuOpen,
      currentSection: this.state.currentSection,
      isInitialized: this.state.isInitialized
    };
  }
};

// グローバルスコープに公開
window.NavigationModule = NavigationModule;