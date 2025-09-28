// ProductsModule - 製品表示機能の実装
// DOM Selectors
const SELECTORS = {
  PRODUCTS_CONTAINER: '.products-container',
  PRODUCT_CARD: '.product-card',
  PRODUCT_GRID: '.product-grid',
  FILTER_BUTTONS: '.filter-button',
  SORT_SELECT: '.sort-select',
  SEARCH_INPUT: '.search-input',
  PAGINATION: '.pagination',
  LOAD_MORE_BUTTON: '.load-more-button',
  PRODUCT_DETAIL_MODAL: '.product-detail-modal',
  CLOSE_MODAL: '.close-modal',
  PRODUCT_IMAGE: '.product-image',
  PRODUCT_TITLE: '.product-title',
  PRODUCT_PRICE: '.product-price',
  PRODUCT_DESCRIPTION: '.product-description',
  PRODUCT_CATEGORY: '.product-category',
  LOADING_SPINNER: '.loading-spinner',
  NO_RESULTS: '.no-results'
};

// Default Configuration
const DEFAULT_CONFIG = {
  animationDuration: 300,
  mobileBreakpoint: 768,
  productsPerPage: 12,
  maxProductsPerRow: 4,
  enableLazyLoading: true,
  enableFiltering: true,
  enableSorting: true,
  enableSearch: true,
  enablePagination: true,
  filterEnabled: true,
  imageLoadingStrategy: 'lazy',
  debounceDelay: 250,
  throttleDelay: 100,
  filterDebounceDelay: 300,
  searchDebounceDelay: 400,
  animationEasing: 'ease-in-out',
  fadeDuration: 200,
  slideDuration: 300,
  maxRetries: 3,
  retryDelay: 1000,
  storageKey: 'products_data',
  cacheTimeout: 300000, // 5 minutes
  defaultSort: 'name-asc',
  availableFilters: ['category', 'price', 'availability'],
  availableSorts: ['name-asc', 'name-desc', 'price-asc', 'price-desc', 'rating-desc']
};

// Configuration Validation - ConfigValidatorを使用
const CONFIG_VALIDATION_SCHEMA = {
  properties: {
    animationDuration: { type: 'number', min: 0, max: 2000, default: 300 },
    mobileBreakpoint: { type: 'number', min: 320, max: 2560, default: 768 },
    productsPerPage: { type: 'number', min: 1, max: 100, default: 12 },
    maxProductsPerRow: { type: 'number', min: 1, max: 6, default: 4 },
    debounceDelay: { type: 'number', min: 16, max: 1000, default: 250 },
    throttleDelay: { type: 'number', min: 16, max: 1000, default: 100 }
  }
};

// Event Types
const EVENTS = {
  CLICK: 'click',
  SCROLL: 'scroll',
  RESIZE: 'resize',
  INPUT: 'input',
  CHANGE: 'change',
  KEYDOWN: 'keydown',
  LOAD: 'load',
  ERROR: 'error',
  ANIMATION_END: 'animationend'
};

// CSS Classes
const CLASSES = {
  ACTIVE: 'active',
  LOADING: 'loading',
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  FADE_IN: 'fade-in',
  FADE_OUT: 'fade-out',
  SLIDE_IN: 'slide-in',
  SLIDE_OUT: 'slide-out',
  DISABLED: 'disabled',
  SELECTED: 'selected',
  FILTERED: 'filtered',
  SORTED: 'sorted',
  GRID_2COL: 'grid-2col',
  GRID_3COL: 'grid-3col',
  GRID_4COL: 'grid-4col',
  MOBILE: 'mobile',
  DESKTOP: 'desktop'
};

// ARIA Attributes
const ARIA = {
  BUSY: 'aria-busy',
  EXPANDED: 'aria-expanded',
  SELECTED: 'aria-selected',
  DISABLED: 'aria-disabled',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic'
};

// Product Categories
const PRODUCT_CATEGORIES = {
  GREEN_TEA: '緑茶',
  BLACK_TEA: '紅茶',
  OOLONG_TEA: 'ウーロン茶',
  HERBAL_TEA: 'ハーブティー',
  BLENDED_TEA: 'ブレンドティー',
  PREMIUM_TEA: 'プレミアム茶'
};

const ProductsModule = {
  // 設定
  config: { ...DEFAULT_CONFIG },

  // 状態管理
  state: {
    isInitialized: false,
    isLoading: false,
    products: [],
    filteredProducts: [],
    currentPage: 1,
    totalPages: 1,
    selectedFilters: {},
    currentSort: DEFAULT_CONFIG.defaultSort,
    searchQuery: '',
    isMobile: false,
    productsPerRow: 4,
    retryCount: 0,
    lastCacheTime: null,
    eventListeners: new Map(),
    imageObserver: null,
    scrollHandler: null,
    resizeHandler: null,
    searchHandler: null,
    filterHandler: null,
    sortHandler: null,
    lazyLoadHandler: null,
    filters: {}
  },

  // DOM要素のキャッシュ
  elements: {
    productsContainer: null,
    productGrid: null,
    productCards: [],
    filterButtons: [],
    sortSelect: null,
    searchInput: null,
    pagination: null,
    loadMoreButton: null,
    productDetailModal: null,
    closeModal: null,
    loadingSpinner: null,
    noResults: null
  },

  // Initialize module
  init: function() {
    if (this.state.isInitialized) {
      Logger.debug('ProductsModule already initialized', { module: 'ProductsModule' });
      return;
    }

    Logger.time('ProductsModule_Init');

    try {
      this.cacheElements();
      this.setupEventListeners();
      this.checkBreakpoint();
      this.loadFromLocalStorage();
      this.initializeProducts();

      this.state.isInitialized = true;

      Logger.timeEnd('ProductsModule_Init', {
        threshold: 100,
        message: 'ProductsModule initialized successfully'
      });
      Logger.info('ProductsModule initialized successfully', { module: 'ProductsModule' });

    // EventManagerのメンテナンスを開始
    EventManager.startMaintenance(300000); // 5分間隔
    } catch (error) {
      ErrorHandler.handle('ProductsModule initialization error', error, {
        level: ErrorHandler.ERROR_LEVELS.ERROR,
        category: ErrorHandler.ERROR_CATEGORIES.MODULE,
        module: 'ProductsModule',
        userMessage: '製品モジュールの初期化に失敗しました。'
      });
    }
  },

  // DOM要素のキャッシュ
  cacheElements: function() {
    this.elements.productsContainer = TeaSalesApp.utils.querySelector(SELECTORS.PRODUCTS_CONTAINER);
    this.elements.productGrid = TeaSalesApp.utils.querySelector(SELECTORS.PRODUCT_GRID);
    this.elements.productCards = Array.from(TeaSalesApp.utils.querySelectorAll(SELECTORS.PRODUCT_CARD));
    this.elements.filterButtons = Array.from(TeaSalesApp.utils.querySelectorAll(SELECTORS.FILTER_BUTTONS));
    this.elements.sortSelect = TeaSalesApp.utils.querySelector(SELECTORS.SORT_SELECT);
    this.elements.searchInput = TeaSalesApp.utils.querySelector(SELECTORS.SEARCH_INPUT);
    this.elements.pagination = TeaSalesApp.utils.querySelector(SELECTORS.PAGINATION);
    this.elements.loadMoreButton = TeaSalesApp.utils.querySelector(SELECTORS.LOAD_MORE_BUTTON);
    this.elements.productDetailModal = TeaSalesApp.utils.querySelector(SELECTORS.PRODUCT_DETAIL_MODAL);
    this.elements.closeModal = TeaSalesApp.utils.querySelector(SELECTORS.CLOSE_MODAL);
    this.elements.loadingSpinner = TeaSalesApp.utils.querySelector(SELECTORS.LOADING_SPINNER);
    this.elements.noResults = TeaSalesApp.utils.querySelector(SELECTORS.NO_RESULTS);
  },

  // イベントリスナーの設定
  setupEventListeners: function() {
    this.setupFilterListeners();
    this.setupSortListener();
    this.setupSearchListener();
    this.setupProductCardListeners();
    this.setupModalListeners();
    this.setupScrollOptimization();
    this.setupResizeListener();
    this.setupKeyboardNavigation();
  },

  // Setup filter listeners
  setupFilterListeners: function() {
    this.elements.filterButtons.forEach(button => {
      this.addEventListener(button, EVENTS.CLICK, (e) => this.handleFilterClick(e));
    });

    this.state.filterHandler = TeaSalesApp.utils.debounce(() => {
      this.applyFilters();
    }, this.config.filterDebounceDelay);

    this.addEventListener(window, 'popstate', () => this.handleURLChange());
  },

  // Setup sort listener
  setupSortListener: function() {
    if (this.elements.sortSelect) {
      this.state.sortHandler = TeaSalesApp.utils.debounce(() => {
        this.handleSortChange();
      }, this.config.debounceDelay);

      this.addEventListener(this.elements.sortSelect, EVENTS.CHANGE, this.state.sortHandler);
    }
  },

  // Setup search listener
  setupSearchListener: function() {
    if (this.elements.searchInput) {
      this.state.searchHandler = TeaSalesApp.utils.debounce(() => {
        this.handleSearchInput();
      }, this.config.searchDebounceDelay);

      this.addEventListener(this.elements.searchInput, EVENTS.INPUT, this.state.searchHandler);
    }
  },

  // Setup product card listeners
  setupProductCardListeners: function() {
    this.elements.productCards.forEach(card => {
      this.addEventListener(card, EVENTS.CLICK, (e) => this.handleProductClick(e));
    });
  },

  // Setup modal listeners
  setupModalListeners: function() {
    if (this.elements.closeModal) {
      this.addEventListener(this.elements.closeModal, EVENTS.CLICK, () => this.closeProductDetail());
    }

    if (this.elements.productDetailModal) {
      this.addEventListener(this.elements.productDetailModal, EVENTS.CLICK, (e) => {
        if (e.target === this.elements.productDetailModal) {
          this.closeProductDetail();
        }
      });
    }
  },

  // Setup scroll optimization
  setupScrollOptimization: function() {
    if (this.config.enableLazyLoading) {
      this.setupLazyLoading();
    }

    if (this.config.enablePagination && this.elements.loadMoreButton) {
      this.state.scrollHandler = TeaSalesApp.utils.throttle(() => {
        this.handleScrollForPagination();
      }, this.config.throttleDelay);

      this.addEventListener(window, EVENTS.SCROLL, this.state.scrollHandler);
    }
  },

  // Setup resize listener
  setupResizeListener: function() {
    this.state.resizeHandler = TeaSalesApp.utils.debounce(() => {
      this.handleResize();
    }, this.config.debounceDelay);

    this.addEventListener(window, EVENTS.RESIZE, this.state.resizeHandler);
  },

  // Setup keyboard navigation
  setupKeyboardNavigation: function() {
    this.addEventListener(document, EVENTS.KEYDOWN, (e) => this.handleKeydown(e));
  },

  // Helper method to add event listeners with tracking - EventManagerを使用
  addEventListener: function(element, event, handler) {
    if (!element || !event || !handler) {
      return null;
    }

    const listenerId = EventManager.add(element, event, handler);
    if (listenerId) {
      this.state.eventListeners.set(listenerId, { listenerId, element, event, handler });
    }

    return listenerId;
  },

  // Helper method to remove event listeners with tracking - EventManagerを使用
  _removeEventListener: function(listenerId) {
    if (!listenerId) {
      return false;
    }

    const removed = EventManager.remove(listenerId);
    if (removed) {
      this.state.eventListeners.delete(listenerId);
    }

    return removed;
  },

  // Remove all event listeners - EventManagerを使用
  _removeAllEventListeners: function() {
    const removedCount = EventManager.removeAll();
    this.state.eventListeners.clear();

    Logger.debug(`EventManager: Removed ${removedCount} event listeners`);
  },

  // 製品データの初期化
  initializeProducts: function() {
    // サンプル製品データ
    const sampleProducts = [
      {
        id: 1,
        name: '煎茶',
        category: PRODUCT_CATEGORIES.GREEN_TEA,
        price: 1200,
        description: '新鮮な若芽から作られる日本を代表する緑茶',
        image: '/images/sencha.jpg',
        rating: 4.5,
        inStock: true,
        featured: true
      },
      {
        id: 2,
        name: '紅茶',
        category: PRODUCT_CATEGORIES.BLACK_TEA,
        price: 1000,
        description: '豊かな香りと深みのある味わいの紅茶',
        image: '/images/black-tea.jpg',
        rating: 4.3,
        inStock: true,
        featured: false
      },
      {
        id: 3,
        name: 'ウーロン茶',
        category: PRODUCT_CATEGORIES.OOLONG_TEA,
        price: 1500,
        description: '緑茶と紅茶の中間的な風味が特徴の半発酵茶',
        image: '/images/oolong.jpg',
        rating: 4.7,
        inStock: true,
        featured: true
      },
      {
        id: 4,
        name: 'カモミールティー',
        category: PRODUCT_CATEGORIES.HERBAL_TEA,
        price: 800,
        description: 'リラックス効果のあるハーブティー',
        image: '/images/chamomile.jpg',
        rating: 4.2,
        inStock: true,
        featured: false
      }
    ];

    this.state.products = sampleProducts;
    this.state.filteredProducts = [...sampleProducts];
    this.renderProducts();
  },

  // 製品カードのレンダリング
  renderProducts: function() {
    if (!this.elements.productGrid) return;

    this.showLoading();

    // 既存の製品カードをクリア
    this.elements.productGrid.innerHTML = '';

    // フィルタリングとソートを適用
    const productsToRender = this.getProductsToRender();

    if (productsToRender.length === 0) {
      this.showNoResults();
      this.hideLoading();
      return;
    }

    // 製品カードを作成
    productsToRender.forEach(product => {
      const productCard = this.createProductCard(product);
      this.elements.productGrid.appendChild(productCard);
    });

    this.hideLoading();
    this.updatePagination();
    this.setupLazyLoading();
  },

  // 製品カードの作成
  createProductCard: function(product) {
    const card = TeaSalesApp.utils.createElement('div', CLASSES.PRODUCT_CARD, {
      'data-product-id': product.id
    });

    const image = TeaSalesApp.utils.createElement('img', '', {
      src: product.image || '/images/placeholder.jpg',
      alt: product.name,
      loading: this.config.imageLoadingStrategy
    });

    const content = TeaSalesApp.utils.createElement('div', 'product-content');

    const title = TeaSalesApp.utils.createElement('h3', 'product-title');
    title.textContent = product.name;

    const category = TeaSalesApp.utils.createElement('span', 'product-category');
    category.textContent = product.category;

    const price = TeaSalesApp.utils.createElement('div', 'product-price');
    price.textContent = TeaSalesApp.helpers.formatPrice(product.price);

    const description = TeaSalesApp.utils.createElement('p', 'product-description');
    description.textContent = product.description;

    content.appendChild(title);
    content.appendChild(category);
    content.appendChild(price);
    content.appendChild(description);

    card.appendChild(image);
    card.appendChild(content);

    return card;
  },

  // レンダリング対象の製品を取得
  getProductsToRender: function() {
    let products = [...this.state.products];

    // 検索フィルターを適用
    if (this.state.searchQuery) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.state.searchQuery.toLowerCase())
      );
    }

    // カテゴリーフィルターを適用
    const selectedCategories = Object.keys(this.state.selectedFilters).filter(key =>
      this.state.selectedFilters[key] && key.startsWith('category_')
    );

    if (selectedCategories.length > 0) {
      products = products.filter(product => {
        const categoryKey = `category_${product.category}`;
        return this.state.selectedFilters[categoryKey];
      });
    }

    // 価格フィルターを適用
    if (this.state.selectedFilters.price_under_1000) {
      products = products.filter(product => product.price < 1000);
    }
    if (this.state.selectedFilters.price_1000_1500) {
      products = products.filter(product => product.price >= 1000 && product.price <= 1500);
    }
    if (this.state.selectedFilters.price_over_1500) {
      products = products.filter(product => product.price > 1500);
    }

    // 在庫フィルターを適用
    if (this.state.selectedFilters.in_stock_only) {
      products = products.filter(product => product.inStock);
    }

    // ソートを適用
    this.applySort(products);

    return products;
  },

  // ソートの適用
  applySort: function(products) {
    switch (this.state.currentSort) {
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
        break;
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
  },

  // フィルターの適用
  applyFilters: function() {
    this.state.filteredProducts = this.getProductsToRender();
    this.renderProducts();
    this.updateURL();
  },

  // 検索処理
  handleSearchInput: function() {
    if (!this.elements.searchInput) return;

    this.state.searchQuery = this.elements.searchInput.value.trim();
    this.applyFilters();
  },

  // ソート変更処理
  handleSortChange: function() {
    if (!this.elements.sortSelect) return;

    this.state.currentSort = this.elements.sortSelect.value;
    this.applyFilters();
  },

  // フィルタークリック処理
  handleFilterClick: function(event) {
    const button = event.currentTarget;
    const filterType = button.dataset.filterType;
    const filterValue = button.dataset.filterValue;

    if (!filterType || !filterValue) return;

    const filterKey = `${filterType}_${filterValue}`;
    this.state.selectedFilters[filterKey] = !this.state.selectedFilters[filterKey];

    // ボタンのアクティブ状態を更新
    TeaSalesApp.utils.toggleClass(button, CLASSES.ACTIVE);

    this.applyFilters();
  },

  // 製品クリック処理
  handleProductClick: function(event) {
    const card = event.currentTarget;
    const productId = parseInt(card.dataset.productId);

    if (productId) {
      this.showProductDetail(productId);
    }
  },

  // 製品詳細の表示
  showProductDetail: function(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    if (this.elements.productDetailModal) {
      this.populateProductModal(product);
      TeaSalesApp.utils.addClass(this.elements.productDetailModal, CLASSES.VISIBLE);
      TeaSalesApp.utils.setAria(this.elements.productDetailModal, ARIA.EXPANDED, 'true');
    }
  },

  // 製品モーダルにデータを設定
  populateProductModal: function(product) {
    const modal = this.elements.productDetailModal;
    if (!modal) return;

    const image = modal.querySelector(SELECTORS.PRODUCT_IMAGE);
    const title = modal.querySelector(SELECTORS.PRODUCT_TITLE);
    const price = modal.querySelector(SELECTORS.PRODUCT_PRICE);
    const description = modal.querySelector(SELECTORS.PRODUCT_DESCRIPTION);
    const category = modal.querySelector(SELECTORS.PRODUCT_CATEGORY);

    if (image) image.src = product.image || '/images/placeholder.jpg';
    if (image) image.alt = product.name;
    if (title) title.textContent = product.name;
    if (price) price.textContent = TeaSalesApp.helpers.formatPrice(product.price);
    if (description) description.textContent = product.description;
    if (category) category.textContent = product.category;
  },

  // 製品詳細を閉じる
  closeProductDetail: function() {
    if (this.elements.productDetailModal) {
      TeaSalesApp.utils.removeClass(this.elements.productDetailModal, CLASSES.VISIBLE);
      TeaSalesApp.utils.setAria(this.elements.productDetailModal, ARIA.EXPANDED, 'false');
    }
  },

  // キーボードイベント処理
  handleKeydown: function(event) {
    if (event.key === 'Escape' && this.elements.productDetailModal) {
      const isVisible = this.elements.productDetailModal.classList.contains(CLASSES.VISIBLE);
      if (isVisible) {
        event.preventDefault();
        this.closeProductDetail();
      }
    }
  },

  // スクロール処理
  handleScrollForPagination: function() {
    if (!this.config.enablePagination || !this.elements.loadMoreButton) return;

    const button = this.elements.loadMoreButton;
    const rect = button.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible && !this.state.isLoading && this.state.currentPage < this.state.totalPages) {
      this.loadMoreProducts();
    }
  },

  // リサイズ処理
  handleResize: function() {
    this.checkBreakpoint();
    this.adjustGridLayout();
  },

  // ブレークポイントのチェック
  checkBreakpoint: function() {
    this.state.isMobile = window.innerWidth < this.config.mobileBreakpoint;
    this.state.productsPerRow = this.state.isMobile ? 2 : this.config.maxProductsPerRow;
    this.adjustGridLayout();
  },

  // グリッドレイアウトの調整
  adjustGridLayout: function() {
    if (!this.elements.productGrid) return;

    // グリッドクラスの調整
    TeaSalesApp.utils.removeClass(this.elements.productGrid, CLASSES.GRID_2COL);
    TeaSalesApp.utils.removeClass(this.elements.productGrid, CLASSES.GRID_3COL);
    TeaSalesApp.utils.removeClass(this.elements.productGrid, CLASSES.GRID_4COL);

    if (this.state.isMobile) {
      TeaSalesApp.utils.addClass(this.elements.productGrid, CLASSES.GRID_2COL);
    } else if (this.state.productsPerRow === 3) {
      TeaSalesApp.utils.addClass(this.elements.productGrid, CLASSES.GRID_3COL);
    } else {
      TeaSalesApp.utils.addClass(this.elements.productGrid, CLASSES.GRID_4COL);
    }
  },

  // 遅延読み込みのセットアップ
  setupLazyLoading: function() {
    if (!this.config.enableLazyLoading || 'IntersectionObserver' in window === false) {
      return;
    }

    const images = this.elements.productGrid.querySelectorAll('img[loading="lazy"]');
    if (images.length === 0) return;

    this.state.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          this.state.imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    images.forEach(img => this.state.imageObserver.observe(img));
  },

  // ページネーションの更新
  updatePagination: function() {
    if (!this.config.enablePagination) return;

    const totalProducts = this.state.filteredProducts.length;
    this.state.totalPages = Math.ceil(totalProducts / this.config.productsPerPage);

    if (this.elements.loadMoreButton) {
      const shouldShow = this.state.currentPage < this.state.totalPages;
      this.elements.loadMoreButton.style.display = shouldShow ? 'block' : 'none';
    }
  },

  // さらに製品を読み込む
  loadMoreProducts: function() {
    if (this.state.isLoading || this.state.currentPage >= this.state.totalPages) return;

    this.state.isLoading = true;
    this.state.currentPage++;

    // 追加製品をレンダリング
    const startIndex = (this.state.currentPage - 1) * this.config.productsPerPage;
    const endIndex = startIndex + this.config.productsPerPage;
    const productsToAdd = this.state.filteredProducts.slice(startIndex, endIndex);

    productsToAdd.forEach(product => {
      const productCard = this.createProductCard(product);
      this.elements.productGrid.appendChild(productCard);
    });

    this.state.isLoading = false;
    this.updatePagination();
    this.setupLazyLoading();
  },

  // URLの更新
  updateURL: function() {
    const params = new URLSearchParams();

    if (this.state.searchQuery) {
      params.set('search', this.state.searchQuery);
    }

    if (this.state.currentSort !== this.config.defaultSort) {
      params.set('sort', this.state.currentSort);
    }

    Object.keys(this.state.selectedFilters).forEach(key => {
      if (this.state.selectedFilters[key]) {
        params.set(key, 'true');
      }
    });

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
  },

  // URL変更の処理
  handleURLChange: function() {
    const params = new URLSearchParams(window.location.search);

    this.state.searchQuery = params.get('search') || '';
    this.state.currentSort = params.get('sort') || this.config.defaultSort;

    // フィルターの状態を復元
    this.state.selectedFilters = {};
    params.forEach((value, key) => {
      if (key.startsWith('category_') || key.startsWith('price_') || key === 'in_stock_only') {
        this.state.selectedFilters[key] = value === 'true';
      }
    });

    this.applyFilters();
  },

  // ローディング表示
  showLoading: function() {
    if (this.elements.loadingSpinner) {
      TeaSalesApp.utils.addClass(this.elements.loadingSpinner, CLASSES.VISIBLE);
    }
    if (this.elements.productsContainer) {
      TeaSalesApp.utils.setAria(this.elements.productsContainer, ARIA.BUSY, 'true');
    }
  },

  // ローディング非表示
  hideLoading: function() {
    if (this.elements.loadingSpinner) {
      TeaSalesApp.utils.removeClass(this.elements.loadingSpinner, CLASSES.VISIBLE);
    }
    if (this.elements.productsContainer) {
      TeaSalesApp.utils.setAria(this.elements.productsContainer, ARIA.BUSY, 'false');
    }
  },

  // 結果なし表示
  showNoResults: function() {
    if (this.elements.noResults) {
      TeaSalesApp.utils.addClass(this.elements.noResults, CLASSES.VISIBLE);
    }
  },

  // 結果なし非表示
  hideNoResults: function() {
    if (this.elements.noResults) {
      TeaSalesApp.utils.removeClass(this.elements.noResults, CLASSES.VISIBLE);
    }
  },

  // 製品データのロード
  loadProducts: async function() {
    try {
      this.state.isLoading = true;
      this.showLoading();

      // キャッシュチェック
      const cachedData = this.getFromCache();
      if (cachedData) {
        this.state.products = cachedData;
        this.state.filteredProducts = [...cachedData];
        this.renderProducts();
        return;
      }

      // APIからデータを取得（モック）
      const products = await this.fetchProductsFromAPI();
      this.state.products = products;
      this.state.filteredProducts = [...products];

      // キャッシュに保存
      this.saveToCache(products);

      this.renderProducts();
    } catch (error) {
      this.handleFetchError(error);
    } finally {
      this.state.isLoading = false;
      this.hideLoading();
    }
  },

  // APIから製品データを取得
  fetchProductsFromAPI: async function() {
    // 実際のAPI呼び出しのモック
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.state.products);
      }, 500);
    });
  },

  // キャッシュに保存
  saveToCache: function(products) {
    const cacheData = {
      products,
      timestamp: Date.now()
    };
    TeaSalesApp.helpers.saveToLocalStorage(this.config.storageKey, cacheData);
    this.state.lastCacheTime = cacheData.timestamp;
  },

  // キャッシュから取得
  getFromCache: function() {
    const cachedData = TeaSalesApp.helpers.getFromLocalStorage(this.config.storageKey);
    if (!cachedData) return null;

    const now = Date.now();
    if (now - cachedData.timestamp > this.config.cacheTimeout) {
      return null;
    }

    return cachedData.products;
  },

  // ローカルストレージに保存
  saveToLocalStorage: function() {
    const data = {
      products: this.state.products,
      selectedFilters: this.state.selectedFilters,
      currentSort: this.state.currentSort,
      searchQuery: this.state.searchQuery
    };
    TeaSalesApp.helpers.saveToLocalStorage(`${this.config.storageKey}_state`, data);
  },

  // ローカルストレージから読み込み
  loadFromLocalStorage: function() {
    const data = TeaSalesApp.helpers.getFromLocalStorage(`${this.config.storageKey}_state`);
    if (data) {
      this.state.selectedFilters = data.selectedFilters || {};
      this.state.currentSort = data.currentSort || this.config.defaultSort;
      this.state.searchQuery = data.searchQuery || '';
    }
  },

  // 製品データの検証
  validateProduct: function(product) {
    const requiredFields = ['id', 'name', 'price', 'category'];
    const errors = [];

    requiredFields.forEach(field => {
      if (!product[field]) {
        errors.push(`${field} is required`);
      }
    });

    if (typeof product.price !== 'number' || product.price < 0) {
      errors.push('Price must be a positive number');
    }

    if (!Object.values(PRODUCT_CATEGORIES).includes(product.category)) {
      errors.push('Invalid category');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Error handling - ErrorHandlerを使用
  handleError: function(message, error, options = {}) {
    const errorLevel = options.level || ErrorHandler.ERROR_LEVELS.ERROR;
    const category = options.category || ErrorHandler.ERROR_CATEGORIES.MODULE;

    ErrorHandler.handle(message, error, {
      level: errorLevel,
      category: category,
      module: 'ProductsModule',
      userMessage: options.userMessage,
      additionalData: {
        ...options.additionalData,
        moduleState: {
          isMobile: this.state.isMobile,
          isLoading: this.state.isLoading,
          productsCount: this.state.products.length,
          isInitialized: this.state.isInitialized,
          eventListenersCount: this.state.eventListeners.size
        }
      }
    });
  },

  // Handle fetch errors
  handleFetchError: function(error) {
    this.handleError('Fetch error', error, {
      category: ErrorHandler.ERROR_CATEGORIES.NETWORK,
      userMessage: '製品データの取得に失敗しました。'
    });

    if (this.state.retryCount < this.config.maxRetries) {
      this.state.retryCount++;
      setTimeout(() => {
        this.loadProducts();
      }, this.config.retryDelay * this.state.retryCount);
    } else {
      this.showErrorToUser('製品データの読み込みに失敗しました。再試行してください。');
    }
  },

  // Handle validation errors
  handleValidationError: function(product, errors) {
    const errorMessage = `Validation error for product ${product.id}: ${errors.join(', ')}`;
    this.handleError(errorMessage, new Error(errorMessage), this.ERROR_LEVELS.WARN);
  },

  // Show error to user
  showErrorToUser: function(message) {
    if (this.elements.productsContainer) {
      const errorElement = TeaSalesApp.utils.createElement('div', 'error-message');
      errorElement.textContent = message;
      this.elements.productsContainer.appendChild(errorElement);

      setTimeout(() => {
        if (errorElement.parentNode) {
          errorElement.parentNode.removeChild(errorElement);
        }
      }, 5000);
    }
  },

  // Log performance metrics
  logPerformance: function(operation, duration) {
    if (!TeaSalesApp.config.debug) return;

    const timestamp = new Date().toISOString();
    Logger.debug(`ProductsModule Performance: ${operation} took ${duration}ms`, {
      timestamp,
      operation,
      duration,
      moduleState: {
        isMobile: this.state.isMobile,
        isLoading: this.state.isLoading,
        productsCount: this.state.products.length,
        eventListenersCount: this.state.eventListeners.size
      }
    });
  },

  // Log debug information
  logDebug: function(message, data = {}) {
    if (!TeaSalesApp.config.debug) return;

    const timestamp = new Date().toISOString();
    Logger.debug(`ProductsModule ${message}:`, {
      timestamp,
      ...data,
      moduleState: {
        isMobile: this.state.isMobile,
        isLoading: this.state.isLoading,
        productsCount: this.state.products.length,
        currentPage: this.state.currentPage,
        eventListenersCount: this.state.eventListeners.size
      }
    });
  },

  // ARIA属性の更新
  updateAriaAttributes: function() {
    if (this.elements.productsContainer) {
      TeaSalesApp.utils.setAria(this.elements.productsContainer, ARIA.BUSY, this.state.isLoading);
    }

    if (this.elements.productGrid) {
      TeaSalesApp.utils.setAria(this.elements.productGrid, ARIA.LIVE, 'polite');
      TeaSalesApp.utils.setAria(this.elements.productGrid, ARIA.ATOMIC, 'true');
    }
  },

  // フォーカス管理
  manageFocus: function(element) {
    if (element) {
      TeaSalesApp.utils.focus(element);
    }
  },

  // 製品のフィルタリング
  filterProducts: function(filters) {
    this.state.selectedFilters = { ...this.state.selectedFilters, ...filters };
    this.applyFilters();
  },

  // 製品のソート
  sortProducts: function(sortType) {
    this.state.currentSort = sortType;
    this.applyFilters();
  },

  // 製品の検索
  searchProducts: function(query) {
    this.state.searchQuery = query;
    this.applyFilters();
  },

  // 製品データの取得
  getProducts: function() {
    return this.state.products;
  },

  // フィルタリングされた製品の取得
  getFilteredProducts: function() {
    return this.state.filteredProducts;
  },

  // 現在の状態の取得
  getState: function() {
    return {
      isInitialized: this.state.isInitialized,
      isLoading: this.state.isLoading,
      productsCount: this.state.products.length,
      filteredProductsCount: this.state.filteredProducts.length,
      currentPage: this.state.currentPage,
      totalPages: this.state.totalPages,
      isMobile: this.state.isMobile,
      searchQuery: this.state.searchQuery,
      currentSort: this.state.currentSort
    };
  },

  // クリーンアップ
  cleanup: function() {
    try {
      // すべてのイベントリスナーを削除
      this._removeAllEventListeners();

      // IntersectionObserverをクリーンアップ
      if (this.state.imageObserver) {
        this.state.imageObserver.disconnect();
        this.state.imageObserver = null;
      }

      // 状態をリセット
      this.state.isInitialized = false;
      this.state.isLoading = false;
      this.state.retryCount = 0;
      this.state.eventListeners.clear();

      // 要素をクリア
      this.elements = {
        productsContainer: null,
        productGrid: null,
        productCards: [],
        filterButtons: [],
        sortSelect: null,
        searchInput: null,
        pagination: null,
        loadMoreButton: null,
        productDetailModal: null,
        closeModal: null,
        loadingSpinner: null,
        noResults: null
      };

      if (TeaSalesApp.config.debug) {
        Logger.info('ProductsModule cleaned up successfully');
      }
    } catch (error) {
      this.handleError('Cleanup error', error);
    }
  },

  // リソース解放
  releaseResources: function() {
    // メモリを解放
    this.state.products = [];
    this.state.filteredProducts = [];
    this.state.selectedFilters = {};

    // DOM参照を解放
    Object.keys(this.elements).forEach(key => {
      this.elements[key] = null;
    });
  },

  // Configuration validation method - ConfigValidatorを使用
  validateConfig: function(config) {
    const validationResult = ConfigValidator.validate(config, CONFIG_VALIDATION_SCHEMA, {
      strict: false,
      applyDefaults: false
    });

    if (!validationResult.valid) {
      return validationResult.errors.map(error => error.message);
    }

    return [];
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
      Logger.info('ProductsModule configuration updated:', this.config);
    }
  }
};

// グローバルスコープに公開
window.ProductsModule = ProductsModule;