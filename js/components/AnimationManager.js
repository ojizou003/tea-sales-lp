/**
 * AnimationManager - アニメーションとインタラクションを管理するクラス
 * スクロールアニメーション、ホバーエフェクト、トランジションを担当
 */
export class AnimationManager {
  constructor() {
    this.observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
    };

    this.observer = null;
    this.animatedElements = new Set();
    this.intersectionRatios = new Map();

    // アニメーション設定
    this.config = {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      stagger: 100,
      threshold: 0.1
    };

    // アニメーション中の要素を追跡
    this.animatingElements = new Map();

    // パフォーマンス最適化
    this.ticking = false;
    this.resizeTimer = null;

    this.isInitialized = false;
  }

  /**
   * AnimationManagerを初期化する
   */
  initialize() {
    if (this.isInitialized) return;

    try {
      this.setupIntersectionObserver();
      this.setupScrollAnimations();
      this.setupHoverEffects();
      this.setupMicroInteractions();
      this.setupParallaxEffects();
      this.setupLoadingAnimations();
      this.setupResizeHandling();

      this.isInitialized = true;

      if (window.Config?.debug) {
        console.log('AnimationManagerを初期化しました');
      }
    } catch (error) {
      console.error('AnimationManagerの初期化に失敗しました:', error);
    }
  }

  /**
   * IntersectionObserverを設定
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersections(entries),
        this.observerOptions
      );

      // アニメーション対象の要素を監視
      this.observeAnimatedElements();
    }
  }

  /**
   * アニメーション対象の要素を監視
   */
  observeAnimatedElements() {
    // フェードインアニメーション
    const fadeElements = document.querySelectorAll('.fade-in, [data-animate="fade"]');
    fadeElements.forEach(el => this.observer.observe(el));

    // スライドインアニメーション
    const slideElements = document.querySelectorAll('.slide-in, [data-animate="slide"]');
    slideElements.forEach(el => this.observer.observe(el));

    // スケールアニメーション
    const scaleElements = document.querySelectorAll('.scale-in, [data-animate="scale"]');
    scaleElements.forEach(el => this.observer.observe(el));

    // カウンター要素
    const counterElements = document.querySelectorAll('.counter, [data-counter]');
    counterElements.forEach(el => this.observer.observe(el));

    // プログレスバー
    const progressElements = document.querySelectorAll('.progress-bar, [data-progress]');
    progressElements.forEach(el => this.observer.observe(el));
  }

  /**
   * インターセクションを処理
   * @param {IntersectionObserverEntry[]} entries - インターセクションエントリー
   */
  handleIntersections(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const ratio = entry.intersectionRatio;

      // 交差率を保存
      this.intersectionRatios.set(element, ratio);

      if (entry.isIntersecting) {
        // 要素がビューポートに入った
        this.animateElement(element, entry);
      } else if (ratio < this.config.threshold) {
        // 要素がビューポートから出た
        this.resetElement(element);
      }
    });
  }

  /**
   * 要素をアニメーション
   * @param {HTMLElement} element - アニメーション要素
   * @param {IntersectionObserverEntry} entry - インターセクションエントリー
   */
  animateElement(element, entry) {
    if (this.animatedElements.has(element)) return;

    const animationType = this.getAnimationType(element);
    const delay = this.getAnimationDelay(element);

    // 遅延を実行
    setTimeout(() => {
      this.performAnimation(element, animationType, entry);
    }, delay);

    this.animatedElements.add(element);
  }

  /**
   * アニメーションタイプを取得
   * @param {HTMLElement} element - 要素
   * @returns {string} アニメーションタイプ
   */
  getAnimationType(element) {
    if (element.dataset.animate) {
      return element.dataset.animate;
    }

    if (element.classList.contains('fade-in')) return 'fade';
    if (element.classList.contains('slide-in')) return 'slide';
    if (element.classList.contains('scale-in')) return 'scale';
    if (element.classList.contains('counter')) return 'counter';
    if (element.classList.contains('progress-bar')) return 'progress';

    return 'fade';
  }

  /**
   * アニメーション遅延を取得
   * @param {HTMLElement} element - 要素
   * @returns {number} 遅延時間（ms）
   */
  getAnimationDelay(element) {
    // スタッガーアニメーション用
    if (element.dataset.stagger) {
      const index = parseInt(element.dataset.stagger);
      return index * this.config.stagger;
    }

    if (element.dataset.delay) {
      return parseInt(element.dataset.delay);
    }

    return 0;
  }

  /**
   * アニメーションを実行
   * @param {HTMLElement} element - 要素
   * @param {string} type - アニメーションタイプ
   * @param {IntersectionObserverEntry} entry - インターセクションエントリー
   */
  performAnimation(element, type, entry) {
    switch (type) {
      case 'fade':
        this.animateFadeIn(element, entry);
        break;
      case 'slide':
        this.animateSlideIn(element, entry);
        break;
      case 'scale':
        this.animateScaleIn(element, entry);
        break;
      case 'counter':
        this.animateCounter(element);
        break;
      case 'progress':
        this.animateProgress(element);
        break;
      default:
        this.animateFadeIn(element, entry);
    }
  }

  /**
   * フェードインアニメーション
   * @param {HTMLElement} element - 要素
   * @param {IntersectionObserverEntry} entry - インターセクションエントリー
   */
  animateFadeIn(element, entry) {
    const ratio = entry.intersectionRatio;
    const opacity = Math.min(ratio * 2, 1);

    element.style.opacity = opacity;
    element.style.transform = `translateY(${(1 - ratio) * 20}px)`;

    if (ratio >= 1) {
      element.classList.add('animated');
      element.style.opacity = '';
      element.style.transform = '';
    }
  }

  /**
   * スライドインアニメーション
   * @param {HTMLElement} element - 要素
   * @param {IntersectionObserverEntry} entry - インターセクションエントリー
   */
  animateSlideIn(element, entry) {
    const ratio = entry.intersectionRatio;
    const direction = element.dataset.direction || 'up';
    let transformValue = '';

    switch (direction) {
      case 'left':
        transformValue = `translateX(${(1 - ratio) * -50}px)`;
        break;
      case 'right':
        transformValue = `translateX(${(1 - ratio) * 50}px)`;
        break;
      case 'up':
      default:
        transformValue = `translateY(${(1 - ratio) * -50}px)`;
        break;
    }

    element.style.opacity = Math.min(ratio * 2, 1);
    element.style.transform = transformValue;

    if (ratio >= 1) {
      element.classList.add('animated');
      element.style.opacity = '';
      element.style.transform = '';
    }
  }

  /**
   * スケールインアニメーション
   * @param {HTMLElement} element - 要素
   * @param {IntersectionObserverEntry} entry - インターセクションエントリー
   */
  animateScaleIn(element, entry) {
    const ratio = entry.intersectionRatio;
    const scale = 0.8 + (ratio * 0.2);
    const opacity = Math.min(ratio * 2, 1);

    element.style.opacity = opacity;
    element.style.transform = `scale(${scale})`;

    if (ratio >= 1) {
      element.classList.add('animated');
      element.style.opacity = '';
      element.style.transform = '';
    }
  }

  /**
   * カウンターアニメーション
   * @param {HTMLElement} element - 要素
   */
  animateCounter(element) {
    const target = parseInt(element.dataset.counter || element.textContent);
    const duration = parseInt(element.dataset.duration || this.config.duration);
    const start = 0;
    const increment = target / (duration / 16);

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);

    this.animatingElements.set(element, timer);
  }

  /**
   * プログレスバーアニメーション
   * @param {HTMLElement} element - 要素
   */
  animateProgress(element) {
    const target = parseInt(element.dataset.progress || 0);
    const duration = parseInt(element.dataset.duration || this.config.duration);
    const progressBar = element.querySelector('.progress') || element;

    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      progressBar.style.width = `${current}%`;
    }, 16);

    this.animatingElements.set(element, timer);
  }

  /**
   * 要素をリセット
   * @param {HTMLElement} element - 要素
   */
  resetElement(element) {
    if (!element.classList.contains('reset-animation')) return;

    element.classList.remove('animated');
    element.style.opacity = '';
    element.style.transform = '';
    this.animatedElements.delete(element);

    // アニメーションタイマーをクリア
    if (this.animatingElements.has(element)) {
      clearInterval(this.animatingElements.get(element));
      this.animatingElements.delete(element);
    }
  }

  /**
   * スクロールアニメーションを設定
   */
  setupScrollAnimations() {
    // パララックス効果
    this.setupParallax();

    // スクロールに連動したアニメーション
    this.setupScrollLinkedAnimations();

    // スティッキーエレメントの監視
    this.setupStickyAnimations();
  }

  /**
   * パララックス効果を設定
   */
  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    const handleScroll = () => {
      if (this.ticking) return;

      this.ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset;

        parallaxElements.forEach(element => {
          const speed = parseFloat(element.dataset.parallax) || 0.5;
          const yPos = -(scrollTop * speed);
          element.style.transform = `translateY(${yPos}px)`;
        });

        this.ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * スクロール連動アニメーションを設定
   */
  setupScrollLinkedAnimations() {
    const scrollLinkedElements = document.querySelectorAll('[data-scroll-animate]');

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;

      scrollLinkedElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = rect.height;
        const elementCenter = elementTop + elementHeight / 2;

        // 要素が画面中央にあるときの進捗度（0-1）
        const progress = 1 - Math.abs(scrollTop + windowHeight / 2 - elementCenter) / (windowHeight / 2);
        const clampedProgress = Math.max(0, Math.min(1, progress));

        // 進捗度に基づいてアニメーション
        this.updateScrollAnimation(element, clampedProgress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * スクロールアニメーションを更新
   * @param {HTMLElement} element - 要素
   * @param {number} progress - 進捗度（0-1）
   */
  updateScrollAnimation(element, progress) {
    const type = element.dataset.scrollAnimate;

    switch (type) {
      case 'rotate':
        element.style.transform = `rotate(${progress * 360}deg)`;
        break;
      case 'scale':
        element.style.transform = `scale(${0.5 + progress * 0.5})`;
        break;
      case 'opacity':
        element.style.opacity = progress;
        break;
      case 'fill':
        if (element.tagName === 'circle' || element.tagName === 'rect') {
          element.style.transform = `scale(${progress})`;
          element.style.transformOrigin = 'center';
        }
        break;
    }
  }

  /**
   * スティッキーアニメーションを設定
   */
  setupStickyAnimations() {
    const stickyElements = document.querySelectorAll('[data-sticky]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const element = entry.target;
          if (entry.isIntersecting) {
            element.classList.add('sticky-active');
          } else {
            element.classList.remove('sticky-active');
          }
        });
      },
      { threshold: [0, 1] }
    );

    stickyElements.forEach(element => observer.observe(element));
  }

  /**
   * ホバーエフェクトを設定
   */
  setupHoverEffects() {
    // リンクとボタンのホバーエフェクト
    this.setupLinkHovers();

    // カードのホバーエフェクト
    this.setupCardHovers();

    // イメージホバーエフェクト
    this.setupImageHovers();

    // テキストエフェクト
    this.setupTextEffects();
  }

  /**
   * リンクのホバーエフェクトを設定
   */
  setupLinkHovers() {
    const links = document.querySelectorAll('a, button, .btn');

    links.forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        this.handleLinkHover(e, 'enter');
      });

      link.addEventListener('mouseleave', (e) => {
        this.handleLinkHover(e, 'leave');
      });
    });
  }

  /**
   * リンクホバーを処理
   * @param {Event} e - イベント
   * @param {string} type - イベントタイプ
   */
  handleLinkHover(e, type) {
    const link = e.currentTarget;

    if (type === 'enter') {
      link.classList.add('hover');
      // リップルエフェクト
      this.createRippleEffect(e);
    } else {
      link.classList.remove('hover');
    }
  }

  /**
   * リップルエフェクトを作成
   * @param {Event} e - イベント
   */
  createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * カードのホバーエフェクトを設定
   */
  setupCardHovers() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('card-hover');
        this.animateCardLift(card);
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('card-hover');
        this.resetCardLift(card);
      });
    });
  }

  /**
   * カードのリフトアニメーション
   * @param {HTMLElement} card - カード要素
   */
  animateCardLift(card) {
    card.style.transform = 'translateY(-10px)';
    card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
  }

  /**
   * カードのリフトをリセット
   * @param {HTMLElement} card - カード要素
   */
  resetCardLift(card) {
    card.style.transform = '';
    card.style.boxShadow = '';
  }

  /**
   * 画像のホバーエフェクトを設定
   */
  setupImageHovers() {
    const images = document.querySelectorAll('.hover-zoom, .hover-overlay');

    images.forEach(img => {
      img.addEventListener('mouseenter', () => {
        img.classList.add('img-hover');
      });

      img.addEventListener('mouseleave', () => {
        img.classList.remove('img-hover');
      });
    });
  }

  /**
   * テキストエフェクトを設定
   */
  setupTextEffects() {
    const glowTexts = document.querySelectorAll('.text-glow');

    glowTexts.forEach(text => {
      text.addEventListener('mouseenter', () => {
        text.style.textShadow = '0 0 20px currentColor';
      });

      text.addEventListener('mouseleave', () => {
        text.style.textShadow = '';
      });
    });
  }

  /**
   * マイクロインタラクションを設定
   */
  setupMicroInteractions() {
    // フォーカスエフェクト
    this.setupFocusEffects();

    // クリックエフェクト
    this.setupClickEffects();

    // ローディングエフェクト
    this.setupLoadingEffects();

    // トースト通知
    this.setupToasts();
  }

  /**
   * フォーカスエフェクトを設定
   */
  setupFocusEffects() {
    const focusableElements = document.querySelectorAll('input, textarea, select');

    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.parentElement.classList.add('focused');
        this.createFocusRing(element);
      });

      element.addEventListener('blur', () => {
        element.parentElement.classList.remove('focused');
        this.removeFocusRing(element);
      });
    });
  }

  /**
   * フォーカスリングを作成
   * @param {HTMLElement} element - 要素
   */
  createFocusRing(element) {
    const ring = document.createElement('div');
    ring.className = 'focus-ring';
    element.parentElement.appendChild(ring);
  }

  /**
   * フォーカスリングを削除
   * @param {HTMLElement} element - 要素
   */
  removeFocusRing(element) {
    const ring = element.parentElement.querySelector('.focus-ring');
    if (ring) ring.remove();
  }

  /**
   * クリックエフェクトを設定
   */
  setupClickEffects() {
    const clickableElements = document.querySelectorAll('[data-click-effect]');

    clickableElements.forEach(element => {
      element.addEventListener('click', (e) => {
        const effectType = element.dataset.clickEffect || 'pulse';
        this.createClickEffect(e, effectType);
      });
    });
  }

  /**
   * クリックエフェクトを作成
   * @param {Event} e - イベント
   * @param {string} type - エフェクトタイプ
   */
  createClickEffect(e, type) {
    const element = e.currentTarget;
    const effect = document.createElement('div');
    effect.className = `click-effect ${type}`;

    const rect = element.getBoundingClientRect();
    effect.style.left = `${e.clientX - rect.left}px`;
    effect.style.top = `${e.clientY - rect.top}px`;

    element.appendChild(effect);

    setTimeout(() => {
      effect.remove();
    }, 600);
  }

  /**
   * ローディングエフェクトを設定
   */
  setupLoadingEffects() {
    // ページ読み込みアニメーション
    this.setupPageLoadAnimation();

    // スケルトンスクリーン
    this.setupSkeletonScreens();
  }

  /**
   * ページ読み込みアニメーションを設定
   */
  setupPageLoadAnimation() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          loader.classList.add('fade-out');
          setTimeout(() => {
            loader.style.display = 'none';
          }, 500);
        }, 500);
      });
    }
  }

  /**
   * スケルトンスクリーンを設定
   */
  setupSkeletonScreens() {
    const skeletons = document.querySelectorAll('.skeleton');

    const animateSkeleton = () => {
      skeletons.forEach(skeleton => {
        const keyframes = [
          { backgroundPosition: '200% 0' },
          { backgroundPosition: '-200% 0' }
        ];

        skeleton.animate(keyframes, {
          duration: 1500,
          iterations: Infinity,
          easing: 'linear'
        });
      });
    };

    animateSkeleton();
  }

  /**
   * トースト通知を設定
   */
  setupToasts() {
    // トーストコンテナを作成
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);

    // トーストイベントをリッスン
    window.addEventListener('showToast', (e) => {
      this.showToast(e.detail.message, e.detail.type);
    });
  }

  /**
   * トーストを表示
   * @param {string} message - メッセージ
   * @param {string} type - タイプ
   */
  showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // アニメーション
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 自動的に閉じる
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  /**
   * パララックス効果を設定
   */
  setupParallaxEffects() {
    // マウスパララックス
    this.setupMouseParallax();

    // スクロールパララックス
    this.setupScrollParallax();
  }

  /**
   * マウスパララックスを設定
   */
  setupMouseParallax() {
    const parallaxElements = document.querySelectorAll('[data-mouse-parallax]');

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.mouseParallax) || 10;
        const translateX = x * speed;
        const translateY = y * speed;

        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      });
    });
  }

  /**
   * スクロールパララックスを設定
   */
  setupScrollParallax() {
    const parallaxElements = document.querySelectorAll('[data-scroll-parallax]');

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;

      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.scrollParallax) || 0.5;
        const yPos = -(scrollTop * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * ローディングアニメーションを設定
   */
  setupLoadingAnimations() {
    // スピナー
    this.setupSpinners();

    // プログレスバー
    this.setupProgressIndicators();
  }

  /**
   * スピナーを設定
   */
  setupSpinners() {
    const spinners = document.querySelectorAll('.spinner');

    spinners.forEach(spinner => {
      const size = spinner.dataset.size || '40px';
      const color = spinner.dataset.color || '#007bff';

      spinner.style.width = size;
      spinner.style.height = size;
      spinner.style.borderTopColor = color;
    });
  }

  /**
   * プログレスインジケーターを設定
   */
  setupProgressIndicators() {
    const indicators = document.querySelectorAll('.progress-indicator');

    indicators.forEach(indicator => {
      const progress = indicator.dataset.progress || 0;
      const bar = indicator.querySelector('.progress-bar') || indicator;

      setTimeout(() => {
        bar.style.width = `${progress}%`;
      }, 100);
    });
  }

  /**
   * リサイズ処理を設定
   */
  setupResizeHandling() {
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  /**
   * リサイズを処理
   */
  handleResize() {
    // リサイズ時の再計算
    this.intersectionRatios.clear();
    this.animatedElements.clear();

    // アニメーションを再実行
    this.observeAnimatedElements();
  }

  /**
   * トランジション効果を最適化
   */
  optimizeTransitions() {
    // GPUアクセラレーションを有効化
    const elements = document.querySelectorAll('.transition-optimized');
    elements.forEach(element => {
      element.style.willChange = 'transform, opacity';
    });

    // トランジションの監視
    document.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
        e.target.style.willChange = '';
      }
    });
  }

  /**
   * アニメーションを追加
   * @param {HTMLElement} element - 要素
   * @param {string} animation - アニメーション名
   * @param {Object} options - オプション
   */
  addAnimation(element, animation, options = {}) {
    element.classList.add('animated', animation);

    if (options.duration) {
      element.style.animationDuration = `${options.duration}ms`;
    }

    if (options.delay) {
      element.style.animationDelay = `${options.delay}ms`;
    }

    // アニメーション完了時のクリーンアップ
    element.addEventListener('animationend', () => {
      if (options.removeOnComplete) {
        element.classList.remove(animation);
      }
    }, { once: true });
  }

  /**
   * AnimationManagerを破棄
   */
  destroy() {
    // IntersectionObserverを切断
    if (this.observer) {
      this.observer.disconnect();
    }

    // アニメーションタイマーをクリア
    this.animatingElements.forEach(timer => clearInterval(timer));
    this.animatingElements.clear();

    // リサイズタイマーをクリア
    clearTimeout(this.resizeTimer);

    // イベントリスナーを削除（実装に応じて）
    // ...

    this.isInitialized = false;

    if (window.Config?.debug) {
      console.log('AnimationManagerを破棄しました');
    }
  }
}