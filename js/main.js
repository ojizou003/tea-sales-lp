/**
 * Tea Sales LP - メインアプリケーション
 * ES6モジュール形式で実装
 */

// ユーティリティ関数
export const Utils = {
  createElement: function(tag, className = '', attributes = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;

    // 属性の設定
    Object.keys(attributes).forEach(key => {
      if (key === 'dataset') {
        Object.keys(attributes.dataset).forEach(dataKey => {
          element.dataset[dataKey] = attributes.dataset[dataKey];
        });
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });

    return element;
  },

  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle: function(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // DOM要素を安全に取得
  querySelector: function(selector) {
    return document.querySelector(selector);
  },

  querySelectorAll: function(selector) {
    return document.querySelectorAll(selector);
  },

  // イベントリスナーの安全な追加
  addEventListener: function(element, event, handler, options = {}) {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler, options);
    }
  },

  // クラスの安全な操作
  addClass: function(element, className) {
    if (element && element.classList) {
      element.classList.add(className);
    }
  },

  removeClass: function(element, className) {
    if (element && element.classList) {
      element.classList.remove(className);
    }
  },

  toggleClass: function(element, className) {
    if (element && element.classList) {
      element.classList.toggle(className);
    }
  },

  // ARIA属性の操作
  setAria: function(element, attribute, value) {
    if (element) {
      element.setAttribute(`aria-${attribute}`, value);
    }
  },

  // フォーカス管理
  focus: function(element) {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  // スクロール処理
  scrollTo: function(element, options = {}) {
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options
      });
    }
  },

  // データ取得
  fetchData: async function(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
};

// ヘルパー関数
export const Helpers = {
  // フォーマット関数
  formatPrice: function(price) {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price);
  },

  formatDate: function(date) {
    return new Intl.DateTimeFormat('ja-JP').format(date);
  },

  // バリデーション
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone: function(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone.replace(/[-\s]/g, ''));
  },

  // ローカルストレージ
  saveToLocalStorage: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage error:', error);
      return false;
    }
  },

  getFromLocalStorage: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('LocalStorage error:', error);
      return null;
    }
  },

  removeFromLocalStorage: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage error:', error);
      return false;
    }
  }
};

// イベントシステム
export const EventEmitter = {
  on: function(eventName, handler) {
    if (typeof window.addEventListener === 'function') {
      window.addEventListener(eventName, handler);
    }
  },

  off: function(eventName, handler) {
    if (typeof window.removeEventListener === 'function') {
      window.removeEventListener(eventName, handler);
    }
  },

  emit: function(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(event);
    }
  }
};

// 設定オブジェクト
export const Config = {
  debug: false,
  animationDuration: 300,
  scrollOffset: 100,
  mobileBreakpoint: 768
};

// メインアプリケーションクラス
export class TeaSalesApp {
  constructor() {
    this.config = Config;
    this.utils = Utils;
    this.helpers = Helpers;
    this.events = EventEmitter;
    this.modules = new Map();
  }

  /**
   * アプリケーションを初期化
   */
  async init() {
    if (this.config.debug) {
      console.log('アプリケーションを初期化中...');
    }

    try {
      // 各モジュールを初期化
      await this.initModules();

      // グローバルエラーハンドリングを設定
      this.setupErrorHandling();

      if (this.config.debug) {
        console.log('アプリケーションの初期化が完了しました');
      }
    } catch (error) {
      console.error('アプリケーションの初期化に失敗しました:', error);
    }
  }

  /**
   * モジュールを初期化
   */
  async initModules() {
    const modulesToInit = [
      { name: 'HeroSection', class: (await import('./components/HeroSection.js')).HeroSection },
      { name: 'NavigationManager', class: (await import('./components/NavigationManager.js')).NavigationManager },
      { name: 'ProductGrid', class: (await import('./components/ProductGrid.js')).ProductGrid },
      { name: 'ContactForm', class: (await import('./components/ContactForm.js')).ContactForm },
      { name: 'PerformanceManager', class: (await import('./components/PerformanceManager.js')).PerformanceManager },
      { name: 'ResponsiveManager', class: (await import('./components/ResponsiveManager.js')).ResponsiveManager },
      { name: 'AnimationManager', class: (await import('./components/AnimationManager.js')).AnimationManager }
    ];

    for (const { name, class: ModuleClass } of modulesToInit) {
      try {
        const instance = new ModuleClass();
        if (typeof instance.initialize === 'function') {
          await instance.initialize();
        }
        this.modules.set(name, instance);

        if (this.config.debug) {
          console.log(`${name} モジュールを初期化しました`);
        }
      } catch (error) {
        console.error(`${name} モジュールの初期化に失敗しました:`, error);
      }
    }
  }

  /**
   * エラーハンドリングを設定
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('グローバルエラー:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('未処理のPromiseリジェクション:', event.reason);
    });
  }

  /**
   * モジュールを取得
   * @param {string} name - モジュール名
   * @returns {Object} モジュールインスタンス
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * アプリケーションを破棄
   */
  destroy() {
    this.modules.forEach((module, name) => {
      if (typeof module.destroy === 'function') {
        module.destroy();
      }
      if (this.config.debug) {
        console.log(`${name} モジュールを破棄しました`);
      }
    });
    this.modules.clear();
  }
}

// DOM読み込み完了時にアプリケーションを起動
document.addEventListener('DOMContentLoaded', async () => {
  const app = new TeaSalesApp();
  await app.init();

  // デバッグ用にグローバルに公開
  if (Config.debug) {
    window.TeaSalesApp = app;
  }
});