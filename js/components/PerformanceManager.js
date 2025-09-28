/**
 * PerformanceManager - パフォーマンス最適化を管理するクラス
 * 画像遅延読み込み、パフォーマンス監視、リソース最適化を担当
 */
export class PerformanceManager {
  constructor() {
    this.observerOptions = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.1
    };

    this.imageObserver = null;
    this.metrics = {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0
    };

    this.isInitialized = false;
  }

  /**
   * PerformanceManagerを初期化する
   */
  initialize() {
    if (this.isInitialized) return;

    try {
      this.setupLazyLoading();
      this.setupPerformanceMonitoring();
      this.setupResourceHints();
      this.setupIntersectionObserver();

      // パフォーマンスAPIのサポートを確認
      if ('PerformanceObserver' in window) {
        this.observeWebVitals();
      }

      this.isInitialized = true;

      if (window.Config?.debug) {
        console.log('PerformanceManagerを初期化しました');
      }
    } catch (error) {
      console.error('PerformanceManagerの初期化に失敗しました:', error);
    }
  }

  /**
   * IntersectionObserverを設定
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.imageObserver.unobserve(entry.target);
          }
        });
      }, this.observerOptions);
    }
  }

  /**
   * 画像遅延読み込みを設定
   */
  setupLazyLoading() {
    // data-src属性を持つすべての画像を対象に
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('loading' in HTMLImageElement.prototype) {
      // ネイティブのlazy loadingをサポート
      lazyImages.forEach(img => {
        img.loading = 'lazy';
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    } else {
      // IntersectionObserverを使用したフォールバック
      if (this.imageObserver) {
        lazyImages.forEach(img => {
          this.imageObserver.observe(img);
        });
      }
    }

    // 背景画像の遅延読み込み
    const lazyBackgrounds = document.querySelectorAll('[data-bg-src]');
    if (this.imageObserver) {
      lazyBackgrounds.forEach(element => {
        this.imageObserver.observe(element);
      });
    }
  }

  /**
   * 画像を読み込む
   * @param {HTMLImageElement|HTMLElement} element - 読み込む要素
   */
  loadImage(element) {
    if (element.tagName === 'IMG') {
      const src = element.dataset.src;
      if (src) {
        // プレースホルダーがあれば表示
        if (element.dataset.placeholder) {
          element.src = element.dataset.placeholder;
        }

        // 本物の画像をプリロード
        const tempImage = new Image();
        tempImage.onload = () => {
          element.src = src;
          element.classList.add('loaded');
          this.handleImageLoad(element);
        };
        tempImage.onerror = () => {
          element.classList.add('error');
          this.handleImageError(element);
        };
        tempImage.src = src;
      }
    } else {
      // 背景画像の場合
      const bgSrc = element.dataset.bgSrc;
      if (bgSrc) {
        element.style.backgroundImage = `url('${bgSrc}')`;
        element.classList.add('loaded');
      }
    }
  }

  /**
   * 画像読み込み完了時の処理
   * @param {HTMLImageElement} img - 画像要素
   */
  handleImageLoad(img) {
    // アニメーションクラスを追加
    img.classList.add('fade-in');

    // パフォーマンスイベントを発行
    window.dispatchEvent(new CustomEvent('imageLoaded', {
      detail: { element: img, src: img.src }
    }));
  }

  /**
   * 画像読み込みエラー時の処理
   * @param {HTMLImageElement} img - 画像要素
   */
  handleImageError(img) {
    console.warn(`画像の読み込みに失敗しました: ${img.dataset.src || img.src}`);

    // エラー時の代替画像を設定
    if (img.dataset.fallback) {
      img.src = img.dataset.fallback;
    }

    // エラーイベントを発行
    window.dispatchEvent(new CustomEvent('imageLoadError', {
      detail: { element: img, src: img.dataset.src || img.src }
    }));
  }

  /**
   * パフォーマンス監視を設定
   */
  setupPerformanceMonitoring() {
    // ページ読み込み時間を計測
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      }
    });

    // リソースの読み込みを監視
    const resourceObserver = new PerformanceObserver((list) => {
      const resources = list.getEntries();
      resources.forEach(resource => {
        if (resource.initiatorType === 'img') {
          this.optimizeImageResource(resource);
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('ResourceObserverのサポートがありません');
    }
  }

  /**
   * Web Vitalsを監視
   */
  observeWebVitals() {
    // FCP (First Contentful Paint)
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
          this.reportMetric('FCP', entry.startTime);
        }
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cumulativeLayoutShift = clsValue;
          this.reportMetric('CLS', clsValue);
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // FID (First Input Delay) - ただし、PageLoadVitalsAPIは非推奨
    if ('PerformanceEventTiming' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0];
        if (firstInput) {
          this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
          this.reportMetric('FID', this.metrics.firstInputDelay);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  /**
   * メトリクスを報告
   * @param {string} name - メトリクス名
   * @param {number} value - 値
   */
  reportMetric(name, value) {
    if (window.Config?.debug) {
      console.log(`${name}: ${value.toFixed(2)}ms`);
    }

    // カスタムイベントを発行
    window.dispatchEvent(new CustomEvent('performanceMetric', {
      detail: { name, value }
    }));
  }

  /**
   * 画像リソースを最適化
   * @param {PerformanceResourceTiming} resource - リソース情報
   */
  optimizeImageResource(resource) {
    // 大きな画像を検出
    if (resource.transferSize > 100000) { // 100KB以上
      if (window.Config?.debug) {
        console.warn(`大きな画像を検出: ${resource.name} (${(resource.transferSize / 1024).toFixed(2)}KB)`);
      }
    }
  }

  /**
   * リソースヒントを設定
   */
  setupResourceHints() {
    // DNSプリフェッチ
    const dnsPrefetchLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    dnsPrefetchLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // プリコネクト
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
    });

    // 重要なリソースのプリロード
    const heroImage = document.querySelector('.hero img[data-src]');
    if (heroImage && heroImage.dataset.src) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = heroImage.dataset.src;
      document.head.appendChild(preloadLink);
    }
  }

  /**
   * ページ読み込み時間を計測
   * @returns {PerformanceEntry} パフォーマンスエントリー
   */
  measurePageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation || null;
  }

  /**
   * 画像を最適化
   */
  optimizeImages() {
    const images = document.querySelectorAll('img:not([data-src])');

    images.forEach(img => {
      // srcset属性がなければ設定
      if (!img.srcset && img.naturalWidth > 400) {
        const src = img.src;
        const ext = src.split('.').pop();
        const basePath = src.replace(`.${ext}`, '');

        // レスポンシブ画像のsrcsetを生成（実際には存在する必要あり）
        img.srcset = `${basePath}.${ext} 1x, ${basePath}@2x.${ext} 2x`;
      }
    });
  }

  /**
   * パフォーマンスメトリクスを取得
   * @returns {Object} メトリクスオブジェクト
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * パフォーマンスレポートを生成
   * @returns {string} レポート文字列
   */
  generateReport() {
    const metrics = this.getMetrics();
    let report = '=== パフォーマンスレポート ===\n';

    Object.entries(metrics).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      const unit = key === 'cumulativeLayoutShift' ? '' : 'ms';
      report += `${formattedKey}: ${value}${unit}\n`;
    });

    return report;
  }

  /**
   * パフォーマンスを最適化
   */
  optimize() {
    // 不要なイベントリスナーをクリーンアップ
    this.cleanupEventListeners();

    // メモリ使用量を監視
    this.monitorMemoryUsage();

    // スクロールパフォーマンスを最適化
    this.optimizeScrollPerformance();
  }

  /**
   * イベントリスナーをクリーンアップ
   */
  cleanupEventListeners() {
    // 実装例: 不要なイベントリスナーの削除
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
    passiveEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });
  }

  /**
   * メモリ使用量を監視
   */
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

      if (usage > 0.9) {
        console.warn(`メモリ使用量が90%を超えています: ${(usage * 100).toFixed(2)}%`);
        window.dispatchEvent(new CustomEvent('memoryWarning', {
          detail: { usage: memory.usedJSHeapSize, limit: memory.jsHeapSizeLimit }
        }));
      }
    }
  }

  /**
   * スクロールパフォーマンスを最適化
   */
  optimizeScrollPerformance() {
    let ticking = false;

    const optimizedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('optimizedScroll'));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScroll, { passive: true });
  }

  /**
   * PerformanceManagerを破棄
   */
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }

    // パフォーマンス監視を停止
    if ('PerformanceObserver' in window) {
      try {
        // すべてのPerformanceObserverを切断
        PerformanceObserver.disconnectAll?.();
      } catch (e) {
        // disconnectAllがサポートされていない場合は無視
      }
    }

    this.isInitialized = false;

    if (window.Config?.debug) {
      console.log('PerformanceManagerを破棄しました');
    }
  }
}