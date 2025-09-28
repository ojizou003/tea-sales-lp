/**
 * ContactForm - お問い合わせフォームを管理するクラス
 * バリデーション、送信、エラー/成功メッセージ表示を担当
 */
export class ContactForm {
  constructor() {
    this.formElement = document.getElementById('contact-form');
    this.fields = {
      name: document.getElementById('name'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
      subject: document.getElementById('subject'),
      message: document.getElementById('message')
    };
    this.errorElements = {
      name: document.getElementById('name-error'),
      email: document.getElementById('email-error'),
      subject: document.getElementById('subject-error'),
      message: document.getElementById('message-error')
    };
    this.successMessage = document.getElementById('success-message');
    this.submitButton = this.formElement?.querySelector('.submit-button');

    this.validationRules = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[ぁ-んァ-ヶー一-龯a-zA-Z\s]+$/,
        message: 'お名前は2-50文字で入力してください（漢字、ひらがな、カタカナ、英字のみ）'
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '有効なメールアドレスを入力してください'
      },
      phone: {
        required: false,
        pattern: /^[0-9]{10,11}$/,
        message: '電話番号はハイフンなしの10-11桁で入力してください'
      },
      subject: {
        required: true,
        minLength: 5,
        maxLength: 100,
        message: '件名は5-100文字で入力してください'
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        message: 'お問い合わせ内容は10-1000文字で入力してください'
      }
    };

    this.isSubmitting = false;
  }

  /**
   * ContactFormを初期化する
   */
  initialize() {
    if (!this.formElement) {
      console.warn('Contact form element not found');
      return;
    }

    this.setupEventListeners();
    this.setupRealtimeValidation();
    this.setupAccessibility();
  }

  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // フォーム送信イベント
    this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));

    // 各フィールドのバリデーションイベント
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      if (field) {
        // フォーカスが外れた時にバリデーション
        field.addEventListener('blur', () => this.validateField(fieldName));

        // 入力中にリアルタイムバリデーション
        field.addEventListener('input', this.debounce(() => {
          this.clearFieldError(fieldName);
        }, 500));
      }
    });
  }

  /**
   * リアルタイムバリデーションを設定
   */
  setupRealtimeValidation() {
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      if (field) {
        field.addEventListener('input', () => {
          if (this.errorElements[fieldName] && this.errorElements[fieldName].textContent) {
            this.debounce(() => this.validateField(fieldName), 800)();
          }
        });
      }
    });
  }

  /**
   * アクセシビリティを設定
   */
  setupAccessibility() {
    // エラーメッセージをaria-liveに設定
    Object.values(this.errorElements).forEach(errorEl => {
      if (errorEl) {
        errorEl.setAttribute('aria-live', 'polite');
        errorEl.setAttribute('role', 'alert');
      }
    });

    // 成功メッセージをaria-liveに設定
    if (this.successMessage) {
      this.successMessage.setAttribute('aria-live', 'polite');
      this.successMessage.setAttribute('role', 'status');
    }
  }

  /**
   * フォーム送信を処理
   * @param {Event} event - 送信イベント
   */
  async handleSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) return;

    // フォーム全体をバリデーション
    const isValid = this.validate();
    if (!isValid) return;

    this.isSubmitting = true;
    this.setLoadingState(true);

    try {
      const formData = this.getFormData();
      const success = await this.submit(formData);

      if (success) {
        this.showSuccess();
        this.resetForm();
      } else {
        this.showFormError('送信に失敗しました。時間をおいて再度お試しください。');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showFormError('送信中にエラーが発生しました。');
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false);
    }
  }

  /**
   * フォーム全体をバリデーション
   * @returns {boolean} バリデーション結果
   */
  validate() {
    let isValid = true;
    const firstInvalidField = null;

    Object.keys(this.fields).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false;
        if (!firstInvalidField && this.fields[fieldName]) {
          firstInvalidField = this.fields[fieldName];
        }
      }
    });

    // 最初の無効なフィールドにフォーカス
    if (firstInvalidField) {
      firstInvalidField.focus();
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  /**
   * 特定のフィールドをバリデーション
   * @param {string} fieldName - フィールド名
   * @returns {boolean} バリデーション結果
   */
  validateField(fieldName) {
    const field = this.fields[fieldName];
    const errorElement = this.errorElements[fieldName];
    const rule = this.validationRules[fieldName];

    if (!field || !rule) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // 必須チェック
    if (rule.required && !value) {
      isValid = false;
      errorMessage = 'この項目は必須です';
    }
    // 最小長チェック
    else if (value && rule.minLength && value.length < rule.minLength) {
      isValid = false;
      errorMessage = `${rule.minLength}文字以上で入力してください`;
    }
    // 最大長チェック
    else if (value && rule.maxLength && value.length > rule.maxLength) {
      isValid = false;
      errorMessage = `${rule.maxLength}文字以下で入力してください`;
    }
    // パターンチェック
    else if (value && rule.pattern && !rule.pattern.test(value)) {
      isValid = false;
      errorMessage = rule.message;
    }

    // エラー表示
    if (errorElement) {
      if (isValid) {
        this.clearFieldError(fieldName);
      } else {
        this.showFieldError(fieldName, errorMessage);
      }
    }

    // フィールドの状態を更新
    if (isValid) {
      field.setAttribute('aria-invalid', 'false');
      field.classList.remove('invalid');
    } else {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('invalid');
    }

    return isValid;
  }

  /**
   * フィールドエラーを表示
   * @param {string} fieldName - フィールド名
   * @param {string} message - エラーメッセージ
   */
  showFieldError(fieldName, message) {
    const errorElement = this.errorElements[fieldName];
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * フィールドエラーをクリア
   * @param {string} fieldName - フィールド名
   */
  clearFieldError(fieldName) {
    const errorElement = this.errorElements[fieldName];
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * フォームデータを取得
   * @returns {Object} フォームデータ
   */
  getFormData() {
    const formData = {};
    Object.keys(this.fields).forEach(fieldName => {
      if (this.fields[fieldName]) {
        formData[fieldName] = this.fields[fieldName].value.trim();
      }
    });
    return formData;
  }

  /**
   * フォームを送信（モック実装）
   * @param {Object} data - 送信データ
   * @returns {Promise<boolean>} 送信結果
   */
  async submit(data) {
    // 実際の実装ではAPIエンドポイントに送信
    console.log('Form data to submit:', data);

    // モック送信：80%の確率で成功
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2;
        resolve(isSuccess);
      }, 1500); // 1.5秒の遅延を模拟
    });
  }

  /**
   * 成功メッセージを表示
   */
  showSuccess() {
    if (this.successMessage) {
      this.successMessage.style.display = 'block';
      this.successMessage.textContent = 'お問い合わせありがとうございます。ご連絡いたします。';

      // 5秒後に非表示
      setTimeout(() => {
        this.successMessage.style.display = 'none';
      }, 5000);
    }

    // 成功を知らせるイベントを発行
    window.dispatchEvent(new CustomEvent('contactFormSuccess'));
  }

  /**
   * フォームエラーを表示
   * @param {string} message - エラーメッセージ
   */
  showFormError(message) {
    // フォームの上部にエラーメッセージを表示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error alert alert-error';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;

    const form = this.formElement;
    form.insertBefore(errorDiv, form.firstChild);

    // 5秒後に非表示
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * ローディング状態を設定
   * @param {boolean} isLoading - ローディング中かどうか
   */
  setLoadingState(isLoading) {
    if (this.submitButton) {
      this.submitButton.disabled = isLoading;
      this.submitButton.textContent = isLoading ? '送信中...' : '送信する';

      if (isLoading) {
        this.submitButton.classList.add('loading');
      } else {
        this.submitButton.classList.remove('loading');
      }
    }

    // フォーム全体の無効化/有効化
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.disabled = isLoading;
      }
    });
  }

  /**
   * フォームをリセット
   */
  resetForm() {
    this.formElement.reset();

    // すべてのエラーメッセージをクリア
    Object.keys(this.errorElements).forEach(fieldName => {
      this.clearFieldError(fieldName);
    });

    // aria-invalid属性をリセット
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.setAttribute('aria-invalid', 'false');
        field.classList.remove('invalid');
      }
    });
  }

  /**
   * デバウンス関数
   * @param {Function} func - 実行する関数
   * @param {number} wait - 待機時間（ms）
   * @returns {Function} デバウンスされた関数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * ContactFormを破棄
   */
  destroy() {
    if (this.formElement) {
      this.formElement.replaceWith(this.formElement.cloneNode(true));
    }
  }
}