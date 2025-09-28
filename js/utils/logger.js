// Logger - ログ機能ユーティリティ
// 標準化されたログ出力とパフォーマンスモニタリングを提供

const Logger = {
  // ログレベルの定義
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
  },

  // ログレベル名
  LOG_LEVEL_NAMES: {
    0: 'ERROR',
    1: 'WARN',
    2: 'INFO',
    3: 'DEBUG',
    4: 'TRACE'
  },

  // 現在のログレベル
  currentLevel: 2, // INFO

  // ログの保存
  logs: [],

  // 最大ログ保存数
  maxLogs: 1000,

  // パフォーマンス計測用のタイマー
  timers: new Map(),

  // ログレベルの設定
  setLevel: function(level) {
    if (typeof level === 'string') {
      level = this.LOG_LEVELS[level.toUpperCase()] || this.LOG_LEVELS.INFO;
    }
    if (typeof level === 'number' && level >= 0 && level <= 4) {
      this.currentLevel = level;
      return true;
    }
    return false;
  },

  // ログ出力
  log: function(level, message, data = {}) {
    if (level > this.currentLevel) {
      return null;
    }

    const timestamp = new Date().toISOString();
    const levelName = this.LOG_LEVEL_NAMES[level];
    const logEntry = {
      timestamp,
      level,
      levelName,
      message,
      data,
      stackTrace: this.getStackTrace(),
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : null
    };

    // ログを保存
    this.logs.push(logEntry);

    // 最大保存数を超えたら古いログを削除
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // コンソール出力
    this.outputToConsole(logEntry);

    return logEntry;
  },

  // エラーログ
  error: function(message, data = {}) {
    return this.log(this.LOG_LEVELS.ERROR, message, data);
  },

  // 警告ログ
  warn: function(message, data = {}) {
    return this.log(this.LOG_LEVELS.WARN, message, data);
  },

  // 情報ログ
  info: function(message, data = {}) {
    return this.log(this.LOG_LEVELS.INFO, message, data);
  },

  // デバッグログ
  debug: function(message, data = {}) {
    return this.log(this.LOG_LEVELS.DEBUG, message, data);
  },

  // トレースログ
  trace: function(message, data = {}) {
    return this.log(this.LOG_LEVELS.TRACE, message, data);
  },

  // パフォーマンス計測開始
  time: function(label) {
    if (this.timers.has(label)) {
      this.warn(`Timer '${label}' already exists. Overwriting.`);
    }
    this.timers.set(label, {
      start: performance.now(),
      label
    });
  },

  // パフォーマンス計測終了
  timeEnd: function(label, options = {}) {
    const {
      logLevel = this.LOG_LEVELS.DEBUG,
      threshold = 0,
      message = null
    } = options;

    const timer = this.timers.get(label);
    if (!timer) {
      this.warn(`Timer '${label}' not found.`);
      return null;
    }

    const duration = performance.now() - timer.start;
    this.timers.delete(label);

    // しきい値を超えた場合のみ記録
    if (duration >= threshold) {
      const logMessage = message || `Performance: ${label}`;
      this.log(logLevel, logMessage, {
        duration,
        label,
        threshold,
        unit: 'ms'
      });
    }

    return duration;
  },

  // パフォーマンス計測（簡易版）
  timeLog: function(label, message) {
    const timer = this.timers.get(label);
    if (!timer) {
      this.warn(`Timer '${label}' not found.`);
      return null;
    }

    const duration = performance.now() - timer.start;
    this.debug(`${message || label}: ${duration.toFixed(2)}ms`, {
      duration,
      label
    });

    return duration;
  },

  // コンソール出力
  outputToConsole: function(logEntry) {
    const { level, levelName, message, data } = logEntry;
    const consoleMethod = levelName.toLowerCase();

    if (console && typeof console[consoleMethod] === 'function') {
      const emoji = this.getEmoji(levelName);
      const prefix = `${emoji} [${levelName}]`;

      if (Object.keys(data).length > 0) {
        console[consoleMethod](`${prefix} ${message}`, data);
      } else {
        console[consoleMethod](`${prefix} ${message}`);
      }
    }
  },

  // ログレベルに応じた絵文字の取得
  getEmoji: function(levelName) {
    const emojis = {
      ERROR: '🚨',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍',
      TRACE: '📝'
    };
    return emojis[levelName] || '📝';
  },

  // スタックトレースの取得
  getStackTrace: function() {
    try {
      throw new Error();
    } catch (error) {
      return error.stack ? error.stack.split('\n').slice(3, 6).join('\n') : null;
    }
  },

  // セッションIDの取得
  getSessionId: function() {
    if (typeof window !== 'undefined' && window.TeaSalesApp && window.TeaSalesApp.state) {
      return window.TeaSalesApp.state.sessionId || 'unknown';
    }
    return 'unknown';
  },

  // ログの取得
  getLogs: function(filters = {}) {
    const { level, levelName, limit, since } = filters;

    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    if (levelName) {
      filteredLogs = filteredLogs.filter(log => log.levelName === levelName);
    }
    if (since) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= since);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  },

  // ログ統計の取得
  getStats: function() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byHour: {},
      recentLogs: this.logs.slice(-10)
    };

    // レベル別統計
    for (const log of this.logs) {
      stats.byLevel[log.levelName] = (stats.byLevel[log.levelName] || 0) + 1;
    }

    // 時間別統計（最近24時間）
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const log of this.logs) {
      const logTime = new Date(log.timestamp);
      if (logTime >= twentyFourHoursAgo) {
        const hour = logTime.getHours();
        stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
      }
    }

    return stats;
  },

  // ログのクリア
  clearLogs: function() {
    this.logs = [];
    this.timers.clear();
  },

  // ログのエクスポート
  exportLogs: function(filters = {}) {
    const logs = this.getLogs(filters);
    return JSON.stringify({
      logs,
      stats: this.getStats(),
      exportedAt: new Date().toISOString(),
      currentLevel: this.currentLevel
    }, null, 2);
  },

  // ログのインポート
  importLogs: function(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.logs && Array.isArray(data.logs)) {
        this.logs = data.logs;
        if (data.currentLevel !== undefined) {
          this.currentLevel = data.currentLevel;
        }
        return true;
      }
    } catch (error) {
      this.error('Failed to import logs', { error: error.message });
    }
    return false;
  },

  // グループ化されたログ出力
  group: function(label, collapsed = true) {
    if (console && typeof console.group === 'function') {
      if (collapsed && typeof console.groupCollapsed === 'function') {
        console.groupCollapsed(label);
      } else {
        console.group(label);
      }
    }
  },

  // グループの終了
  groupEnd: function() {
    if (console && typeof console.groupEnd === 'function') {
      console.groupEnd();
    }
  },

  // 条件付きログ
  assert: function(condition, message, data = {}) {
    if (!condition) {
      this.error(`Assertion failed: ${message}`, data);
      return false;
    }
    return true;
  },

  // モジュール用ロガーの作成
  createModuleLogger: function(moduleName) {
    return {
      error: (message, data) => this.error(message, { ...data, module: moduleName }),
      warn: (message, data) => this.warn(message, { ...data, module: moduleName }),
      info: (message, data) => this.info(message, { ...data, module: moduleName }),
      debug: (message, data) => this.debug(message, { ...data, module: moduleName }),
      trace: (message, data) => this.trace(message, { ...data, module: moduleName }),
      time: (label) => this.time(`${moduleName}:${label}`),
      timeEnd: (label, options) => this.timeEnd(`${moduleName}:${label}`, options),
      timeLog: (label, message) => this.timeLog(`${moduleName}:${label}`, message)
    };
  },

  // パフォーマンスモニタリングの開始
  startPerformanceMonitoring: function(options = {}) {
    const {
      interval = 60000, // 1分間隔
      threshold = 100,  // 100ms以上で警告
      logLevel = this.LOG_LEVELS.WARN
    } = options;

    if (this.performanceInterval) {
      this.warn('Performance monitoring is already active');
      return;
    }

    this.performanceInterval = setInterval(() => {
      this.checkPerformance(threshold, logLevel);
    }, interval);

    this.info('Performance monitoring started', { interval, threshold });
  },

  // パフォーマンスモニタリングの停止
  stopPerformanceMonitoring: function() {
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
      this.performanceInterval = null;
      this.info('Performance monitoring stopped');
    }
  },

  // パフォーマンスチェック
  checkPerformance: function(threshold, logLevel) {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = performance.memory;
      const usedMemory = memory.usedJSHeapSize / (1024 * 1024); // MB
      const totalMemory = memory.totalJSHeapSize / (1024 * 1024); // MB
      const memoryUsage = (usedMemory / totalMemory) * 100;

      if (memoryUsage > 80) {
        this.log(logLevel, 'High memory usage detected', {
          usedMemory: `${usedMemory.toFixed(2)}MB`,
          totalMemory: `${totalMemory.toFixed(2)}MB`,
          usagePercent: `${memoryUsage.toFixed(2)}%`
        });
      }
    }

    // アクティブなタイマーのチェック
    if (this.timers.size > 10) {
      this.warn('Too many active timers', {
        timerCount: this.timers.size,
        timers: Array.from(this.timers.keys())
      });
    }
  },

  // クリーンアップ
  cleanup: function() {
    this.stopPerformanceMonitoring();
    this.clearLogs();
  }
};

// グローバルスコープに公開
window.Logger = Logger;

// TeaSalesAppに統合
if (window.TeaSalesApp) {
  window.TeaSalesApp.Logger = Logger;
}

// ES6モジュールとしてもエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}