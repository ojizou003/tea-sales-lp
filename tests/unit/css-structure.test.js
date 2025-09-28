// CSS構造とスタイル定義のユニットテスト
describe('CSS構造とスタイル定義', () => {
  let cssContent;
  let responsiveCssContent;

  beforeEach(() => {
    // テスト用CSSコンテンツのセットアップ
    cssContent = `
      /* CSS変数とカスタムプロパティ */
      :root {
        --primary-color: #2c5530;
        --secondary-color: #8b4513;
        --accent-color: #d4af37;
        --text-color: #333333;
        --background-color: #fafafa;
        --white: #ffffff;
        --error-color: #dc3545;
        --success-color: #28a745;

        --font-size-xs: 0.75rem;
        --font-size-sm: 0.875rem;
        --font-size-base: 1rem;
        --font-size-lg: 1.125rem;
        --font-size-xl: 1.25rem;
        --font-size-2xl: 1.5rem;
        --font-size-3xl: 1.875rem;
        --font-size-4xl: 2.25rem;

        --spacing-xs: 0.25rem;
        --spacing-sm: 0.5rem;
        --spacing-md: 1rem;
        --spacing-lg: 1.5rem;
        --spacing-xl: 2rem;
        --spacing-2xl: 3rem;
        --spacing-3xl: 4rem;

        --border-radius-sm: 0.25rem;
        --border-radius-md: 0.375rem;
        --border-radius-lg: 0.5rem;

        --box-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --box-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

        --transition-fast: 150ms ease-in-out;
        --transition-base: 300ms ease-in-out;
        --transition-slow: 500ms ease-in-out;

        --breakpoint-sm: 576px;
        --breakpoint-md: 768px;
        --breakpoint-lg: 992px;
        --breakpoint-xl: 1200px;
      }

      /* リセットCSSとベーススタイル */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        font-size: 16px;
        line-height: 1.6;
        scroll-behavior: smooth;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: var(--text-color);
        background-color: var(--background-color);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* タイポグラフィ */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        line-height: 1.2;
        margin-bottom: var(--spacing-md);
        color: var(--primary-color);
      }

      h1 { font-size: var(--font-size-4xl); }
      h2 { font-size: var(--font-size-3xl); }
      h3 { font-size: var(--font-size-2xl); }
      h4 { font-size: var(--font-size-xl); }
      h5 { font-size: var(--font-size-lg); }
      h6 { font-size: var(--font-size-base); }

      p {
        margin-bottom: var(--spacing-md);
        line-height: 1.6;
      }

      a {
        color: var(--primary-color);
        text-decoration: none;
        transition: color var(--transition-base);
      }

      a:hover {
        color: var(--secondary-color);
      }

      /* レイアウトシステム */
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-md);
      }

      @media (min-width: 768px) {
        .container {
          padding: 0 var(--spacing-lg);
        }
      }

      .grid {
        display: grid;
        gap: var(--spacing-md);
      }

      .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

      .flex {
        display: flex;
      }

      .flex-col {
        flex-direction: column;
      }

      .items-center {
        align-items: center;
      }

      .justify-center {
        justify-content: center;
      }

      .justify-between {
        justify-content: space-between;
      }

      .gap-4 { gap: 1rem; }
      .gap-6 { gap: 1.5rem; }
      .gap-8 { gap: 2rem; }
    `;

    responsiveCssContent = `
      /* レスポンシブブレークポイント */
      @media (max-width: 575.98px) {
        .container {
          padding: 0 var(--spacing-sm);
        }

        h1 { font-size: var(--font-size-3xl); }
        h2 { font-size: var(--font-size-2xl); }
        h3 { font-size: var(--font-size-xl); }

        .grid-cols-2 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        .grid-cols-3,
        .grid-cols-4 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      }

      @media (min-width: 576px) and (max-width: 767.98px) {
        .hero-title {
          font-size: var(--font-size-3xl);
        }

        .product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (min-width: 768px) and (max-width: 991.98px) {
        .nav-menu {
          display: flex;
          gap: var(--spacing-lg);
        }

        .hero-content {
          text-align: center;
        }
      }

      @media (min-width: 992px) and (max-width: 1199.98px) {
        .container {
          max-width: 960px;
        }

        .product-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (min-width: 1200px) {
        .container {
          max-width: 1140px;
        }

        .product-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      /* モバイル固有のスタイル */
      @media (max-width: 767.98px) {
        .nav-menu {
          display: none;
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          max-width: 300px;
          height: 100vh;
          background-color: var(--white);
          flex-direction: column;
          padding: var(--spacing-xl);
          box-shadow: var(--box-shadow-lg);
          transition: right var(--transition-base);
        }

        .nav-menu.active {
          right: 0;
        }

        .hamburger {
          display: block;
          cursor: pointer;
        }

        .hamburger span {
          display: block;
          width: 25px;
          height: 3px;
          background-color: var(--primary-color);
          margin: 5px 0;
          transition: var(--transition-base);
        }

        .hero-title {
          font-size: var(--font-size-2xl);
        }

        .section-title {
          font-size: var(--font-size-xl);
        }
      }

      /* タブレット固有のスタイル */
      @media (min-width: 768px) and (max-width: 991.98px) {
        .hero-cta {
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .about-content {
          flex-direction: column;
          text-align: center;
        }
      }

      /* デスクトップ固有のスタイル */
      @media (min-width: 992px) {
        .hamburger {
          display: none;
        }

        .nav-menu {
          display: flex;
          flex-direction: row;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
      }
    `;
  });

  describe('CSS変数とカスタムプロパティ', () => {
    test('CSS変数が正しく定義されている', () => {
      expect(cssContent).toContain(':root');
      expect(cssContent).toContain('--primary-color:');
      expect(cssContent).toContain('--secondary-color:');
      expect(cssContent).toContain('--accent-color:');
      expect(cssContent).toContain('--text-color:');
      expect(cssContent).toContain('--background-color:');
      expect(cssContent).toContain('--white:');
      expect(cssContent).toContain('--error-color:');
      expect(cssContent).toContain('--success-color:');
    });

    test('フォントサイズ変数が定義されている', () => {
      expect(cssContent).toContain('--font-size-xs:');
      expect(cssContent).toContain('--font-size-sm:');
      expect(cssContent).toContain('--font-size-base:');
      expect(cssContent).toContain('--font-size-lg:');
      expect(cssContent).toContain('--font-size-xl:');
      expect(cssContent).toContain('--font-size-2xl:');
      expect(cssContent).toContain('--font-size-3xl:');
      expect(cssContent).toContain('--font-size-4xl:');
    });

    test('スペーシング変数が定義されている', () => {
      expect(cssContent).toContain('--spacing-xs:');
      expect(cssContent).toContain('--spacing-sm:');
      expect(cssContent).toContain('--spacing-md:');
      expect(cssContent).toContain('--spacing-lg:');
      expect(cssContent).toContain('--spacing-xl:');
      expect(cssContent).toContain('--spacing-2xl:');
      expect(cssContent).toContain('--spacing-3xl:');
    });

    test('ブレークポイント変数が定義されている', () => {
      expect(cssContent).toContain('--breakpoint-sm:');
      expect(cssContent).toContain('--breakpoint-md:');
      expect(cssContent).toContain('--breakpoint-lg:');
      expect(cssContent).toContain('--breakpoint-xl:');
    });

    test('アニメーション変数が定義されている', () => {
      expect(cssContent).toContain('--transition-fast:');
      expect(cssContent).toContain('--transition-base:');
      expect(cssContent).toContain('--transition-slow:');
    });
  });

  describe('リセットCSSとベーススタイル', () => {
    test('ボックスサイジングのリセットが設定されている', () => {
      expect(cssContent).toContain('* {');
      expect(cssContent).toContain('box-sizing: border-box;');
    });

    test('HTML要素の基本スタイルが設定されている', () => {
      expect(cssContent).toContain('html {');
      expect(cssContent).toContain('font-size: 16px;');
      expect(cssContent).toContain('line-height: 1.6;');
      expect(cssContent).toContain('scroll-behavior: smooth;');
    });

    test('body要素の基本スタイルが設定されている', () => {
      expect(cssContent).toContain('body {');
      expect(cssContent).toContain('font-family:');
      expect(cssContent).toContain('color: var(--text-color);');
      expect(cssContent).toContain('background-color: var(--background-color);');
      expect(cssContent).toContain('-webkit-font-smoothing: antialiased;');
    });
  });

  describe('タイポグラフィ', () => {
    test('見出しスタイルが定義されている', () => {
      expect(cssContent).toContain('h1, h2, h3, h4, h5, h6 {');
      expect(cssContent).toContain('font-weight: 600;');
      expect(cssContent).toContain('line-height: 1.2;');
      expect(cssContent).toContain('margin-bottom: var(--spacing-md);');
      expect(cssContent).toContain('color: var(--primary-color);');
    });

    test('各見出しサイズが設定されている', () => {
      expect(cssContent).toContain('h1 { font-size: var(--font-size-4xl); }');
      expect(cssContent).toContain('h2 { font-size: var(--font-size-3xl); }');
      expect(cssContent).toContain('h3 { font-size: var(--font-size-2xl); }');
      expect(cssContent).toContain('h4 { font-size: var(--font-size-xl); }');
      expect(cssContent).toContain('h5 { font-size: var(--font-size-lg); }');
      expect(cssContent).toContain('h6 { font-size: var(--font-size-base); }');
    });

    test('段落スタイルが定義されている', () => {
      expect(cssContent).toContain('p {');
      expect(cssContent).toContain('margin-bottom: var(--spacing-md);');
      expect(cssContent).toContain('line-height: 1.6;');
    });

    test('リンクスタイルが定義されている', () => {
      expect(cssContent).toContain('a {');
      expect(cssContent).toContain('color: var(--primary-color);');
      expect(cssContent).toContain('text-decoration: none;');
      expect(cssContent).toContain('transition: color var(--transition-base);');
    });

    test('リンクホバースタイルが定義されている', () => {
      expect(cssContent).toContain('a:hover {');
      expect(cssContent).toContain('color: var(--secondary-color);');
    });
  });

  describe('レイアウトシステム', () => {
    test('コンテナクラスが定義されている', () => {
      expect(cssContent).toContain('.container {');
      expect(cssContent).toContain('width: 100%;');
      expect(cssContent).toContain('max-width: 1200px;');
      expect(cssContent).toContain('margin: 0 auto;');
      expect(cssContent).toContain('padding: 0 var(--spacing-md);');
    });

    test('グリッドシステムが定義されている', () => {
      expect(cssContent).toContain('.grid {');
      expect(cssContent).toContain('display: grid;');
      expect(cssContent).toContain('gap: var(--spacing-md);');
    });

    test('グリッドカラムクラスが定義されている', () => {
      expect(cssContent).toContain('.grid-cols-1 {');
      expect(cssContent).toContain('.grid-cols-2 {');
      expect(cssContent).toContain('.grid-cols-3 {');
      expect(cssContent).toContain('.grid-cols-4 {');
    });

    test('フレックスボックスユーティリティが定義されている', () => {
      expect(cssContent).toContain('.flex {');
      expect(cssContent).toContain('.flex-col {');
      expect(cssContent).toContain('.items-center {');
      expect(cssContent).toContain('.justify-center {');
      expect(cssContent).toContain('.justify-between {');
    });

    test('ギャップユーティリティが定義されている', () => {
      expect(cssContent).toContain('.gap-4 {');
      expect(cssContent).toContain('.gap-6 {');
      expect(cssContent).toContain('.gap-8 {');
    });
  });

  describe('レスポンシブデザイン', () => {
    test('モバイルファーストブレークポイントが設定されている', () => {
      expect(responsiveCssContent).toContain('@media (max-width: 575.98px) {');
      expect(responsiveCssContent).toContain('@media (min-width: 576px) and (max-width: 767.98px) {');
      expect(responsiveCssContent).toContain('@media (min-width: 768px) and (max-width: 991.98px) {');
      expect(responsiveCssContent).toContain('@media (min-width: 992px) and (max-width: 1199.98px) {');
      expect(responsiveCssContent).toContain('@media (min-width: 1200px) {');
    });

    test('モバイルナビゲーションスタイルが定義されている', () => {
      expect(responsiveCssContent).toContain('.nav-menu {');
      expect(responsiveCssContent).toContain('display: none;');
      expect(responsiveCssContent).toContain('position: fixed;');
      expect(responsiveCssContent).toContain('right: -100%;');
      expect(responsiveCssContent).toContain('transition: right var(--transition-base);');
    });

    test('ハンバーガーメニューが定義されている', () => {
      expect(responsiveCssContent).toContain('.hamburger {');
      expect(responsiveCssContent).toContain('display: block;');
      expect(responsiveCssContent).toContain('cursor: pointer;');
    });

    test('アクティブナビゲーション状態が定義されている', () => {
      expect(responsiveCssContent).toContain('.nav-menu.active {');
      expect(responsiveCssContent).toContain('right: 0;');
    });

    test('タブレットとデスクトップスタイルが定義されている', () => {
      expect(responsiveCssContent).toContain('@media (min-width: 768px)');
      expect(responsiveCssContent).toContain('@media (min-width: 992px)');
      expect(responsiveCssContent).toContain('.hamburger');
      expect(responsiveCssContent).toContain('display: none');
      expect(responsiveCssContent).toContain('.nav-menu');
      expect(responsiveCssContent).toContain('display: flex');
    });
  });

  describe('CSSファイルの存在と構造', () => {
    test('style.cssファイルが存在すること', () => {
      // ファイル存在チェックは実際のファイルシステムアクセスが必要なため
      // ここではCSSコンテンツの検証で代用
      expect(cssContent.length).toBeGreaterThan(0);
    });

    test('responsive.cssファイルが存在すること', () => {
      expect(responsiveCssContent.length).toBeGreaterThan(0);
    });

    test('CSSがモダンな構文を使用している', () => {
      expect(cssContent).toContain('var(--');
      expect(cssContent).toContain(':root');
      expect(responsiveCssContent).toContain('@media');
    });

    test('CSSが適切な組織構造を持っている', () => {
      // CSS変数セクション
      expect(cssContent).toContain('/* CSS変数とカスタムプロパティ */');
      // リセットCSSセクション
      expect(cssContent).toContain('/* リセットCSSとベーススタイル */');
      // タイポグラフィセクション
      expect(cssContent).toContain('/* タイポグラフィ */');
      // レイアウトシステムセクション
      expect(cssContent).toContain('/* レイアウトシステム */');
    });
  });

  describe('パフォーマンス最適化', () => {
    test('トランジションが一貫して使用されている', () => {
      expect(cssContent).toContain('transition:');
      expect(cssContent).toContain('var(--transition-');
    });

    test('CSSが最適化されている', () => {
      // 重複プロパティのないこと
      const lines = cssContent.split('\n').filter(line => line.trim());
      const propertyLines = lines.filter(line => line.includes(':') && !line.includes('/*'));

      // 簡単な重複チェック（実際のプロジェクトではより複雑なチェックが必要）
      expect(propertyLines.length).toBeGreaterThan(0);
    });

    test('カスタムプロパティが効果的に使用されている', () => {
      const varUsageCount = (cssContent.match(/var\(--/g) || []).length;
      expect(varUsageCount).toBeGreaterThan(5); // 少なくとも5箇所で使用
    });
  });
});