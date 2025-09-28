/**
 * ResponsiveManager - レスポンシブデザインを管理するクラス
 * ブレークポイント検出、レイアウト調整、モバイル向け最適化を担当
 */
export class ResponsiveManager {
  constructor() {
    // ブレークポイント定義
    this.breakpoints = {
      xs: 0,      // Extra small
      sm: 576,    // Small
      md: 768,    // Medium
      lg: 992,    // Large
      xl: 1200,   // Extra large
      xxl: 1400   // Extra extra large
    };

    this.currentBreakpoint = '';
    this.previousBreakpoint = '';
    this.isMobile = false;
    this.isTablet = false;
    this.isDesktop = false;

    // デバウンス用タイマー
    this.resizeTimer = null;
    this.resizeDelay = 250;

    // イベントリスナー
    this.eventListeners = new Map();

    // モバイルメニュー関連
    this.mobileMenuToggle = null;
    this.mobileMenu = null;
    this.isMenuOpen = false;

    this.isInitialized = false;
  }

  /**
   * ResponsiveManagerを初期化する
   */
  initialize() {
    if (this.isInitialized) return;

    try {
      this.detectBreakpoint();
      this.setupEventListeners();
      this.setupMobileMenu();
      this.setupResponsiveImages();
      this.setupViewportUnits();
      this.setupTouchOptimizations();

      // 初期化イベントを発行
      this.emitEvent('responsiveInitialized', {
        breakpoint: this.currentBreakpoint,
        isMobile: this.isMobile,
        isTablet: this.isTablet,
        isDesktop: this.isDesktop
      });

      this.isInitialized = true;

      if (window.Config?.debug) {
        console.log(`ResponsiveManagerを初期化しました (${this.currentBreakpoint})`);
      }
    } catch (error) {
      console.error('ResponsiveManagerの初期化に失敗しました:', error);
    }
  }

  /**
   * ブレークポイントを検出
   * @returns {string} 現在のブレークポイント
   */
  detectBreakpoint() {
    const width = window.innerWidth;
    this.previousBreakpoint = this.currentBreakpoint;

    if (width >= this.breakpoints.xxl) {
      this.currentBreakpoint = 'xxl';
    } else if (width >= this.breakpoints.xl) {
      this.currentBreakpoint = 'xl';
    } else if (width >= this.breakpoints.lg) {
      this.currentBreakpoint = 'lg';
    } else if (width >= this.breakpoints.md) {
      this.currentBreakpoint = 'md';
    } else if (width >= this.breakpoints.sm) {
      this.currentBreakpoint = 'sm';
    } else {
      this.currentBreakpoint = 'xs';
    }

    // デバイスタイプを更新
    this.updateDeviceTypes();

    // ブレークポイントが変更された場合
    if (this.previousBreakpoint !== this.currentBreakpoint) {
      this.handleBreakpointChange();
    }

    return this.currentBreakpoint;
  }

  /**
   * デバイスタイプを更新
   */
  updateDeviceTypes() {
    this.isMobile = this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm';
    this.isTablet = this.currentBreakpoint === 'md';
    this.isDesktop = this.currentBreakpoint === 'lg' || this.currentBreakpoint === 'xl' || this.currentBreakpoint === 'xxl';

    // HTML要素にクラスを設定
    const html = document.documentElement;
    html.classList.toggle('is-mobile', this.isMobile);
    html.classList.toggle('is-tablet', this.isTablet);
    html.classList.toggle('is-desktop', this.isDesktop);
    html.setAttribute('data-breakpoint', this.currentBreakpoint);
  }

  /**
   * ブレークポイント変更時の処理
   */
  handleBreakpointChange() {
    // レイアウト調整
    this.adjustLayout();

    // イベントを発行
    this.emitEvent('breakpointChange', {
      from: this.previousBreakpoint,
      to: this.currentBreakpoint,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isDesktop: this.isDesktop
    });

    if (window.Config?.debug) {
      console.log(`ブレークポイントが変更: ${this.previousBreakpoint} → ${this.currentBreakpoint}`);
    }
  }

  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // ウィンドウリサイズイベント
    window.addEventListener('resize', () => {
      this.handleResize();
    }, { passive: true });

    // オリエンテーション変更イベント
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });

    // メディアクエリの監視
    this.setupMediaQueries();
  }

  /**
   * メディアクエリを設定
   */
  setupMediaQueries() {
    // 各ブレークポイントのメディアクエリ
    Object.entries(this.breakpoints).forEach(([name, min]) => {
      const max = name === 'xxl' ? null : this.breakpoints[Object.keys(this.breakpoints)[Object.keys(this.breakpoints).indexOf(name) + 1]] - 1;

      const query = max !== null
        ? `(min-width: ${min}px) and (max-width: ${max}px)`
        : `(min-width: ${min}px)`;

      const mediaQuery = window.matchMedia(query);

      mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
          this.emitEvent('mediaQueryMatch', { breakpoint: name, matches: true });
        }
      });

      // 初期チェック
      if (mediaQuery.matches) {
        this.emitEvent('mediaQueryMatch', { breakpoint: name, matches: true });
      }
    });
  }

  /**
   * リサイズを処理
   */
  handleResize() {
    // デバウンス処理
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.detectBreakpoint();
      this.emitEvent('windowResized', {
        width: window.innerWidth,
        height: window.innerHeight,
        breakpoint: this.currentBreakpoint
      });
    }, this.resizeDelay);
  }

  /**
   * オリエンテーション変更を処理
   */
  handleOrientationChange() {
    const orientation = window.orientation === 90 || window.orientation === -90 ? 'landscape' : 'portrait';

    this.emitEvent('orientationChange', {
      orientation: orientation,
      width: window.innerWidth,
      height: window.innerHeight
    });

    // 短期間の遅延後にレイアウトを調整
    setTimeout(() => {
      this.detectBreakpoint();
      this.adjustLayout();
    }, 100);
  }

  /**
   * モバイルメニューを設定
   */
  setupMobileMenu() {
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.mobileMenu = document.querySelector('.mobile-menu');

    if (this.mobileMenuToggle && this.mobileMenu) {
      this.mobileMenuToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });

      // メニュー外クリックで閉じる
      document.addEventListener('click', (e) => {
        if (this.isMenuOpen &&
            !this.mobileMenu.contains(e.target) &&
            !this.mobileMenuToggle.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // ESCキーで閉じる
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isMenuOpen) {
          this.closeMobileMenu();
        }
      });
    }
  }

  /**
   * モバイルメニューを開閉
   */
  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * モバイルメニューを開く
   */
  openMobileMenu() {
    this.isMenuOpen = true;
    this.mobileMenu.classList.add('open');
    this.mobileMenuToggle.classList.add('active');
    this.mobileMenuToggle.setAttribute('aria-expanded', 'true');

    // スクロールを固定
    document.body.style.overflow = 'hidden';

    this.emitEvent('mobileMenuOpened');
  }

  /**
   * モバイルメニューを閉じる
   */
  closeMobileMenu() {
    this.isMenuOpen = false;
    this.mobileMenu.classList.remove('open');
    this.mobileMenuToggle.classList.remove('active');
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');

    // スクロール固定を解除
    document.body.style.overflow = '';

    this.emitEvent('mobileMenuClosed');
  }

  /**
   * レスポンシブ画像を設定
   */
  setupResponsiveImages() {
    const responsiveImages = document.querySelectorAll('img[data-srcset]');

    responsiveImages.forEach(img => {
      if (img.dataset.srcset) {
        const srcset = this.generateSrcset(img.dataset.srcset);
        if (srcset) {
          img.srcset = srcset;
        }
      }
    });
  }

  /**
   * srcset属性を生成
   * @param {string} basePath - 画像のベースパス
   * @returns {string} srcset文字列
   */
  generateSrcset(basePath) {
    // 実際の実装では、存在する画像サイズに基づいてsrcsetを生成
    // ここでは例として一般的なパターンを使用
    return `${basePath}-small.jpg 480w, ${basePath}-medium.jpg 768w, ${basePath}-large.jpg 1024w`;
  }

  /**
   * ビューポート単位を設定
   */
  setupViewportUnits() {
    // vh単位の正確な計算（モバイルブラウザのアドレスバー問題に対応）
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh, { passive: true });
    window.addEventListener('orientationchange', setVh);
  }

  /**
   * タッチ操作の最適化
   */
  setupTouchOptimizations() {
    if ('ontouchstart' in window) {
      // タッチデバイス用のクラスを追加
      document.documentElement.classList.add('touch-device');

      // ホバー効果を無効化（タッチデバイスの場合）
      this.setupHoverFix();
    }
  }

  /**
   * ホバー効果の修正
   */
  setupHoverFix() {
    // タッチデバイスでリンクをタップした際のhover効果を防止
    const links = document.querySelectorAll('a, button');

    links.forEach(link => {
      link.addEventListener('touchstart', () => {
        link.classList.add('touch-active');
      });

      link.addEventListener('touchend', () => {
        setTimeout(() => {
          link.classList.remove('touch-active');
        }, 300);
      });
    });
  }

  /**
   * レイアウトを調整
   */
  adjustLayout() {
    // グリッドシステムの調整
    this.adjustGrids();

    // タイポグラフィの調整
    this.adjustTypography();

    // スペーシングの調整
    this.adjustSpacing();

    // コンポーネントの調整
    this.adjustComponents();
  }

  /**
   * グリッドを調整
   */
  adjustGrids() {
    const grids = document.querySelectorAll('.grid, [class*="grid-"]');

    grids.forEach(grid => {
      const breakpoint = this.currentBreakpoint;

      // ブレークポイントに応じたカラム数を設定
      if (grid.dataset.cols) {
        const cols = JSON.parse(grid.dataset.cols);
        if (cols[breakpoint]) {
          grid.style.setProperty('--grid-cols', cols[breakpoint]);
        }
      }
    });
  }

  /**
   * タイポグラフィを調整
   */
  adjustTypography() {
    // 見出しのフォントサイズ調整
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach(heading => {
      const baseSize = parseFloat(getComputedStyle(heading).fontSize);
      const scaleFactor = this.getScaleFactor();

      if (scaleFactor !== 1) {
        heading.style.fontSize = `${baseSize * scaleFactor}px`;
      }
    });
  }

  /**
   * スケールファクターを取得
   * @returns {number} スケールファクター
   */
  getScaleFactor() {
    switch (this.currentBreakpoint) {
      case 'xs':
        return 0.875; // 14/16
      case 'sm':
        return 0.9375; // 15/16
      case 'md':
        return 1;
      case 'lg':
        return 1.125; // 18/16
      case 'xl':
        return 1.25; // 20/16
      case 'xxl':
        return 1.375; // 22/16
      default:
        return 1;
    }
  }

  /**
   * スペーシングを調整
   */
  adjustSpacing() {
    // コンテナの最大幅を調整
    const containers = document.querySelectorAll('.container, [class*="container"]');

    containers.forEach(container => {
      if (container.dataset.maxWidth) {
        const maxWidths = JSON.parse(container.dataset.maxWidth);
        if (maxWidths[this.currentBreakpoint]) {
          container.style.maxWidth = maxWidths[this.currentBreakpoint];
        }
      }
    });
  }

  /**
   * コンポーネントを調整
   */
  adjustComponents() {
    // ナビゲーションの調整
    this.adjustNavigation();

    // カードの調整
    this.adjustCards();

    // テーブルの調整
    this.adjustTables();
  }

  /**
   * ナビゲーションを調整
   */
  adjustNavigation() {
    const nav = document.querySelector('nav');
    if (nav) {
      if (this.isMobile) {
        nav.classList.add('mobile-nav');
        nav.classList.remove('desktop-nav');
      } else {
        nav.classList.remove('mobile-nav');
        nav.classList.add('desktop-nav');
      }
    }
  }

  /**
   * カードを調整
   */
  adjustCards() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      if (this.isMobile) {
        card.classList.add('mobile-card');
      } else {
        card.classList.remove('mobile-card');
      }
    });
  }

  /**
   * テーブルを調整
   */
  adjustTables() {
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
      if (this.isMobile && !table.parentElement.classList.contains('table-responsive')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }

  /**
   * 現在のブレークポイントを取得
   * @returns {string} 現在のブレークポイント
   */
  getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }

  /**
   * ブレークポイントに対応
   * @param {Object} handlers - ブレークポイントごとのハンドラ
   */
  matchBreakpoint(handlers) {
    if (handlers[this.currentBreakpoint]) {
      handlers[this.currentBreakpoint]();
    }
  }

  /**
   * カスタムイベントを発行
   * @param {string} eventName - イベント名
   * @param {Object} data - データ
   */
  emitEvent(eventName, data = {}) {
    const event = new CustomEvent(eventName, {
      detail: {
        ...data,
        breakpoint: this.currentBreakpoint,
        isMobile: this.isMobile,
        isTablet: this.isTablet,
        isDesktop: this.isDesktop,
        timestamp: Date.now()
      }
    });

    window.dispatchEvent(event);

    if (window.Config?.debug) {
      console.log(`ResponsiveManager event: ${eventName}`, data);
    }
  }

  /**
   * イベントリスナーを追加
   * @param {string} event - イベント名
   * @param {Function} handler - ハンドラ関数
   */
  on(event, handler) {
    window.addEventListener(event, handler);
    this.eventListeners.set(event, handler);
  }

  /**
   * イベントリスナーを削除
   * @param {string} event - イベント名
   * @param {Function} handler - ハンドラ関数
   */
  off(event, handler) {
    window.removeEventListener(event, handler);
    this.eventListeners.delete(event);
  }

  /**
   * ResponsiveManagerを破棄
   */
  destroy() {
    // イベントリスナーをクリーンアップ
    clearTimeout(this.resizeTimer);

    this.eventListeners.forEach((handler, event) => {
      window.removeEventListener(event, handler);
    });
    this.eventListeners.clear();

    // モバイルメニューを閉じる
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    }

    // 設定をリセット
    this.currentBreakpoint = '';
    this.previousBreakpoint = '';
    this.isMobile = false;
    this.isTablet = false;
    this.isDesktop = false;

    // HTML要素からクラスを削除
    const html = document.documentElement;
    html.classList.remove('is-mobile', 'is-tablet', 'is-desktop', 'touch-device');
    html.removeAttribute('data-breakpoint');

    this.isInitialized = false;

    if (window.Config?.debug) {
      console.log('ResponsiveManagerを破棄しました');
    }
  }
}