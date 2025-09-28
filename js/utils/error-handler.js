// ErrorHandler - エラーハンドリングユーティリティ
// 標準化されたエラーハンドリングとログ機能を提供

const ErrorHandler = {
  // エラーレベルの定義
  ERROR_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  // エラーカテゴリの定義
  ERROR_CATEGORIES: {
    NETWORK: 'network',
    VALIDATION: 'validation',
    DOM: 'dom',
    MODULE: 'module',
    CONFIG: 'config',
    PERFORMANCE: 'performance',
    UNKNOWN: 'unknown'
  },

  // エラーカウントの追跡
  errorCounts: {
    total: 0,
    byLevel: {},
    byCategory: {},
    byModule: {}
  },

  // エラーログの保存
  errorLogs: [],

  // 最大ログ保存数
  maxLogs: 100,

  // エラーハンドリングのメインメソッド
  handle: function(message, error, options = {}) {
    const {
      level = this.ERROR_LEVELS.ERROR,
      category = this.ERROR_CATEGORIES.UNKNOWN,
      module = 'unknown',
      userMessage = null,
      shouldThrow = false,
      additionalData = {}
    } = options;

    const timestamp = new Date().toISOString();

    // エラーオブジェクトの作成
    const errorData = {
      timestamp,
      level,
      category,
      module,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null,
      userMessage,
      additionalData,
      sessionId: this.getSessionId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      url: typeof window !== 'undefined' ? window.location.href : null
    };

    // エラーログを保存
    this.logError(errorData);

    // エラーカウントを更新
    this.updateErrorCounts(errorData);

    // コンソール出力
    this.outputToConsole(errorData);

    // ユーザーへの通知
    if (userMessage) {
      this.notifyUser(userMessage, level);
    }

    // 必要に応じてエラーを再スロー
    if (shouldThrow) {
      throw error || new Error(message);
    }

    return errorData;
  },

  // ネットワークエラーのハンドリング
  handleNetworkError: function(error, operation = 'network operation') {
    let userMessage = 'ネットワークエラーが発生しました。';
    let category = this.ERROR_CATEGORIES.NETWORK;

    if (!navigator.onLine) {
      userMessage = 'ネットワーク接続がありません。接続を確認してください。';
    } else if (error.status === 404) {
      userMessage = '要求されたリソースが見つかりません。';
    } else if (error.status === 500) {
      userMessage = 'サーバーエラーが発生しました。しばらくしてから再試行してください。';
    } else if (error.status === 403) {
      userMessage = 'アクセスが拒否されました。';
    } else if (error.status === 401) {
      userMessage = '認証に失敗しました。';
    }

    return this.handle(
      `Network error in ${operation}`,
      error,
      {
        level: this.ERROR_LEVELS.ERROR,
        category,
        userMessage,
        additionalData: {
          status: error.status,
          statusText: error.statusText,
          url: error.url
        }
      }
    );
  },

  // バリデーションエラーのハンドリング
  handleValidationError: function(message, field, value, rules = []) {
    return this.handle(
      `Validation error: ${message}`,
      null,
      {
        level: this.ERROR_LEVELS.WARN,
        category: this.ERROR_CATEGORIES.VALIDATION,
        userMessage: `入力値が無効です: ${message}`,
        additionalData: {
          field,
          value,
          rules
        }
      }
    );
  },

  // DOMエラーのハンドリング
  handleDOMError: function(message, element, operation = 'DOM operation') {
    return this.handle(
      `DOM error in ${operation}`,
      null,
      {
        level: this.ERROR_LEVELS.WARN,
        category: this.ERROR_CATEGORIES.DOM,
        userMessage: 'ページの表示に問題が発生しました。',
        additionalData: {
          element: element ? element.tagName : null,
          elementId: element ? element.id : null,
          operation
        }
      }
    );
  },

  // モジュール初期化エラーのハンドリング
  handleModuleError: function(moduleName, error, operation = 'initialization') {
    return this.handle(
      `Module error in ${moduleName} ${operation}`,
      error,
      {
        level: this.ERROR_LEVELS.ERROR,
        category: this.ERROR_CATEGORIES.MODULE,
        userMessage: `${moduleName}の読み込みに失敗しました。`,
        additionalData: {
          module: moduleName,
          operation
        }
      }
    );
  },

  // パフォーマンスエラーのハンドリング
  handlePerformanceError: function(operation, duration, threshold) {
    return this.handle(
      `Performance threshold exceeded: ${operation}`,
      null,
      {
        level: this.ERROR_LEVELS.WARN,
        category: this.ERROR_CATEGORIES.PERFORMANCE,
        additionalData: {
          operation,
          duration,
          threshold
        }
      }
    );
  },

  // エラーログを保存
  logError: function(errorData) {
    this.errorLogs.push(errorData);

    // 最大保存数を超えたら古いログを削除
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }
  },

  // エラーカウントを更新
  updateErrorCounts: function(errorData) {
    this.errorCounts.total++;

    // レベル別カウント
    this.errorCounts.byLevel[errorData.level] =
      (this.errorCounts.byLevel[errorData.level] || 0) + 1;

    // カテゴリ別カウント
    this.errorCounts.byCategory[errorData.category] =
      (this.errorCounts.byCategory[errorData.category] || 0) + 1;

    // モジュール別カウント
    this.errorCounts.byModule[errorData.module] =
      (this.errorCounts.byModule[errorData.module] || 0) + 1;
  },

  // コンソール出力
  outputToConsole: function(errorData) {
    const { level, message, error, additionalData } = errorData;
    const consoleMethod = level === this.ERROR_LEVELS.ERROR ? 'error' :
                          level === this.ERROR_LEVELS.WARN ? 'warn' :
                          level === this.ERROR_LEVELS.INFO ? 'info' : 'debug';

    const emoji = level === this.ERROR_LEVELS.ERROR ? '🚨' :
                  level === this.ERROR_LEVELS.WARN ? '⚠️' :
                  level === this.ERROR_LEVELS.INFO ? 'ℹ️' : '🔍';

    if (console && typeof console[consoleMethod] === 'function') {
      console[consoleMethod](`${emoji} ${message}`, {
        ...errorData,
        // デバッグモードの場合のみ詳細情報を表示
        ...(TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug ? {} : {
          error: error ? error.message : null,
          stack: error ? error.stack : null
        })
      });
    }
  },

  // ユーザーへの通知
  notifyUser: function(message, level) {
    if (typeof window !== 'undefined' && window.TeaSalesApp && window.TeaSalesApp.events) {
      window.TeaSalesApp.events.emit('errorNotification', {
        message,
        level,
        timestamp: Date.now()
      });
    }
  },

  // セッションIDの取得
  getSessionId: function() {
    if (typeof window !== 'undefined' && window.TeaSalesApp && window.TeaSalesApp.state) {
      return window.TeaSalesApp.state.sessionId || 'unknown';
    }
    return 'unknown';
  },

  // エラーログの取得
  getErrorLogs: function(filters = {}) {
    const { level, category, module, limit } = filters;

    let filteredLogs = this.errorLogs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  },

  // エラー統計の取得
  getErrorStats: function() {
    return {
      total: this.errorCounts.total,
      byLevel: { ...this.errorCounts.byLevel },
      byCategory: { ...this.errorCounts.byCategory },
      byModule: { ...this.errorCounts.byModule },
      recentErrors: this.errorLogs.slice(-10)
    };
  },

  // エラーログのクリア
  clearErrorLogs: function() {
    this.errorLogs = [];
    this.errorCounts = {
      total: 0,
      byLevel: {},
      byCategory: {},
      byModule: {}
    };

    if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
      console.log('ErrorHandler: Error logs cleared');
    }
  },

  // エラーログのエクスポート
  exportErrorLogs: function() {
    return JSON.stringify({
      logs: this.errorLogs,
      stats: this.getErrorStats(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  // エラーログのインポート
  importErrorLogs: function(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.logs && Array.isArray(data.logs)) {
        this.errorLogs = data.logs;
        if (data.stats) {
          this.errorCounts = data.stats;
        }
        return true;
      }
    } catch (error) {
      console.error('ErrorHandler: Failed to import error logs', error);
    }
    return false;
  },

  // クリーンアップ
  cleanup: function() {
    this.clearErrorLogs();

    if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
      console.log('ErrorHandler: Cleaned up successfully');
    }
  }
};

// グローバルスコープに公開
window.ErrorHandler = ErrorHandler;

// TeaSalesAppに統合
if (window.TeaSalesApp) {
  window.TeaSalesApp.ErrorHandler = ErrorHandler;
}

// ES6モジュールとしてもエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}