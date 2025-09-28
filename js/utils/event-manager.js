// EventManager - イベント管理ユーティリティ
// イベントリスナーの追跡、追加、削除、クリーンアップ機能を提供

const EventManager = {
  // イベントリスナーの追跡用Map
  listeners: new Map(),

  // イベントリスナーを追加して追跡
  add: function(element, event, handler, options = {}) {
    if (!element || !event || !handler) {
      console.warn('EventManager: Invalid parameters for addEventListener', { element, event, handler });
      return null;
    }

    // 一意のリスナーIDを生成
    const listenerId = `${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // リスナー情報を保存
    const listenerInfo = {
      id: listenerId,
      element,
      event,
      handler,
      options,
      timestamp: Date.now()
    };

    this.listeners.set(listenerId, listenerInfo);

    // イベントリスナーを追加
    if (typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler, options);
    } else {
      console.warn('EventManager: Element does not support addEventListener', element);
      this.listeners.delete(listenerId);
      return null;
    }

    if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
      console.debug(`EventManager: Event listener added: ${event} on element`, listenerId);
    }

    return listenerId;
  },

  // イベントリスナーを削除
  remove: function(listenerId) {
    if (!listenerId || !this.listeners.has(listenerId)) {
      console.warn('EventManager: Listener not found', listenerId);
      return false;
    }

    const listener = this.listeners.get(listenerId);

    try {
      // イベントリスナーを削除
      if (typeof listener.element.removeEventListener === 'function') {
        listener.element.removeEventListener(listener.event, listener.handler, listener.options);
      }

      // 追跡用Mapから削除
      this.listeners.delete(listenerId);

      if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
        console.debug(`EventManager: Event listener removed: ${listener.event} from element`, listenerId);
      }

      return true;
    } catch (error) {
      console.error('EventManager: Error removing event listener', error);
      return false;
    }
  },

  // 特定の要素とイベントに紐づくリスナーをすべて削除
  removeByElement: function(element, event) {
    const removedIds = [];

    for (const [listenerId, listener] of this.listeners.entries()) {
      if (listener.element === element && (!event || listener.event === event)) {
        if (this.remove(listenerId)) {
          removedIds.push(listenerId);
        }
      }
    }

    return removedIds;
  },

  // すべてのイベントリスナーを削除
  removeAll: function() {
    if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
      console.log(`EventManager: Removing ${this.listeners.size} event listeners`);
    }

    const removedIds = [];
    for (const listenerId of this.listeners.keys()) {
      if (this.remove(listenerId)) {
        removedIds.push(listenerId);
      }
    }

    return removedIds;
  },

  // 特定のイベントタイプのリスナー数を取得
  getListenerCount: function(event = null) {
    if (event) {
      let count = 0;
      for (const listener of this.listeners.values()) {
        if (listener.event === event) {
          count++;
        }
      }
      return count;
    }
    return this.listeners.size;
  },

  // リスナー情報を取得
  getListenerInfo: function(listenerId) {
    return this.listeners.get(listenerId);
  },

  // すべてのリスナー情報を取得
  getAllListeners: function() {
    return Array.from(this.listeners.values());
  },

  // メモリリークチェック
  checkMemoryLeaks: function() {
    const now = Date.now();
    const oldListeners = [];
    const threshold = 5 * 60 * 1000; // 5分以上経過したリスナー

    for (const listener of this.listeners.values()) {
      if (now - listener.timestamp > threshold) {
        oldListeners.push({
          id: listener.id,
          event: listener.event,
          age: now - listener.timestamp
        });
      }
    }

    if (oldListeners.length > 0) {
      console.warn('EventManager: Potentially leaked event listeners detected', oldListeners);
    }

    return oldListeners;
  },

  // 定期的なメンテナンス
  startMaintenance: function(interval = 60000) {
    const maintenanceInterval = setInterval(() => {
      this.checkMemoryLeaks();
    }, interval);

    // メンテナンスインターバルを保存して後でクリーンアップできるようにする
    this.maintenanceInterval = maintenanceInterval;

    if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
      console.log('EventManager: Maintenance started with interval', interval);
    }

    return maintenanceInterval;
  },

  // メンテナンスを停止
  stopMaintenance: function() {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;

      if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
        console.log('EventManager: Maintenance stopped');
      }
    }
  },

  // クリーンアップ
  cleanup: function() {
    this.stopMaintenance();
    this.removeAll();

    if (TeaSalesApp && TeaSalesApp.config && TeaSalesApp.config.debug) {
      console.log('EventManager: Cleaned up successfully');
    }
  },

  // 統計情報の取得
  getStats: function() {
    const eventTypes = {};
    for (const listener of this.listeners.values()) {
      eventTypes[listener.event] = (eventTypes[listener.event] || 0) + 1;
    }

    return {
      totalListeners: this.listeners.size,
      eventTypes,
      isMaintenanceActive: !!this.maintenanceInterval
    };
  }
};

// グローバルスコープに公開
window.EventManager = EventManager;

// TeaSalesAppに統合
if (window.TeaSalesApp) {
  window.TeaSalesApp.EventManager = EventManager;
}

// ES6モジュールとしてもエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventManager;
}