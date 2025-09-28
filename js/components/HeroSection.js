/**
 * HeroSection - ページのヒーローセクションを管理するクラス
 * ヒーローコンテンツの表示、アニメーション、CTAボタンのインタラクションを担当
 */
export class HeroSection {
  constructor() {
    this.heroElement = document.getElementById('home');
    this.heroContent = this.heroElement?.querySelector('.hero-content');
    this.ctaButtons = this.heroElement?.querySelectorAll('.cta-button');
    this.isVisible = false;
    this.animationFrameId = null;
  }

  /**
   * HeroSectionを初期化する
   */
  initialize() {
    if (!this.heroElement) {
      console.warn('Hero element not found');
      return;
    }

    this.setupBackgroundImage();
    this.setupAnimations();
    this.bindCTAEvents();
    this.setupIntersectionObserver();
  }

  /**
   * 背景画像を設定する
   */
  setupBackgroundImage() {
    // ヒーローセクションに背景画像を追加
    this.heroElement.style.backgroundImage = "url('images/hero/tea-hero.jpg')";
    this.heroElement.style.backgroundSize = 'cover';
    this.heroElement.style.backgroundPosition = 'center';
    this.heroElement.style.backgroundRepeat = 'no-repeat';
    this.heroElement.style.position = 'relative';

    // オーバーレイを追加してテキストを読みやすくする
    const overlay = document.createElement('div');
    overlay.className = 'hero-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1;
    `;
    this.heroElement.insertBefore(overlay, this.heroElement.firstChild);

    // コンテンツを前面に配置
    if (this.heroContent) {
      this.heroContent.style.position = 'relative';
      this.heroContent.style.zIndex = '2';
    }
  }

  /**
   * アニメーションを設定する
   */
  setupAnimations() {
    // 初期状態を設定
    if (this.heroContent) {
      const elements = this.heroContent.querySelectorAll('h2, p, .hero-cta');
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.8s ease ${index * 0.2}s`;
      });
    }
  }

  /**
   * CTAボタンのイベントをバインドする
   */
  bindCTAEvents() {
    if (!this.ctaButtons) return;

    this.ctaButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          this.scrollToSection(targetId.substring(1));
        }

        // クリックアニメーション
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 100);
      });

      // ホバーエフェクト
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
      });
    });
  }

  /**
   * IntersectionObserverを設定してビューポートに入ったらアニメーションを開始
   */
  setupIntersectionObserver() {
    const options = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.isVisible = true;
          this.animateIn();
        }
      });
    }, options);

    observer.observe(this.heroElement);
  }

  /**
   * ヒーローセクションのアニメーションを開始
   */
  animateIn() {
    if (!this.heroContent) return;

    const elements = this.heroContent.querySelectorAll('h2, p, .hero-cta');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, index * 200);
    });

    // パララックス効果を追加
    this.setupParallaxEffect();
  }

  /**
   * パララックス効果を設定
   */
  setupParallaxEffect() {
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;
      const yPos = -(scrolled * parallaxSpeed);

      if (this.heroElement) {
        this.heroElement.style.backgroundPosition = `center ${yPos}px`;
      }

      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick);
  }

  /**
   * 指定されたセクションへスムーズスクロール
   * @param {string} sectionId - スクロール先のセクションID
   */
  scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const targetPosition = targetSection.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * ヒーローセクションをレンダリング（既存のHTMLを使用）
   * @returns {HTMLElement} ヒーローセクション要素
   */
  render() {
    return this.heroElement;
  }

  /**
   * リソースをクリーンアップ
   */
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.ctaButtons) {
      this.ctaButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
      });
    }
  }
}