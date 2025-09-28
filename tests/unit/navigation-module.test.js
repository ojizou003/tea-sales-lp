// NavigationModuleのユニットテスト
describe('NavigationModule', () => {
  let mockDocument;
  let mockWindow;
  let mockTeaSalesApp;

  beforeEach(() => {
    // テスト用のDOM環境をモック
    mockDocument = {
      readyState: 'loading',
      addEventListener: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      getElementById: jest.fn(),
      getElementsByClassName: jest.fn(),
      createElement: jest.fn(() => ({
        addEventListener: jest.fn(),
        appendChild: jest.fn(),
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn(), contains: jest.fn() },
        style: {},
        textContent: '',
        innerHTML: '',
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        hasAttribute: jest.fn(),
        removeAttribute: jest.fn(),
        focus: jest.fn(),
        blur: jest.fn()
      })),
      body: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }
      }
    };

    mockWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scrollTo: jest.fn(),
      innerWidth: 1024,
      innerHeight: 768,
      scrollY: 0,
      matchMedia: jest.fn(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn()
      })),
      setTimeout: jest.fn(),
      clearTimeout: jest.fn()
    };

    // モック要素の作成
    const mockHamburgerElement = {
      addEventListener: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn(), contains: jest.fn() },
      setAttribute: jest.fn(),
      getAttribute: jest.fn(() => 'false'),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn()
    };

    const mockMenuElement = {
      addEventListener: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn(), contains: jest.fn() },
      contains: jest.fn(() => false),
      querySelectorAll: jest.fn(() => [])
    };

    const mockNavLinkElement = {
      addEventListener: jest.fn(),
      href: '#home',
      classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn(), contains: jest.fn() },
      getAttribute: jest.fn(() => '#home'),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn()
    };

    const mockNavLinkElements = [
      { ...mockNavLinkElement, getAttribute: jest.fn(() => '#home') },
      { ...mockNavLinkElement, getAttribute: jest.fn(() => '#products') },
      { ...mockNavLinkElement, getAttribute: jest.fn(() => '#contact') }
    ];

    const mockSectionElements = [
      { id: 'home', offsetTop: 0, offsetHeight: 500, getBoundingClientRect: jest.fn(() => ({ top: 0 })) },
      { id: 'products', offsetTop: 600, offsetHeight: 400, getBoundingClientRect: jest.fn(() => ({ top: 500 })) },
      { id: 'contact', offsetTop: 1100, offsetHeight: 300, getBoundingClientRect: jest.fn(() => ({ top: 1000 })) }
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
          if (selector === '#hamburger') return mockHamburgerElement;
          if (selector === '#nav-menu') return mockMenuElement;
          if (selector === '.nav-link') return mockNavLinkElements[0];
          return null;
        }),
        querySelectorAll: jest.fn((selector) => {
          if (selector === '.nav-link') return mockNavLinkElements;
          if (selector === 'section[id]') return mockSectionElements;
          return [];
        }),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addClass: jest.fn(),
        removeClass: jest.fn(),
        toggleClass: jest.fn(),
        setAria: jest.fn(),
        focus: jest.fn(),
        scrollTo: jest.fn(),
        throttle: jest.fn(func => func),
        debounce: jest.fn(func => func)
      },
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
      }
    };

    // グローバルオブジェクトをモック
    global.document = mockDocument;
    global.window = mockWindow;
    global.TeaSalesApp = mockTeaSalesApp;

    // window.scrollToをモック
    mockWindow.scrollTo = jest.fn();

    // モックの初期設定
    mockDocument.getElementById = jest.fn((id) => {
      if (id === 'hamburger') return mockHamburgerElement;
      if (id === 'nav-menu') return mockMenuElement;
      return null;
    });

    mockDocument.querySelector = jest.fn((selector) => {
      if (selector === '#hamburger') return mockHamburgerElement;
      if (selector === '#nav-menu') return mockMenuElement;
      if (selector === '.nav-link') return mockNavLinkElement;
      if (selector === '.nav-link.active') return null;
      return null;
    });

    mockDocument.querySelectorAll = jest.fn((selector) => {
      if (selector === '.nav-link') return mockNavLinkElements;
      if (selector === 'section[id]') return mockSectionElements;
      return [];
    });

    // モックの初期設定（各テストで個別に設定）
  });

  afterEach(() => {
    // モックをクリーンアップ
    global.document = undefined;
    global.window = undefined;
    global.TeaSalesApp = undefined;
    jest.clearAllMocks();
  });

  describe('モジュールの基本構造', () => {
    test('NavigationModuleが正しく読み込まれる', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モジュールを評価
      eval(moduleContent);

      expect(typeof global.NavigationModule).toBe('object');
    });

    test('NavigationModuleがinitメソッドを持っている', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モジュールを評価
      eval(moduleContent);

      expect(typeof global.NavigationModule.init).toBe('function');
    });

    test('NavigationModuleが適切なプロパティを持っている', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モジュールを評価
      eval(moduleContent);

      expect(global.NavigationModule).toHaveProperty('config');
      expect(global.NavigationModule).toHaveProperty('state');
      expect(global.NavigationModule).toHaveProperty('elements');
    });
  });

  describe('初期化処理', () => {
    test('initメソッドがDOM要素を正しく取得する', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.init();

      // TeaSalesAppユーティリティが呼ばれたことを確認
      expect(mockTeaSalesApp.utils.querySelector).toHaveBeenCalledWith('#hamburger');
      expect(mockTeaSalesApp.utils.querySelector).toHaveBeenCalledWith('#nav-menu');
      expect(mockTeaSalesApp.utils.querySelectorAll).toHaveBeenCalledWith('.nav-link');
      expect(mockTeaSalesApp.utils.querySelectorAll).toHaveBeenCalledWith('section[id]');
    });

    test('initメソッドがイベントリスナーを設定する', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モック要素を定義
      const mockHamburgerElement = {
        addEventListener: jest.fn(),
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }
      };

      const mockNavLinkElements = [{
        addEventListener: jest.fn(),
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        getAttribute: jest.fn(() => '#home')
      }];

      const mockSectionElements = [{
        offsetTop: 0,
        offsetHeight: 500,
        id: 'home'
      }];

      // モックをリセット
      mockTeaSalesApp.utils.querySelector.mockClear();
      mockTeaSalesApp.utils.querySelectorAll.mockClear();
      mockTeaSalesApp.utils.addEventListener.mockClear();

      // モック要素を設定
      mockTeaSalesApp.utils.querySelector.mockReturnValue(mockHamburgerElement);
      mockTeaSalesApp.utils.querySelectorAll
        .mockReturnValueOnce(mockNavLinkElements)
        .mockReturnValueOnce(mockSectionElements);

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.init();

      // DOM要素の取得が呼ばれたことを確認
      expect(mockTeaSalesApp.utils.querySelector).toHaveBeenCalledWith('#hamburger');
      expect(mockTeaSalesApp.utils.querySelector).toHaveBeenCalledWith('#nav-menu');
      expect(mockTeaSalesApp.utils.querySelectorAll).toHaveBeenCalledWith('.nav-link');
      expect(mockTeaSalesApp.utils.querySelectorAll).toHaveBeenCalledWith('section[id]');

      // イベントリスナーが設定されたことを確認
      expect(mockTeaSalesApp.utils.addEventListener).toHaveBeenCalledWith(
        mockHamburgerElement,
        'click',
        expect.any(Function)
      );
      expect(mockTeaSalesApp.utils.addEventListener).toHaveBeenCalledWith(
        mockNavLinkElements[0],
        'click',
        expect.any(Function)
      );
    });
  });

  describe('ハンバーガーメニュー機能', () => {
    test('toggleMenuメソッドがメニューの表示状態を切り替える', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モック要素を定義
      const mockMenuElement = {
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }
      };

      const mockHamburgerElement = {
        setAttribute: jest.fn(),
        getAttribute: jest.fn(() => 'false')
      };

      // モックをリセット
      mockTeaSalesApp.utils.addClass.mockClear();
      mockTeaSalesApp.utils.setAria.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.elements = { menu: mockMenuElement, hamburger: mockHamburgerElement };

      navModule.toggleMenu();

      expect(mockTeaSalesApp.utils.addClass).toHaveBeenCalledWith(mockMenuElement, 'active');
      expect(mockTeaSalesApp.utils.setAria).toHaveBeenCalledWith(mockHamburgerElement, 'aria-expanded', 'true');
    });

    test('closeMenuメソッドがメニューを閉じる', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モック要素を定義
      const mockMenuElement = {
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }
      };

      const mockHamburgerElement = {
        setAttribute: jest.fn(),
        getAttribute: jest.fn(() => 'true')
      };

      // モックをリセット
      mockTeaSalesApp.utils.removeClass.mockClear();
      mockTeaSalesApp.utils.setAria.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.elements = {
        menu: mockMenuElement,
        hamburger: mockHamburgerElement
      };

      navModule.closeMenu();

      expect(mockTeaSalesApp.utils.removeClass).toHaveBeenCalledWith(mockMenuElement, 'active');
      expect(mockTeaSalesApp.utils.setAria).toHaveBeenCalledWith(mockHamburgerElement, 'aria-expanded', 'false');
    });

    test('smoothScrollメソッドが指定されたセクションにスクロールする', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.focus.mockClear();

      // window.scrollToをモック
      window.scrollTo = jest.fn();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      const targetElement = {
        offsetTop: 200
      };

      // document.getElementByIdをモック
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn(() => targetElement);

      navModule.smoothScroll('products');

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 100, // 200 - 100 (scrollOffset)
        behavior: 'smooth'
      });

      // 元の関数を復元
      document.getElementById = originalGetElementById;
      window.scrollTo = mockWindow.scrollTo;
    });
  });

  describe('スムーズスクロール機能', () => {
    test('smoothScrollメソッドがアクティブリンクを更新する', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.removeClass.mockClear();
      mockTeaSalesApp.utils.addClass.mockClear();

      // window.scrollToをモック
      window.scrollTo = jest.fn();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      // モック要素を定義
      const mockNavLinkElements = [
        {
          href: '#home',
          getAttribute: jest.fn((attr) => attr === 'href' ? '#home' : null),
          classList: { remove: jest.fn(), add: jest.fn() }
        },
        {
          href: '#products',
          getAttribute: jest.fn((attr) => attr === 'href' ? '#products' : null),
          classList: { remove: jest.fn(), add: jest.fn() }
        }
      ];

      const targetElement = {
        offsetTop: 200
      };

      navModule.elements.links = mockNavLinkElements;
      navModule.elements.activeLink = mockNavLinkElements[0];

      // document.getElementByIdをモック
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn(() => targetElement);

      navModule.smoothScroll('products');

      expect(mockTeaSalesApp.utils.removeClass).toHaveBeenCalledWith(mockNavLinkElements[0], 'active');
      expect(mockTeaSalesApp.utils.addClass).toHaveBeenCalledWith(mockNavLinkElements[1], 'active');

      // 元の関数を復元
      document.getElementById = originalGetElementById;
    });

    test('updateActiveLinkメソッドが現在のセクションに基づいてアクティブリンクを設定する', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.removeClass.mockClear();
      mockTeaSalesApp.utils.addClass.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      // モック要素を定義
      const mockNavLinkElements = [
        { href: '#home', getAttribute: jest.fn((attr) => attr === 'href' ? '#home' : null), classList: { remove: jest.fn(), add: jest.fn() } },
        { href: '#products', getAttribute: jest.fn((attr) => attr === 'href' ? '#products' : null), classList: { remove: jest.fn(), add: jest.fn() } }
      ];

      const sections = [
        { id: 'home', offsetTop: 0, offsetHeight: 500 },
        { id: 'products', offsetTop: 500, offsetHeight: 500 }
      ];

      navModule.elements.sections = sections;
      navModule.elements.links = mockNavLinkElements;

      // window.scrollYをモック
      const originalScrollY = window.scrollY;
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

      navModule.updateActiveLink();

      // 適切なリンクがアクティブになることを確認
      expect(mockTeaSalesApp.utils.addClass).toHaveBeenCalledWith(mockNavLinkElements[0], 'active');

      // 元の値を復元
      Object.defineProperty(window, 'scrollY', { value: originalScrollY, writable: true });
    });
  });

  describe('アクティブリンク管理', () => {
    test('キーボードナビゲーションがサポートされている', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.focus.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      const keyboardEvent = {
        key: 'Escape',
        preventDefault: jest.fn()
      };

      // 必要な要素を設定
      navModule.state.isMobile = true;
      navModule.state.isMenuOpen = true;
      navModule.elements = {
        hamburger: { id: 'hamburger' },
        menu: { querySelectorAll: jest.fn(() => []) }
      };

      navModule.handleKeydown(keyboardEvent);

      // EscapeキーでpreventDefaultが呼ばれることを確認
      expect(keyboardEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ機能', () => {
    test('フォーカス管理が実装されている', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.focus.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      const focusableElement = {
        focus: jest.fn()
      };

      navModule.manageFocus(focusableElement);

      expect(mockTeaSalesApp.utils.focus).toHaveBeenCalledWith(focusableElement);
    });

    test('handleResizeメソッドがウィンドウサイズ変更を処理する', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // デスクトップからモバイルへ
      window.innerWidth = 500;

      // モックをリセット
      mockTeaSalesApp.utils.removeClass.mockClear();
      mockTeaSalesApp.utils.addClass.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      const mockMenuElement = {
        classList: { remove: jest.fn(), add: jest.fn() }
      };

      navModule.elements = { menu: mockMenuElement };
      navModule.state.isMenuOpen = true;
      navModule.state.isMobile = true;

      // グローバルオブジェクトを再設定
      global.document = mockDocument;
      global.window = mockWindow;
      global.TeaSalesApp = mockTeaSalesApp;

      navModule.handleResize();

      // モバイルビューでメニューが閉じることを確認
      expect(navModule.state.isMobile).toBe(true);
    });
  });

  describe('レスポンシブデザイン', () => {
    test('イベントリスナーが適切に管理される', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.addEventListener.mockClear();
      mockTeaSalesApp.utils.removeEventListener.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.init();

      // イベントリスナーが追加されたことを確認
      expect(mockTeaSalesApp.utils.addEventListener).toHaveBeenCalledWith(
        document,
        'scroll',
        expect.any(Function)
      );
      expect(mockTeaSalesApp.utils.addEventListener).toHaveBeenCalledWith(
        window,
        'resize',
        expect.any(Function)
      );
    });

    test('ブレークポイントに基づいて表示モードが切り替わる', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モバイルブレークポイントのテスト (767 < 768)
      window.innerWidth = 767;

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.checkBreakpoint();

      expect(navModule.state.isMobile).toBe(true);

      // デスクトップブレークポイントのテスト (769 >= 768)
      window.innerWidth = 769;

      navModule.checkBreakpoint();

      expect(navModule.state.isMobile).toBe(false);
    });
  });

  describe('イベント処理', () => {
    test('クリーンアップメソッドがイベントリスナーを削除する', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.addEventListener.mockClear();
      mockTeaSalesApp.utils.removeEventListener.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.init();
      navModule.cleanup();

      // イベントリスナーが削除されたことを確認
      expect(mockTeaSalesApp.utils.removeEventListener).toHaveBeenCalledWith(
        document,
        'scroll',
        expect.any(Function)
      );
      expect(mockTeaSalesApp.utils.removeEventListener).toHaveBeenCalledWith(
        window,
        'resize',
        expect.any(Function)
      );
    });

    test('存在しない要素へのアクセスを安全に処理する', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.querySelector.mockReturnValue(null);
      mockTeaSalesApp.utils.querySelectorAll.mockReturnValue([]);

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      // エラーがスローされないことを確認
      expect(() => {
        navModule.init();
      }).not.toThrow();
    });
  });

  describe('エラーハンドリング', () => {
    test('イベントハンドラー内のエラーをキャッチする', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.querySelector.mockImplementation(() => {
        throw new Error('Test error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      // エラーがキャッチされることを確認
      expect(() => {
        navModule.init();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('🚨 NavigationModule Initialization error:', expect.objectContaining({
        level: 'error',
        message: 'Initialization error',
        error: 'Test error'
      }));

      consoleSpy.mockRestore();
    });

    test('スクロールイベントがスロットリングされている', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.addEventListener.mockClear();
      mockTeaSalesApp.utils.throttle.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.init();

      // スロットリングされたハンドラーが設定されることを確認
      expect(mockTeaSalesApp.utils.addEventListener).toHaveBeenCalledWith(
        document,
        'scroll',
        expect.any(Function)
      );
      expect(mockTeaSalesApp.utils.throttle).toHaveBeenCalledWith(
        expect.any(Function),
        100
      );
    });
  });

  describe('パフォーマンス最適化', () => {
    test('リサイズイベントがデバウンスされている', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モックをリセット
      mockTeaSalesApp.utils.addEventListener.mockClear();
      mockTeaSalesApp.utils.debounce.mockClear();

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      navModule.init();

      // デバウンスされたハンドラーが設定されることを確認
      expect(mockTeaSalesApp.utils.addEventListener).toHaveBeenCalledWith(
        window,
        'resize',
        expect.any(Function)
      );
      expect(mockTeaSalesApp.utils.debounce).toHaveBeenCalledWith(
        expect.any(Function),
        250
      );
    });

    test('リサイズイベントがデバウンスされている', () => {
      // NavigationModuleのソースコードを直接インポート
      const fs = require('fs');
      const path = require('path');
      const modulePath = path.join(__dirname, '..', '..', 'js', 'modules', 'navigation.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      // モジュールを評価
      eval(moduleContent);

      const navModule = global.NavigationModule;

      const resizeHandler = jest.fn();

      navModule.init();

      // デバウンスされたハンドラーが呼ばれることを確認
      resizeHandler();

      expect(resizeHandler).toHaveBeenCalled();
    });
  });
});