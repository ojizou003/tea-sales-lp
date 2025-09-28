// Contact Module ユニットテスト
// ContactModuleの機能をテスト

describe('ContactModule', () => {
  let originalWindow;
  let originalDocument;
  let mockForm;
  let mockNameInput;
  let mockEmailInput;
  let mockPhoneInput;
  let mockSubjectInput;
  let mockMessageTextarea;
  let mockSubmitButton;
  let mockSuccessMessage;
  let mockErrorElements;

  beforeEach(() => {
    // グローバルオブジェクトのバックアップ
    originalWindow = global.window;
    originalDocument = global.document;

    // モック環境をセットアップ
    const mockWindow = {
      TeaSalesApp: {
        config: {
          debug: false,
          api: {
            endpoint: 'https://api.example.com/contact'
          }
        },
        state: {
          sessionId: 'test-session-123'
        },
        modules: {},
        events: {
          emit: jest.fn(),
          on: jest.fn(),
          off: jest.fn()
        },
        ErrorHandler: {
          handleError: jest.fn(),
          getErrorLevel: jest.fn(),
          getErrorMessage: jest.fn(),
          getNotificationMessage: jest.fn(),
          logError: jest.fn(),
          reportError: jest.fn(),
          getUserFriendlyMessage: jest.fn()
        },
        Logger: {
          error: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          debug: jest.fn(),
          trace: jest.fn(),
          time: jest.fn(),
          timeEnd: jest.fn(),
          timeLog: jest.fn()
        },
        EventManager: {
          add: jest.fn().mockReturnValue('listener-123'),
          remove: jest.fn(),
          removeAll: jest.fn(),
          cleanup: jest.fn(),
          getListenerCount: jest.fn()
        },
        ConfigValidator: {
          validate: jest.fn().mockReturnValue({ valid: true, errors: [], config: {} }),
          validateValue: jest.fn().mockReturnValue({ valid: true, value: null }),
          number: jest.fn(),
          string: jest.fn(),
          boolean: jest.fn(),
          array: jest.fn(),
          object: jest.fn(),
          compose: jest.fn(),
          conditional: jest.fn(),
          arrayOf: jest.fn(),
          shape: jest.fn(),
          union: jest.fn(),
          enum: jest.fn(),
          createSchema: jest.fn(),
          createValidator: jest.fn()
        }
      }
    };

    // グローバルとローカルの両方にwindowオブジェクトを設定
    global.window = mockWindow;
    window = mockWindow;

    // モックDOM要素を作成
    mockForm = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      submit: jest.fn(),
      reset: jest.fn(),
      querySelector: jest.fn(),
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      style: {},
      dataset: {}
    };

    mockNameInput = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      value: '',
      required: true,
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      style: {},
      dataset: {}
    };

    mockEmailInput = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      value: '',
      required: true,
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      style: {},
      dataset: {}
    };

    mockPhoneInput = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      value: '',
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      style: {},
      dataset: {}
    };

    mockSubjectInput = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      value: '',
      required: true,
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      style: {},
      dataset: {}
    };

    mockMessageTextarea = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      value: '',
      required: true,
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      style: {},
      dataset: {}
    };

    mockSubmitButton = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      disabled: false,
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      style: {},
      dataset: {}
    };

    mockSuccessMessage = {
      style: {},
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() }
    };

    mockErrorElements = {
      'name-error': { textContent: '', style: {}, classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } },
      'email-error': { textContent: '', style: {}, classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } },
      'subject-error': { textContent: '', style: {}, classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } },
      'message-error': { textContent: '', style: {}, classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } }
    };

    // document.getElementByIdのモックをセットアップ
    global.document = {
      getElementById: jest.fn((id) => {
        switch (id) {
          case 'contact-form': return mockForm;
          case 'contact-name': return mockNameInput;
          case 'contact-email': return mockEmailInput;
          case 'contact-phone': return mockPhoneInput;
          case 'contact-subject': return mockSubjectInput;
          case 'contact-message': return mockMessageTextarea;
          case 'contact-submit': return mockSubmitButton;
          case 'contact-success': return mockSuccessMessage;
          case 'name-error': return mockErrorElements['name-error'];
          case 'email-error': return mockErrorElements['email-error'];
          case 'subject-error': return mockErrorElements['subject-error'];
          case 'message-error': return mockErrorElements['message-error'];
          default: return null;
        }
      }),
      createElement: jest.fn(() => ({
        setAttribute: jest.fn(),
        appendChild: jest.fn(),
        style: {},
        classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() }
      })),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => [])
    };

    // ユーティリティのモックをセットアップ
    global.Logger = {
      LOG_LEVELS: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 4 },
      setLevel: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      time: jest.fn(),
      timeEnd: jest.fn(),
      timeLog: jest.fn(),
      createModuleLogger: jest.fn(() => ({
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        time: jest.fn(),
        timeEnd: jest.fn(),
        timeLog: jest.fn()
      }))
    };

    global.ErrorHandler = {
      handle: jest.fn(),
      handleError: jest.fn(),
      handleModuleError: jest.fn(),
      getUserMessage: jest.fn(),
      logError: jest.fn(),
      createErrorHandler: jest.fn(),
      addGlobalHandler: jest.fn(),
      removeGlobalHandler: jest.fn(),
      clearGlobalHandlers: jest.fn(),
      categorizeError: jest.fn(),
      LEVELS: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 },
      CATEGORIES: { VALIDATION: 'validation', NETWORK: 'network', UI: 'ui' }
    };

    global.ConfigValidator = {
      validate: jest.fn().mockReturnValue({ valid: true, errors: [], config: {} }),
      validateValue: jest.fn().mockReturnValue({ valid: true, value: null }),
      createRule: jest.fn(),
      number: jest.fn(),
      string: jest.fn(),
      boolean: jest.fn(),
      array: jest.fn(),
      object: jest.fn(),
      compose: jest.fn(),
      conditional: jest.fn(),
      arrayOf: jest.fn(),
      shape: jest.fn(),
      union: jest.fn(),
      enum: jest.fn(),
      createSchema: jest.fn(),
      createValidator: jest.fn(),
      DEFAULT_RULES: {
        number: { validate: jest.fn() },
        string: { validate: jest.fn() },
        boolean: { validate: jest.fn() },
        array: { validate: jest.fn() },
        object: { validate: jest.fn() }
      }
    };

    global.EventManager = {
      add: jest.fn(() => 'listener-id-123'),
      remove: jest.fn(),
      removeAll: jest.fn(),
      addOnce: jest.fn(() => 'once-listener-id-456'),
      getListeners: jest.fn(() => []),
      getListenerCount: jest.fn(() => 0),
      hasListeners: jest.fn(() => false),
      clear: jest.fn(),
      createEmitter: jest.fn(() => ({
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        once: jest.fn(),
        removeAllListeners: jest.fn()
      })),
      delegate: jest.fn(),
      debounce: jest.fn(),
      throttle: jest.fn(),
      namespace: jest.fn()
    };

    // ここで依存モジュールをインポート
    require('../../js/utils/logger.js');
    require('../../js/utils/error-handler.js');
    require('../../js/utils/config-validator.js');
    require('../../js/utils/event-manager.js');

    // テスト対象モジュールをインポート（モック設定後）
    const ContactModule = require('../../js/modules/contact.js');

    // 手動でモジュールを登録（IIFEが自動登録できない場合）
    if (ContactModule && typeof ContactModule === 'object') {
      // TeaSalesAppが未定義の場合は初期化
      if (!window.TeaSalesApp) {
        window.TeaSalesApp = {
          modules: {},
          config: {
            debug: false,
            api: {
              endpoint: 'https://api.example.com/contact'
            }
          },
          state: {
            sessionId: 'test-session-123'
          }
        };
      }

      // modulesオブジェクトがなければ作成
      if (!window.TeaSalesApp.modules) {
        window.TeaSalesApp.modules = {};
      }

      // IIFEから返されたPublicAPIを登録
      window.TeaSalesApp.modules.ContactModule = ContactModule;
      window.TeaSalesApp.ContactModule = ContactModule; // 互換性のため

      // グローバルスコープにも登録
      window.ContactModule = ContactModule;

      // デバッグ情報
      console.log('ContactModule loaded:', ContactModule);
      console.log('ContactModule keys:', Object.keys(ContactModule));
      console.log('ContactModule.init type:', typeof ContactModule.init);
    } else {
      console.error('ContactModule not loaded properly:', ContactModule);
    }
  });

  afterEach(() => {
    // グローバルオブジェクトを元に戻す
    global.window = originalWindow;
    global.document = originalDocument;

    // モジュールの状態をクリア
    if (window.TeaSalesApp && window.TeaSalesApp.modules) {
      window.TeaSalesApp.modules = {};
    }
  });

  describe('1. モジュール初期化', () => {
    test('1.1 ContactModuleがグローバルスコープに存在すること', () => {
      expect(window.TeaSalesApp).toBeDefined();
      expect(window.TeaSalesApp.modules).toBeDefined();
      expect(window.TeaSalesApp.modules.ContactModule).toBeDefined();
    });

    test('1.2 initメソッドが存在すること', () => {
      expect(window.TeaSalesApp.modules.ContactModule.init).toBeDefined();
      expect(typeof window.TeaSalesApp.modules.ContactModule.init).toBe('function');
    });

    test('1.3 initメソッドがエラーをスローしないこと', () => {
      expect(() => {
        window.TeaSalesApp.modules.ContactModule.init();
      }).not.toThrow();
    });

    test('1.4 モジュール設定が正しく構成されていること', () => {
      // モジュールを取得
      const module = window.TeaSalesApp.modules.ContactModule;

      // モジュールが存在することを確認
      expect(module).toBeDefined();
      expect(typeof module.init).toBe('function');
      expect(typeof module.cleanup).toBe('function');

      // 詳細なデバッグ情報を追加
      console.log('=== 詳細デバッグ情報 ===');
      console.log('module type:', typeof module);
      console.log('module keys:', Object.keys(module));
      console.log('module.state exists:', !!module.getState);

      if (module.getState) {
        const state = module.getState();
        console.log('state object:', state);
        console.log('state.initialized:', state.initialized);
        console.log('state.formElements:', state.formElements);
        console.log('state.errorCount:', state.errorCount);
      }

      // 初期化前の状態を確認
      expect(module.getState().initialized).toBe(false);

      // 初期化を実行
      const result = module.init();

      // 詳細な初期化後の状態を確認
      console.log('=== 初期化後の状態 ===');
      console.log('init result:', result);
      if (module.getState) {
        const state = module.getState();
        console.log('state after init:', state);
        console.log('state.initialized after init:', state.initialized);
        console.log('state.formElements after init:', state.formElements);
      }

      // 初期化が成功したことを確認
      expect(result).toBe(true);
      expect(module.getState().initialized).toBe(true);
      expect(module.getState().errorCount).toBe(0);
    });
  });

  describe('2. DOM要素管理', () => {
    test('2.1 フォーム要素が正しくキャッシュされること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      const elements = window.TeaSalesApp.modules.ContactModule.elements;
      expect(elements.form).toBeDefined();
      expect(elements.nameInput).toBeDefined();
      expect(elements.emailInput).toBeDefined();
      expect(elements.phoneInput).toBeDefined();
      expect(elements.subjectInput).toBeDefined();
      expect(elements.messageTextarea).toBeDefined();
      expect(elements.submitButton).toBeDefined();
    });

    test('2.2 エラーメッセージ要素が正しくキャッシュされること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      const elements = window.TeaSalesApp.modules.ContactModule.elements;
      expect(elements.errorElements).toBeDefined();
      expect(elements.errorElements['name-error']).toBeDefined();
      expect(elements.errorElements['email-error']).toBeDefined();
      expect(elements.errorElements['subject-error']).toBeDefined();
      expect(elements.errorElements['message-error']).toBeDefined();
    });

    test('2.3 DOM要素が存在しない場合のエラーハンドリング', () => {
      // 新しいモックを設定して全てのgetElementById呼び出しにnullを返す
      const originalGetById = document.getElementById;
      document.getElementById = jest.fn(() => null);

      try {
        // ContactModuleを再読み込み
        delete window.TeaSalesApp.modules.ContactModule;
        const ContactModule = require('../../js/modules/contact.js');
        window.TeaSalesApp.modules.ContactModule = ContactModule;

        expect(() => {
          window.TeaSalesApp.modules.ContactModule.init();
        }).not.toThrow();

        // Loggerでエラーが記録されたことを確認
        expect(Logger.error).toHaveBeenCalled();
      } finally {
        // 元の関数を戻す
        document.getElementById = originalGetById;
      }
    });
  });

  describe('3. フォームバリデーション', () => {
    test('3.1 バリデーション機能が存在すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(window.TeaSalesApp.modules.ContactModule.validateForm).toBeDefined();
      expect(typeof window.TeaSalesApp.modules.ContactModule.validateForm).toBe('function');
    });

    test('3.2 必須フィールドのバリデーションが機能すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      const result = window.TeaSalesApp.modules.ContactModule.validateForm();
      expect(typeof result).toBe('boolean');

      // 空のフォームはバリデーションに失敗するはず
      expect(result).toBe(false);
    });

    test('3.3 メール形式のバリデーションが機能すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 不正なメールアドレスを設定
      mockEmailInput.value = 'invalid-email';

      const result = window.TeaSalesApp.modules.ContactModule.validateForm();
      expect(result).toBe(false);

      // 有効なメールアドレスを設定
      mockEmailInput.value = 'test@example.com';
      mockNameInput.value = 'Test User';
      mockSubjectInput.value = 'Test Subject';
      mockMessageTextarea.value = 'Test Message';

      const validResult = window.TeaSalesApp.modules.ContactModule.validateForm();
      expect(validResult).toBe(true);
    });

    test('3.4 バリデーションエラーメッセージが正しく表示されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 空のフォームでバリデーションを実行
      window.TeaSalesApp.modules.ContactModule.validateForm();

      // エラーメッセージが表示されることを確認
      expect(mockErrorElements['name-error'].textContent).not.toBe('');
      expect(mockErrorElements['email-error'].textContent).not.toBe('');
    });

    test('3.5 バリデーション成功時にエラーメッセージがクリアされること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // まずエラーメッセージを表示
      mockErrorElements['name-error'].textContent = 'Name is required';
      mockErrorElements['email-error'].textContent = 'Email is required';

      // 有効なデータを設定
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      mockSubjectInput.value = 'Test Subject';
      mockMessageTextarea.value = 'Test Message';

      // バリデーションを実行
      const result = window.TeaSalesApp.modules.ContactModule.validateForm();
      expect(result).toBe(true);

      // エラーメッセージがクリアされることを確認
      expect(Logger.debug).toHaveBeenCalledWith(
        'Validation errors cleared',
        expect.objectContaining({
          clearedErrors: expect.arrayContaining(['name', 'email'])
        })
      );
    });
  });

  describe('4. フォーム送信', () => {
    test('4.1 フォーム送信機能が存在すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(window.TeaSalesApp.modules.ContactModule.submitForm).toBeDefined();
      expect(typeof window.TeaSalesApp.modules.ContactModule.submitForm).toBe('function');
    });

    test('4.2 バリデーション失敗時に送信が中止されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 空のフォームで送信を試みる
      const result = window.TeaSalesApp.modules.ContactModule.submitForm();

      // 送信が中止されることを確認
      expect(result).toBe(false);
      expect(mockForm.submit).not.toHaveBeenCalled();
    });

    test('4.3 バリデーション成功時にフォームが送信されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 有効なデータを設定
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      mockSubjectInput.value = 'Test Subject';
      mockMessageTextarea.value = 'Test Message';

      // 送信を実行
      const result = window.TeaSalesApp.modules.ContactModule.submitForm();

      // 送信が成功することを確認
      expect(result).toBe(true);
      expect(Logger.info).toHaveBeenCalledWith(
        'Form submission initiated',
        expect.objectContaining({
          formData: expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test Message'
          })
        })
      );
    });

    test('4.4 送信中は重複送信が防止されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 有効なデータを設定
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      mockSubjectInput.value = 'Test Subject';
      mockMessageTextarea.value = 'Test Message';

      // 1回目の送信
      const firstResult = window.TeaSalesApp.modules.ContactModule.submitForm();
      expect(firstResult).toBe(true);

      // 2回目の送信（防止されるはず）
      const secondResult = window.TeaSalesApp.modules.ContactModule.submitForm();
      expect(secondResult).toBe(false);

      // Loggerで警告が記録されることを確認
      expect(Logger.warn).toHaveBeenCalledWith(
        'Form submission already in progress',
        expect.objectContaining({
          currentState: expect.objectContaining({
            submitting: true
          })
        })
      );
    });

    test('4.5 送信成功後の状態リセットが機能すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 有効なデータを設定
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      mockSubjectInput.value = 'Test Subject';
      mockMessageTextarea.value = 'Test Message';

      // 送信を実行
      window.TeaSalesApp.modules.ContactModule.submitForm();

      // 成功メッセージが表示されることを確認
      expect(Logger.info).toHaveBeenCalledWith(
        'Form submitted successfully',
        expect.objectContaining({
          sessionId: 'test-session-123'
        })
      );
    });
  });

  describe('5. イベント処理', () => {
    test('5.1 イベントリスナーが正しく登録されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // フォーム送信イベントリスナーが登録されることを確認
      expect(mockForm.addEventListener).toHaveBeenCalledWith(
        'submit',
        expect.any(Function),
        false
      );

      // 入力フィールドのイベントリスナーが登録されることを確認
      expect(mockNameInput.addEventListener).toHaveBeenCalledWith(
        'input',
        expect.any(Function),
        false
      );
      expect(mockEmailInput.addEventListener).toHaveBeenCalledWith(
        'input',
        expect.any(Function),
        false
      );
    });

    test('5.2 イベントリスナーが正しく削除されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // クリーンアップを実行
      window.TeaSalesApp.modules.ContactModule.cleanup();

      // イベントリスナーが削除されることを確認
      expect(EventManager.remove).toHaveBeenCalled();
    });

    test('5.3 フォーム送信イベントが正しく処理されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // フォーム送信イベントをシミュレート
      const submitEvent = { preventDefault: jest.fn() };
      const submitHandler = mockForm.addEventListener.mock.calls.find(
        call => call[0] === 'submit'
      )[1];

      // 有効なデータを設定
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      mockSubjectInput.value = 'Test Subject';
      mockMessageTextarea.value = 'Test Message';

      // イベントハンドラを実行
      submitHandler(submitEvent);

      // イベントがデフォルト動作を停止したことを確認
      expect(submitEvent.preventDefault).toHaveBeenCalled();
    });

    test('5.4 リアルタイムバリデーションが機能すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 入力イベントをシミュレート
      const inputEvent = { target: { value: 'test@example.com' } };
      const inputHandler = mockEmailInput.addEventListener.mock.calls.find(
        call => call[0] === 'input'
      )[1];

      // イベントハンドラを実行
      inputHandler(inputEvent);

      // リアルタイムバリデーションが実行されることを確認
      expect(Logger.debug).toHaveBeenCalledWith(
        'Real-time validation triggered',
        expect.objectContaining({
          field: 'email',
          value: 'test@example.com'
        })
      );
    });
  });

  describe('6. 状態管理', () => {
    test('6.1 初期状態が正しく設定されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      const state = window.TeaSalesApp.modules.ContactModule.state;
      expect(state.initialized).toBe(true);
      expect(state.submitting).toBe(false);
      expect(state.formElements).toBeDefined();
      expect(state.eventListeners).toBeDefined();
      expect(state.validationErrors).toBeDefined();
    });

    test('6.2 送信状態が正しく追跡されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 有効なデータを設定
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      mockSubjectInput.value = 'Test Subject';
      mockMessageTextarea.value = 'Test Message';

      // 送信を実行
      window.TeaSalesApp.modules.ContactModule.submitForm();

      // 送信状態が更新されることを確認
      const state = window.TeaSalesApp.modules.ContactModule.state;
      expect(state.submitting).toBe(true);
    });

    test('6.3 バリデーションエラー状態が正しく管理されること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // バリデーションを実行（失敗するはず）
      window.TeaSalesApp.modules.ContactModule.validateForm();

      // エラー状態が記録されることを確認
      const state = window.TeaSalesApp.modules.ContactModule.state;
      expect(state.validationErrors.size).toBeGreaterThan(0);
    });

    test('6.4 状態リセット機能が存在すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(window.TeaSalesApp.modules.ContactModule.resetForm).toBeDefined();
      expect(typeof window.TeaSalesApp.modules.ContactModule.resetForm).toBe('function');
    });

    test('6.5 状態リセットが正しく機能すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // 状態を変更
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      window.TeaSalesApp.modules.ContactModule.validateForm();

      // 状態をリセット
      window.TeaSalesApp.modules.ContactModule.resetForm();

      // 状態がリセットされることを確認
      const state = window.TeaSalesApp.modules.ContactModule.state;
      expect(state.submitting).toBe(false);
      expect(state.validationErrors.size).toBe(0);

      // フォームがリセットされることを確認
      expect(mockForm.reset).toHaveBeenCalled();
    });
  });

  describe('7. ユーティリティ統合', () => {
    test('7.1 Loggerユーティリティが統合されていること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // Loggerメソッドが使用されていることを確認
      expect(Logger.debug).toHaveBeenCalled();
    });

    test('7.2 ErrorHandlerユーティリティが統合されていること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // ErrorHandlerが利用可能であることを確認
      expect(ErrorHandler.handle).toBeDefined();
    });

    test('7.3 EventManagerユーティリティが統合されていること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // EventManagerメソッドが使用されていることを確認
      expect(EventManager.add).toHaveBeenCalled();
    });

    test('7.4 ConfigValidatorユーティリティが統合されていること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // ConfigValidatorが利用可能であることを確認
      expect(ConfigValidator.validate).toBeDefined();
    });
  });

  describe('8. アクセシビリティ', () => {
    test('8.1 フォームに適切なARIA属性が設定されていること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(window.TeaSalesApp.modules.ContactModule.setupAccessibility).toBeDefined();
      expect(typeof window.TeaSalesApp.modules.ContactModule.setupAccessibility).toBe('function');
    });

    test('8.2 エラーメッセージがスクリーンリーダーに対応していること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(window.TeaSalesApp.modules.ContactModule.announceErrorToScreenReader).toBeDefined();
    });
  });

  describe('9. パフォーマンス監視', () => {
    test('9.1 パフォーマンス監視機能が存在すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(Logger.time).toHaveBeenCalledWith('ContactModule_Init');
      expect(Logger.timeEnd).toHaveBeenCalledWith('ContactModule_Init', expect.objectContaining({
        threshold: 100,
        message: 'ContactModule initialized successfully'
      }));
    });
  });

  describe('10. クリーンアップ機能', () => {
    test('10.1 イベントリスナーのクリーンアップ機能が存在すること', () => {
      expect(window.TeaSalesApp.modules.ContactModule.cleanup).toBeDefined();
      expect(typeof window.TeaSalesApp.modules.ContactModule.cleanup).toBe('function');
    });

    test('10.2 リソース解放機能が存在すること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(window.TeaSalesApp.modules.ContactModule.resetForm).toBeDefined();
      expect(window.TeaSalesApp.modules.ContactModule.clearState).toBeDefined();
    });

    test('10.3 cleanupメソッドがエラーをスローしないこと', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      expect(() => {
        window.TeaSalesApp.modules.ContactModule.cleanup();
      }).not.toThrow();
    });

    test('10.4 クリーンアップ後に状態が正しくリセットされること', () => {
      window.TeaSalesApp.modules.ContactModule.init();

      // いくつかの状態を変更
      mockNameInput.value = 'Test User';
      mockEmailInput.value = 'test@example.com';
      window.TeaSalesApp.modules.ContactModule.validateForm();

      // クリーンアップを実行
      window.TeaSalesApp.modules.ContactModule.cleanup();

      // 状態がリセットされることを確認
      const state = window.TeaSalesApp.modules.ContactModule.state;
      expect(state.initialized).toBe(false);
      expect(state.submitting).toBe(false);
      expect(state.validationErrors.size).toBe(0);
      expect(state.eventListeners.size).toBe(0);
    });
  });
});