// Contact Module - お問い合わせフォームモジュール
// フォーム検証、送信、エラーハンドリング機能を提供

const ContactModule = (function() {
  // プライベート変数
  let config = {};
  let state = {
    initialized: false,
    submitting: false,
    formElements: {},
    eventListeners: new Map(),
    validationErrors: new Map()
  };

  // デフォルト設定
  const DEFAULT_CONFIG = {
    formId: 'contact-form',
    nameInputId: 'contact-name',
    emailInputId: 'contact-email',
    phoneInputId: 'contact-phone',
    subjectInputId: 'contact-subject',
    messageTextareaId: 'contact-message',
    submitButtonId: 'contact-submit',
    errorMessageClass: 'error-message',
    successMessageId: 'contact-success',
    apiEndpoint: '/api/contact',
    validation: {
      enableRealtime: true,
      showErrorMessages: true,
      scrollOnError: true
    },
    accessibility: {
      enableAria: true,
      enableLiveRegion: true,
      errorSummaryId: 'contact-error-summary'
    }
  };

  // 設定検証スキーマ
  const CONFIG_VALIDATION_SCHEMA = {
    properties: {
      formId: ConfigValidator.string({ required: true }),
      nameInputId: ConfigValidator.string({ required: true }),
      emailInputId: ConfigValidator.string({ required: true }),
      phoneInputId: ConfigValidator.string({ required: false }),
      subjectInputId: ConfigValidator.string({ required: true }),
      messageTextareaId: ConfigValidator.string({ required: true }),
      submitButtonId: ConfigValidator.string({ required: true }),
      errorMessageClass: ConfigValidator.string({ required: false, default: 'error-message' }),
      successMessageId: ConfigValidator.string({ required: false }),
      apiEndpoint: ConfigValidator.string({ required: true }),
      validation: ConfigValidator.object({
        required: false,
        properties: {
          enableRealtime: ConfigValidator.boolean({ required: false, default: true }),
          showErrorMessages: ConfigValidator.boolean({ required: false, default: true }),
          scrollOnError: ConfigValidator.boolean({ required: false, default: true })
        }
      }),
      accessibility: ConfigValidator.object({
        required: false,
        properties: {
          enableAria: ConfigValidator.boolean({ required: false, default: true }),
          enableLiveRegion: ConfigValidator.boolean({ required: false, default: true }),
          errorSummaryId: ConfigValidator.string({ required: false })
        }
      })
    }
  };

  // パブリックメソッド
  const PublicAPI = {
    /**
     * モジュールの初期化
     * @param {Object} customConfig - カスタム設定
     * @returns {boolean} 初期化成功かどうか
     */
    init: function(customConfig = {}) {
      Logger.time('ContactModule_Init');

      try {
        // 設定のマージと検証
        config = { ...DEFAULT_CONFIG, ...customConfig };
        const validationErrors = this.validateConfig(config);

        if (validationErrors.length > 0) {
          ErrorHandler.handleValidationError('ContactModule設定の検証に失敗しました', {
            errors: validationErrors,
            config
          });
          return false;
        }

        // DOM要素の取得
        if (!this.initializeDOMElements()) {
          ErrorHandler.handleDOMError('ContactModule: 必要なDOM要素が見つかりません', {
            formId: config.formId
          });
          return false;
        }

        // イベントリスナーの設定
        this.setupEventListeners();

        // アクセシビリティの設定
        if (config.accessibility.enableAria) {
          this.setupAccessibility();
        }

        // ライブリージョンの設定
        if (config.accessibility.enableLiveRegion) {
          this.setupLiveRegion();
        }

        state.initialized = true;
        Logger.info('ContactModule initialized successfully', { config });

        Logger.timeEnd('ContactModule_Init', {
          threshold: 100,
          message: 'ContactModule initialized successfully'
        });

        return true;
      } catch (error) {
        ErrorHandler.handleModuleError('ContactModuleの初期化に失敗しました', {
          error: error.message,
          stack: error.stack
        });
        Logger.timeEnd('ContactModule_Init', {
          threshold: 100,
          message: 'ContactModule initialization failed'
        });
        return false;
      }
    },

    /**
     * 設定の検証
     * @param {Object} configToValidate - 検証する設定
     * @returns {Array} エラーメッセージの配列
     */
    validateConfig: function(configToValidate) {
      const validationResult = ConfigValidator.validate(configToValidate, CONFIG_VALIDATION_SCHEMA, {
        strict: false,
        applyDefaults: false
      });

      if (!validationResult.valid) {
        return validationResult.errors.map(error => error.message);
      }

      return [];
    },

    /**
     * DOM要素の初期化
     * @returns {boolean} 成功かどうか
     */
    initializeDOMElements: function() {
      const elements = {};

      // フォーム要素の取得
      elements.form = document.getElementById(config.formId);
      elements.nameInput = document.getElementById(config.nameInputId);
      elements.emailInput = document.getElementById(config.emailInputId);
      elements.phoneInput = document.getElementById(config.phoneInputId);
      elements.subjectInput = document.getElementById(config.subjectInputId);
      elements.messageTextarea = document.getElementById(config.messageTextareaId);
      elements.submitButton = document.getElementById(config.submitButtonId);

      // エラーメッセージ要素の取得
      elements.errorMessages = document.getElementsByClassName(config.errorMessageClass);

      // 個別のエラーメッセージ要素も取得
      elements.errorElements = {
        'name-error': document.getElementById('name-error'),
        'email-error': document.getElementById('email-error'),
        'subject-error': document.getElementById('subject-error'),
        'message-error': document.getElementById('message-error')
      };

      // 成功メッセージ要素の取得
      if (config.successMessageId) {
        elements.successMessage = document.getElementById(config.successMessageId);
      }

      // 必須要素のチェック
      const requiredElements = ['form', 'nameInput', 'emailInput', 'subjectInput', 'messageTextarea', 'submitButton'];
      for (const elementName of requiredElements) {
        if (!elements[elementName]) {
          Logger.error(`Required element not found: ${elementName}`, { elementName, config });
          return false;
        }
      }

      state.formElements = elements;
      Logger.debug('DOM elements initialized', { elementCount: Object.keys(elements).length });

      return true;
    },

    /**
     * イベントリスナーの設定
     */
    setupEventListeners: function() {
      const { form, submitButton } = state.formElements;

      // フォーム送信イベント
      this.addEventListener(form, 'submit', this.handleFormSubmit.bind(this));

      // 送信ボタンクリックイベント
      this.addEventListener(submitButton, 'click', this.handleFormSubmit.bind(this));

      // リアルタイムバリデーション
      if (config.validation.enableRealtime) {
        this.setupRealtimeValidation();
      }

      Logger.debug('Event listeners setup complete');
    },

    /**
     * リアルタイムバリデーションの設定
     */
    setupRealtimeValidation: function() {
      const { nameInput, emailInput, phoneInput, subjectInput, messageTextarea } = state.formElements;

      const inputs = [
        { element: nameInput, type: 'name' },
        { element: emailInput, type: 'email' },
        { element: phoneInput, type: 'phone' },
        { element: subjectInput, type: 'subject' },
        { element: messageTextarea, type: 'message' }
      ];

      inputs.forEach(({ element, type }) => {
        // blurイベントでバリデーション
        this.addEventListener(element, 'blur', () => {
          this.validateField(type, element.value);
        });

        // inputイベントでエラークリア
        this.addEventListener(element, 'input', () => {
          this.clearFieldError(type);
        });
      });

      Logger.debug('Realtime validation setup complete');
    },

    /**
     * アクセシビリティの設定
     */
    setupAccessibility: function() {
      const { form, submitButton } = state.formElements;

      // フォームにrole属性を設定
      form.setAttribute('role', 'form');

      // 送信ボタンにaria属性を設定
      submitButton.setAttribute('aria-live', 'polite');

      Logger.debug('Accessibility setup complete');
    },

    /**
     * ライブリージョンの設定
     */
    setupLiveRegion: function() {
      let liveRegion = document.getElementById(config.accessibility.errorSummaryId);

      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = config.accessibility.errorSummaryId;
        liveRegion.setAttribute('role', 'alert');
        liveRegion.setAttribute('aria-live', 'assertive');
        liveRegion.className = 'sr-only';

        if (state.formElements.form) {
          state.formElements.form.appendChild(liveRegion);
        }
      }

      Logger.debug('Live region setup complete');
    },

    /**
     * イベントリスナーの追加（EventManagerを使用）
     */
    addEventListener: function(element, event, handler) {
      if (!element || !event || !handler) {
        return null;
      }

      const listenerId = EventManager.add(element, event, handler);
      if (listenerId) {
        state.eventListeners.set(listenerId, { listenerId, element, event, handler });
      }

      return listenerId;
    },

    /**
     * イベントリスナーの削除（EventManagerを使用）
     */
    removeEventListener: function(listenerId) {
      if (!listenerId) {
        return false;
      }

      const removed = EventManager.remove(listenerId);
      if (removed) {
        state.eventListeners.delete(listenerId);
      }

      return removed;
    },

    /**
     * フォーム送信ハンドラ
     * @param {Event} event - フォーム送信イベント
     */
    handleFormSubmit: function(event) {
      event.preventDefault();

      if (state.submitting) {
        Logger.warn('Form already submitting');
        return;
      }

      Logger.debug('Form submission started');

      if (this.validateAndSubmit()) {
        Logger.info('Form validation passed, submitting...');
      } else {
        Logger.warn('Form validation failed');
        if (config.validation.scrollOnError) {
          this.scrollToFirstError();
        }
      }
    },

    /**
     * フォームの検証と送信
     * @returns {boolean} 検証に通過したかどうか
     */
    validateAndSubmit: function() {
      // フォームデータの取得
      const formData = this.getFormData();

      // 全フィールドの検証
      const validationResults = this.validateAllFields(formData);

      if (!validationResults.isValid) {
        this.displayValidationErrors(validationResults.errors);
        return false;
      }

      // フォーム送信
      return this.submitForm(formData);
    },

    /**
     * フォームデータの取得
     * @returns {Object} フォームデータ
     */
    getFormData: function() {
      const { nameInput, emailInput, phoneInput, subjectInput, messageTextarea } = state.formElements;

      return {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput ? phoneInput.value.trim() : '',
        subject: subjectInput.value.trim(),
        message: messageTextarea.value.trim()
      };
    },

    /**
     * 全フィールドの検証
     * @param {Object} formData - フォームデータ
     * @returns {Object} 検証結果
     */
    validateAllFields: function(formData) {
      const errors = [];

      // 必須フィールドの検証
      if (!formData.name) {
        errors.push({ field: 'name', message: 'お名前は必須です' });
      }

      if (!formData.email) {
        errors.push({ field: 'email', message: 'メールアドレスは必須です' });
      } else if (!this.isValidEmail(formData.email)) {
        errors.push({ field: 'email', message: '有効なメールアドレスを入力してください' });
      }

      if (!formData.subject) {
        errors.push({ field: 'subject', message: '件名は必須です' });
      }

      if (!formData.message) {
        errors.push({ field: 'message', message: 'メッセージは必須です' });
      } else if (formData.message.length < 10) {
        errors.push({ field: 'message', message: 'メッセージは10文字以上で入力してください' });
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    /**
     * メールアドレスの検証
     * @param {string} email - メールアドレス
     * @returns {boolean} 有効かどうか
     */
    isValidEmail: function(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    /**
     * 単一フィールドの検証
     * @param {string} fieldType - フィールドタイプ
     * @param {string} value - 値
     * @returns {boolean} 有効かどうか
     */
    validateField: function(fieldType, value) {
      const trimmedValue = value.trim();
      let isValid = true;
      let errorMessage = '';

      switch (fieldType) {
        case 'name':
          if (!trimmedValue) {
            isValid = false;
            errorMessage = 'お名前は必須です';
          }
          break;

        case 'email':
          if (!trimmedValue) {
            isValid = false;
            errorMessage = 'メールアドレスは必須です';
          } else if (!this.isValidEmail(trimmedValue)) {
            isValid = false;
            errorMessage = '有効なメールアドレスを入力してください';
          }
          break;

        case 'phone':
          if (trimmedValue && !this.isValidPhone(trimmedValue)) {
            isValid = false;
            errorMessage = '有効な電話番号を入力してください';
          }
          break;

        case 'subject':
          if (!trimmedValue) {
            isValid = false;
            errorMessage = '件名は必須です';
          }
          break;

        case 'message':
          if (!trimmedValue) {
            isValid = false;
            errorMessage = 'メッセージは必須です';
          } else if (trimmedValue.length < 10) {
            isValid = false;
            errorMessage = 'メッセージは10文字以上で入力してください';
          }
          break;
      }

      if (!isValid) {
        state.validationErrors.set(fieldType, errorMessage);
        this.displayFieldError(fieldType, errorMessage);
      } else {
        state.validationErrors.delete(fieldType);
        this.clearFieldError(fieldType);
      }

      return isValid;
    },

    /**
     * 電話番号の検証
     * @param {string} phone - 電話番号
     * @returns {boolean} 有効かどうか
     */
    isValidPhone: function(phone) {
      const phoneRegex = /^[0-9+\-\s\(\)]+$/;
      return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    /**
     * 検証エラーの表示
     * @param {Array} errors - エラー配列
     */
    displayValidationErrors: function(errors) {
      errors.forEach(error => {
        state.validationErrors.set(error.field, error.message);
        this.displayFieldError(error.field, error.message);
      });

      // エラーサマリーの更新
      this.updateErrorSummary(errors);

      Logger.warn('Validation errors displayed', { errorCount: errors.length });
    },

    /**
     * フィールドエラーの表示
     * @param {string} fieldType - フィールドタイプ
     * @param {string} message - エラーメッセージ
     */
    displayFieldError: function(fieldType, message) {
      const element = this.getFieldElement(fieldType);
      if (!element) return;

      // エラーメッセージ要素の検索または作成
      let errorElement = element.parentNode.querySelector(`.${config.errorMessageClass}`);

      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = config.errorMessageClass;
        errorElement.setAttribute('role', 'alert');
        element.parentNode.insertBefore(errorElement, element.nextSibling);
      }

      errorElement.textContent = message;
      element.setAttribute('aria-invalid', 'true');
      element.setAttribute('aria-describedby', `${element.id}-error`);

      Logger.debug(`Field error displayed: ${fieldType}`, { fieldType, message });
    },

    /**
     * フィールドエラーのクリア
     * @param {string} fieldType - フィールドタイプ
     */
    clearFieldError: function(fieldType) {
      const element = this.getFieldElement(fieldType);
      if (!element) return;

      const errorElement = element.parentNode.querySelector(`.${config.errorMessageClass}`);
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.remove();
      }

      element.removeAttribute('aria-invalid');
      element.removeAttribute('aria-describedby');

      Logger.debug(`Field error cleared: ${fieldType}`, { fieldType });
    },

    /**
     * フィールド要素の取得
     * @param {string} fieldType - フィールドタイプ
     * @returns {HTMLElement|null} 要素
     */
    getFieldElement: function(fieldType) {
      const elementMap = {
        'name': state.formElements.nameInput,
        'email': state.formElements.emailInput,
        'phone': state.formElements.phoneInput,
        'subject': state.formElements.subjectInput,
        'message': state.formElements.messageTextarea
      };

      return elementMap[fieldType] || null;
    },

    /**
     * エラーサマリーの更新
     * @param {Array} errors - エラー配列
     */
    updateErrorSummary: function(errors) {
      if (!config.accessibility.enableLiveRegion) return;

      const errorSummary = document.getElementById(config.accessibility.errorSummaryId);
      if (!errorSummary) return;

      if (errors.length > 0) {
        const errorList = errors.map(error => error.message).join(', ');
        errorSummary.textContent = `入力エラー: ${errorList}`;
        errorSummary.setAttribute('aria-hidden', 'false');
      } else {
        errorSummary.textContent = '';
        errorSummary.setAttribute('aria-hidden', 'true');
      }
    },

    /**
     * 最初のエラーにスクロール
     */
    scrollToFirstError: function() {
      const firstError = state.validationErrors.keys().next().value;
      if (!firstError) return;

      const element = this.getFieldElement(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
        Logger.debug(`Scrolled to first error: ${firstError}`);
      }
    },

    /**
     * フォームの送信
     * @param {Object} formData - フォームデータ
     * @returns {boolean} 送信開始成功かどうか
     */
    submitForm: function(formData) {
      if (state.submitting) {
        Logger.warn('Form already submitting');
        return false;
      }

      state.submitting = true;
      this.setSubmitButtonState(true);

      Logger.info('Form submission started', { formData });

      // API呼び出しのシミュレーション
      return this.sendFormData(formData);
    },

    /**
     * フォームデータの送信
     * @param {Object} formData - フォームデータ
     * @returns {Promise} 送信Promise
     */
    sendFormData: function(formData) {
      Logger.time('ContactModule_API');

      return fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        Logger.timeEnd('ContactModule_API', {
          threshold: 1000,
          message: 'Form submission API call completed'
        });

        this.handleSubmissionSuccess(data);
        return true;
      })
      .catch(error => {
        Logger.timeEnd('ContactModule_API', {
          threshold: 1000,
          message: 'Form submission API call failed'
        });

        this.handleSubmissionError(error);
        return false;
      })
      .finally(() => {
        state.submitting = false;
        this.setSubmitButtonState(false);
      });
    },

    /**
     * 送信成功の処理
     * @param {Object} response - APIレスポンス
     */
    handleSubmissionSuccess: function(response) {
      Logger.info('Form submitted successfully', { response });

      // 成功メッセージの表示
      this.showSuccessMessage();

      // フォームのリセット
      this.resetForm();

      // カスタムイベントの発火
      this.emitCustomEvent('contactFormSubmitted', {
        formData: this.getFormData(),
        response
      });

      ErrorHandler.handle('ContactModule: フォームが正常に送信されました', {
        level: ErrorHandler.ERROR_LEVELS.INFO,
        category: ErrorHandler.ERROR_CATEGORIES.MODULE
      });
    },

    /**
     * 送信エラーの処理
     * @param {Error} error - エラーオブジェクト
     */
    handleSubmissionError: function(error) {
      Logger.error('Form submission failed', { error: error.message });

      // エラーメッセージの表示
      this.showSubmissionError('送信に失敗しました。しばらくしてから再度お試しください。');

      // エラーハンドリング
      ErrorHandler.handleNetworkError('ContactModule: フォーム送信に失敗しました', {
        error: error.message,
        endpoint: config.apiEndpoint
      });

      // カスタムイベントの発火
      this.emitCustomEvent('contactFormSubmitError', {
        error: error.message
      });
    },

    /**
     * 成功メッセージの表示
     */
    showSuccessMessage: function() {
      if (state.formElements.successMessage) {
        state.formElements.successMessage.style.display = 'block';
        state.formElements.successMessage.setAttribute('aria-hidden', 'false');
        Logger.debug('Success message displayed');
      }
    },

    /**
     * 送信エラーメッセージの表示
     * @param {string} message - エラーメッセージ
     */
    showSubmissionError: function(message) {
      // フォームレベルのエラーを表示
      const form = state.formElements.form;
      let errorElement = form.querySelector(`.${config.errorMessageClass}`);

      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = config.errorMessageClass;
        errorElement.setAttribute('role', 'alert');
        form.insertBefore(errorElement, form.firstChild);
      }

      errorElement.textContent = message;
      Logger.debug('Submission error displayed', { message });
    },

    /**
     * フォームのリセット
     */
    resetForm: function() {
      const { form, nameInput, emailInput, phoneInput, subjectInput, messageTextarea } = state.formElements;

      // フォーム値のリセット
      form.reset();

      // 検証エラーのクリア
      state.validationErrors.clear();

      // エラーメッセージのクリア
      const errorMessages = form.getElementsByClassName(config.errorMessageClass);
      Array.from(errorMessages).forEach(element => {
        element.textContent = '';
        element.remove();
      });

      // aria属性のクリア
      [nameInput, emailInput, phoneInput, subjectInput, messageTextarea].forEach(element => {
        if (element) {
          element.removeAttribute('aria-invalid');
          element.removeAttribute('aria-describedby');
        }
      });

      Logger.debug('Form reset complete');
    },

    /**
     * 送信ボタンの状態設定
     * @param {boolean} disabled - 無効化するかどうか
     */
    setSubmitButtonState: function(disabled) {
      const { submitButton } = state.formElements;
      if (submitButton) {
        submitButton.disabled = disabled;
        submitButton.textContent = disabled ? '送信中...' : '送信する';
        submitButton.setAttribute('aria-busy', disabled);

        Logger.debug(`Submit button state changed: ${disabled ? 'disabled' : 'enabled'}`);
      }
    },

    /**
     * カスタムイベントの発火
     * @param {string} eventName - イベント名
     * @param {Object} detail - イベント詳細
     */
    emitCustomEvent: function(eventName, detail = {}) {
      if (window.TeaSalesApp && window.TeaSalesApp.events) {
        window.TeaSalesApp.events.emit(eventName, {
          module: 'ContactModule',
          timestamp: new Date().toISOString(),
          ...detail
        });
      }
    },

    /**
     * 現在の状態の取得
     * @returns {Object} 現在の状態
     */
    getState: function() {
      return {
        initialized: state.initialized,
        submitting: state.submitting,
        validationErrors: Array.from(state.validationErrors.entries()),
        eventListenerCount: state.eventListeners.size
      };
    },

    /**
     * DOM要素の取得
     * @returns {Object} DOM要素オブジェクト
     */
    get elements() {
      return state.formElements;
    },

    /**
     * エラー要素の取得
     * @returns {Object} エラーメッセージ要素
     */
    get errorElements() {
      return state.formElements.errorElements || {};
    },

    /**
     * モジュールのクリーンアップ
     */
    cleanup: function() {
      // イベントリスナーの削除
      this.removeAllEventListeners();

      // 状態のリセット
      state.initialized = false;
      state.submitting = false;
      state.validationErrors.clear();

      Logger.info('ContactModule cleaned up successfully');
    },

    /**
     * 全イベントリスナーの削除
     */
    removeAllEventListeners: function() {
      const removedCount = EventManager.removeAll();
      state.eventListeners.clear();

      Logger.debug(`EventManager: Removed ${removedCount} event listeners`);
    },

    /**
     * フォームバリデーションのみを実行（送信しない）
     * @returns {boolean} バリデーション結果
     */
    validateForm: function() {
      if (!state.initialized) {
        Logger.warn('ContactModule not initialized');
        return false;
      }

      const formData = this.getFormData();
      const validationResult = this.validateAllFields(formData);

      // 検証結果を状態に保存
      state.validationErrors.clear();
      validationResult.errors.forEach(error => {
        state.validationErrors.set(error.field, error.message);
      });

      // UIにエラーを表示
      this.displayValidationErrors(validationResult.errors);

      Logger.debug('Form validation completed', {
        isValid: validationResult.isValid,
        errorCount: validationResult.errors.length
      });

      return validationResult.isValid;
    }
  };

  // TeaSalesAppに統合
  if (typeof window !== 'undefined' && window.TeaSalesApp) {
    if (!window.TeaSalesApp.modules) {
      window.TeaSalesApp.modules = {};
    }
    window.TeaSalesApp.modules.ContactModule = PublicAPI;
    window.TeaSalesApp.ContactModule = PublicAPI; // 互換性のため
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.ContactModule = PublicAPI;
  }

  // CommonJSモジュールとしてもエクスポート
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PublicAPI;
  }

  return PublicAPI;
})();