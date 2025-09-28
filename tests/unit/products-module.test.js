/**
 * Products Module Tests
 * 製品モジュールのユニットテスト
 */

describe('ProductsModule', () => {
  let mockTeaSalesApp;
  let mockProductContainer;
  let mockProductElements;
  let originalDocument;
  let originalWindow;

  beforeEach(() => {
    // テスト環境のセットアップ
    jest.clearAllMocks();

    // 元のオブジェクトを保存
    originalDocument = global.document;
    originalWindow = global.window;

    // ユーティリティモジュールのモックを作成
    global.Logger = {
      LOG_LEVELS: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 4 },
      currentLevel: 2,
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      trace: jest.fn(),
      time: jest.fn(),
      timeEnd: jest.fn(),
      timeLog: jest.fn(),
      createModuleLogger: jest.fn(() => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        trace: jest.fn(),
        time: jest.fn(),
        timeEnd: jest.fn(),
        timeLog: jest.fn()
      }))
    };

    global.EventManager = {
      add: jest.fn(() => 'mock-listener-id'),
      remove: jest.fn(() => true),
      removeAll: jest.fn(() => 5),
      removeByElement: jest.fn(() => ['mock-listener-id']),
      getListenerCount: jest.fn(() => 0),
      getListenerInfo: jest.fn(),
      getAllListeners: jest.fn(() => []),
      checkMemoryLeaks: jest.fn(() => []),
      startMaintenance: jest.fn(),
      stopMaintenance: jest.fn(),
      cleanup: jest.fn(),
      getStats: jest.fn(() => ({ totalListeners: 0, eventTypes: {} }))
    };

    global.ConfigValidator = {
      validate: jest.fn(() => ({ valid: true, errors: [], config: {} })),
      validateValue: jest.fn(() => ({ valid: true, value: null })),
      createSchema: jest.fn(() => ({ properties: {} })),
      createValidator: jest.fn(() => jest.fn(() => ({ valid: true, errors: [], config: {} }))),
      number: jest.fn(() => ({ type: 'number' })),
      string: jest.fn(() => ({ type: 'string' })),
      boolean: jest.fn(() => ({ type: 'boolean' })),
      array: jest.fn(() => ({ type: 'array' })),
      object: jest.fn(() => ({ type: 'object' }))
    };

    global.ErrorHandler = {
      handle: jest.fn(() => ({})),
      handleNetworkError: jest.fn(() => ({})),
      handleValidationError: jest.fn(() => ({})),
      handleDOMError: jest.fn(() => ({})),
      handleModuleError: jest.fn(() => ({})),
      handlePerformanceError: jest.fn(() => ({})),
      getErrorLogs: jest.fn(() => []),
      getErrorStats: jest.fn(() => ({ total: 0, byLevel: {}, byCategory: {}, byModule: {} })),
      clearErrorLogs: jest.fn(),
      exportErrorLogs: jest.fn(() => '{}'),
      importErrorLogs: jest.fn(() => false),
      cleanup: jest.fn()
    };

    // モック要素の作成
    mockProductContainer = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      },
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      innerHTML: '',
      style: {}
    };

    mockProductElements = [
      {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(),
          toggle: jest.fn()
        },
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        hasAttribute: jest.fn(),
        removeAttribute: jest.fn(),
        dataset: {},
        style: {},
        innerHTML: '',
        textContent: '',
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        parentNode: null,
        parentElement: null
      }
    ];

    // TeaSalesAppユーティリティのモック
    mockTeaSalesApp = {
      config: {
        debug: false,
        animationDuration: 300,
        scrollOffset: 100,
        mobileBreakpoint: 768
      },
      utils: {
        querySelector: jest.fn((selector) => {
          if (selector === '.products-container') return mockProductContainer;
          return null;
        }),
        querySelectorAll: jest.fn((selector) => {
          if (selector === '.product-card') return mockProductElements;
          return [];
        }),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addClass: jest.fn(),
        removeClass: jest.fn(),
        toggleClass: jest.fn(),
        createElement: jest.fn((tag, className, attributes) => {
          const element = {
            tagName: tag.toUpperCase(),
            className: className || '',
            attributes: attributes || {},
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn(),
              toggle: jest.fn()
            },
            getAttribute: jest.fn((attr) => element.attributes[attr]),
            setAttribute: jest.fn((attr, value) => {
              element.attributes[attr] = value;
            }),
            hasAttribute: jest.fn((attr) => attr in element.attributes),
            removeAttribute: jest.fn((attr) => {
              delete element.attributes[attr];
            }),
            dataset: {},
            style: {},
            innerHTML: '',
            textContent: '',
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            parentNode: null,
            parentElement: null
          };
          return element;
        }),
        fetchData: jest.fn(),
        debounce: jest.fn((func) => func),
        throttle: jest.fn((func) => func)
      },
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
      },
      helpers: {
        formatPrice: jest.fn((price) => `¥${price.toLocaleString()}`),
        formatDate: jest.fn((date) => date.toISOString().split('T')[0]),
        validateEmail: jest.fn((email) => email.includes('@')),
        validatePhone: jest.fn((phone) => /^\d{10,11}$/.test(phone.replace(/[-\s]/g, ''))),
        saveToLocalStorage: jest.fn(),
        getFromLocalStorage: jest.fn(),
        removeFromLocalStorage: jest.fn()
      }
    };

    // グローバルオブジェクトを設定
    global.window = {
      ...window,
      innerWidth: 1200,
      innerHeight: 800,
      document: {
        ...document,
        querySelector: jest.fn((selector) => {
          if (selector === '.products-container') return mockProductContainer;
          return null;
        }),
        querySelectorAll: jest.fn((selector) => {
          if (selector === '.product-card') return mockProductElements;
          return [];
        }),
        createElement: jest.fn((tag) => {
          const element = {
            tagName: tag.toUpperCase(),
            className: '',
            attributes: {},
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn(),
              toggle: jest.fn()
            },
            getAttribute: jest.fn(),
            setAttribute: jest.fn(),
            hasAttribute: jest.fn(),
            removeAttribute: jest.fn(),
            dataset: {},
            style: {},
            innerHTML: '',
            textContent: '',
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            parentNode: null,
            parentElement: null
          };
          return element;
        }),
        createDocumentFragment: jest.fn(() => ({
          appendChild: jest.fn(),
          childNodes: []
        }))
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setTimeout: jest.fn(),
      clearTimeout: jest.fn(),
      scrollTo: jest.fn(),
      fetch: jest.fn()
    };

    global.document = global.window.document;
    global.TeaSalesApp = mockTeaSalesApp;
  });

  afterEach(() => {
    // クリーンアップ
    global.document = originalDocument;
    global.window = originalWindow;
    delete global.window.ProductsModule;
    delete global.Logger;
    delete global.EventManager;
    delete global.ConfigValidator;
    delete global.ErrorHandler;
  });

  describe('1. モジュール構造と基本設定', () => {
    test('1.1 ProductsModuleがグローバルスコープで利用可能であること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule).toBeDefined();
      expect(typeof window.ProductsModule).toBe('object');
    });

    test('1.2 ProductsModuleに必要なプロパティが存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.config).toBeDefined();
      expect(window.ProductsModule.state).toBeDefined();
      expect(window.ProductsModule.elements).toBeDefined();
      expect(window.ProductsModule.init).toBeDefined();
      expect(typeof window.ProductsModule.init).toBe('function');
    });

    test('1.3 設定オブジェクトに適切なデフォルト値が設定されていること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      const config = window.ProductsModule.config;
      expect(config.animationDuration).toBeGreaterThanOrEqual(0);
      expect(config.mobileBreakpoint).toBeGreaterThan(0);
      expect(config.productsPerPage).toBeGreaterThan(0);
      expect(config.filterEnabled).toBeDefined();
    });

    test('1.4 状態管理オブジェクトが初期化されていること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      const state = window.ProductsModule.state;
      expect(state.isInitialized).toBe(false);
      expect(state.products).toEqual([]);
      expect(state.filteredProducts).toEqual([]);
      expect(state.currentPage).toBe(1);
      expect(state.isLoading).toBe(false);
      expect(state.filters).toBeDefined();
    });
  });

  describe('2. 初期化機能', () => {
    test('2.1 initメソッドが存在し、関数であること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.init).toBeDefined();
      expect(typeof window.ProductsModule.init).toBe('function');
    });

    test('2.2 initメソッドが二重初期化を防止すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      const spy = jest.spyOn(console, 'log');
      window.ProductsModule.init();
      window.ProductsModule.init();

      expect(window.ProductsModule.state.isInitialized).toBe(true);
      spy.mockRestore();
    });

    test('2.3 initメソッドがエラーハンドリングを実装していること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      // DOM要素を存在しないように設定
      mockTeaSalesApp.utils.querySelector = jest.fn(() => null);

      expect(() => {
        window.ProductsModule.init();
      }).not.toThrow();
    });

    test('2.4 initメソッドがパフォーマンスモニタリングを実装していること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      // Loggerのtimeメソッドが呼ばれることを確認
      window.ProductsModule.init();

      expect(global.Logger.time).toHaveBeenCalledWith('ProductsModule_Init');
      expect(global.Logger.timeEnd).toHaveBeenCalledWith('ProductsModule_Init', {
        threshold: 100,
        message: 'ProductsModule initialized successfully'
      });
    });
  });

  describe('3. 製品データ管理', () => {
    test('3.1 製品データをロードする機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.loadProducts).toBeDefined();
      expect(typeof window.ProductsModule.loadProducts).toBe('function');
    });

    test('3.2 製品データのフィルタリング機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.filterProducts).toBeDefined();
      expect(typeof window.ProductsModule.filterProducts).toBe('function');
    });

    test('3.3 製品カードの動的生成機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.renderProducts).toBeDefined();
      expect(typeof window.ProductsModule.renderProducts).toBe('function');
    });

    test('3.4 製品データの検証機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.validateProduct).toBeDefined();
      expect(typeof window.ProductsModule.validateProduct).toBe('function');
    });
  });

  describe('4. UIインタラクション', () => {
    test('4.1 製品クリックイベントハンドラが存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.handleProductClick).toBeDefined();
      expect(typeof window.ProductsModule.handleProductClick).toBe('function');
    });

    test('4.2 製品詳細表示機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.showProductDetail).toBeDefined();
      expect(typeof window.ProductsModule.showProductDetail).toBe('function');
    });

    test('4.3 製品ソート機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.sortProducts).toBeDefined();
      expect(typeof window.ProductsModule.sortProducts).toBe('function');
    });

    test('4.4 製品検索機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.searchProducts).toBeDefined();
      expect(typeof window.ProductsModule.searchProducts).toBe('function');
    });
  });

  describe('5. レスポンシブ対応', () => {
    test('5.1 モバイル表示切り替え機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.handleResize).toBeDefined();
      expect(typeof window.ProductsModule.handleResize).toBe('function');
    });

    test('5.2 ブレークポイントチェック機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.checkBreakpoint).toBeDefined();
      expect(typeof window.ProductsModule.checkBreakpoint).toBe('function');
    });

    test('5.3 グリッドレイアウト調整機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.adjustGridLayout).toBeDefined();
      expect(typeof window.ProductsModule.adjustGridLayout).toBe('function');
    });
  });

  describe('6. アクセシビリティ', () => {
    test('6.1 キーボードナビゲーション対応が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.handleKeydown).toBeDefined();
      expect(typeof window.ProductsModule.handleKeydown).toBe('function');
    });

    test('6.2 ARIA属性管理機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.updateAriaAttributes).toBeDefined();
      expect(typeof window.ProductsModule.updateAriaAttributes).toBe('function');
    });

    test('6.3 フォーカス管理機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.manageFocus).toBeDefined();
      expect(typeof window.ProductsModule.manageFocus).toBe('function');
    });
  });

  describe('7. エラーハンドリング', () => {
    test('7.1 エラーハンドリングメソッドが存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.handleError).toBeDefined();
      expect(typeof window.ProductsModule.handleError).toBe('function');
    });

    test('7.2 データ取得エラー処理が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.handleFetchError).toBeDefined();
      expect(typeof window.ProductsModule.handleFetchError).toBe('function');
    });

    test('7.3 検証エラー処理が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.handleValidationError).toBeDefined();
      expect(typeof window.ProductsModule.handleValidationError).toBe('function');
    });
  });

  describe('8. パフォーマンス最適化', () => {
    test('8.1 遅延読み込み機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.setupLazyLoading).toBeDefined();
      expect(typeof window.ProductsModule.setupLazyLoading).toBe('function');
    });

    test('8.2 スクロールイベントの最適化が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.setupScrollOptimization).toBeDefined();
      expect(typeof window.ProductsModule.setupScrollOptimization).toBe('function');
    });

    test('8.3 パフォーマンスモニタリングが存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.logPerformance).toBeDefined();
      expect(typeof window.ProductsModule.logPerformance).toBe('function');
    });
  });

  describe('9. データ永続化', () => {
    test('9.1 ローカルストレージへの保存機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.saveToLocalStorage).toBeDefined();
      expect(typeof window.ProductsModule.saveToLocalStorage).toBe('function');
    });

    test('9.2 ローカルストレージからの読み込み機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.loadFromLocalStorage).toBeDefined();
      expect(typeof window.ProductsModule.loadFromLocalStorage).toBe('function');
    });
  });

  describe('10. クリーンアップ機能', () => {
    test('10.1 イベントリスナーのクリーンアップ機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.cleanup).toBeDefined();
      expect(typeof window.ProductsModule.cleanup).toBe('function');
    });

    test('10.2 リソース解放機能が存在すること', () => {
      // ProductsModuleを読み込む
      const fs = require('fs');
      const path = require('path');
      const productsModulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'products.js');

      if (fs.existsSync(productsModulePath)) {
        const productsModuleCode = fs.readFileSync(productsModulePath, 'utf8');
        eval(productsModuleCode);
      }

      expect(window.ProductsModule.releaseResources).toBeDefined();
      expect(typeof window.ProductsModule.releaseResources).toBe('function');
    });
  });
});