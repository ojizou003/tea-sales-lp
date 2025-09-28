// HTML構造のユニットテスト
describe('HTML構造', () => {
  let htmlContent;

  beforeEach(() => {
    // テスト用HTMLのセットアップ
    htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>お茶販売 - 高級茶葉の専門店</title>
        <meta name="description" content="厳選されたお茶の葉を販売する専門店。緑茶、紅茶、ウーロン茶など、品質の高い茶葉をお届けします。">
        <link rel="stylesheet" href="css/style.css">
        <link rel="stylesheet" href="css/responsive.css">
      </head>
      <body>
        <header class="header" id="header">
          <nav class="navigation" id="navigation">
            <div class="nav-container">
              <div class="nav-logo">
                <h1>茶禅一味</h1>
              </div>
              <ul class="nav-menu" id="nav-menu">
                <li class="nav-item"><a href="#home" class="nav-link">ホーム</a></li>
                <li class="nav-item"><a href="#products" class="nav-link">製品紹介</a></li>
                <li class="nav-item"><a href="#about" class="nav-link">会社情報</a></li>
                <li class="nav-item"><a href="#contact" class="nav-link">お問い合わせ</a></li>
              </ul>
              <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </nav>
        </header>

        <main>
          <section id="home" class="hero">
            <div class="hero-content">
              <h2 class="hero-title">茶禅一味</h2>
              <p class="hero-subtitle">厳選された茶葉で、至福のひとときを</p>
              <div class="hero-cta">
                <a href="#products" class="cta-button">製品を見る</a>
                <a href="#contact" class="cta-button secondary">お問い合わせ</a>
              </div>
            </div>
          </section>

          <section id="products" class="products">
            <div class="container">
              <h2 class="section-title">製品紹介</h2>
              <div class="product-grid" id="product-grid">
                <!-- 製品カードはJavaScriptで動的に生成 -->
              </div>
            </div>
          </section>

          <section id="about" class="about">
            <div class="container">
              <h2 class="section-title">会社情報</h2>
              <div class="about-content">
                <div class="about-text">
                  <h3>品質へのこだわり</h3>
                  <p>茶禅一味は、創業以来、品質の高い茶葉をお届けすることに力を注いでいます。</p>
                </div>
                <div class="about-image">
                  <img src="images/company/tea-garden.jpg" alt="茶園の様子" loading="lazy">
                </div>
              </div>
            </div>
          </section>

          <section id="contact" class="contact">
            <div class="container">
              <h2 class="section-title">お問い合わせ</h2>
              <form id="contact-form" class="contact-form">
                <div class="form-group">
                  <label for="name">お名前 *</label>
                  <input type="text" id="name" name="name" required>
                  <span class="error-message" id="name-error"></span>
                </div>
                <div class="form-group">
                  <label for="email">メールアドレス *</label>
                  <input type="email" id="email" name="email" required>
                  <span class="error-message" id="email-error"></span>
                </div>
                <div class="form-group">
                  <label for="phone">電話番号</label>
                  <input type="tel" id="phone" name="phone">
                </div>
                <div class="form-group">
                  <label for="subject">件名 *</label>
                  <input type="text" id="subject" name="subject" required>
                  <span class="error-message" id="subject-error"></span>
                </div>
                <div class="form-group">
                  <label for="message">お問い合わせ内容 *</label>
                  <textarea id="message" name="message" rows="5" required></textarea>
                  <span class="error-message" id="message-error"></span>
                </div>
                <button type="submit" class="submit-button">送信する</button>
                <div class="success-message" id="success-message" style="display: none;">
                  お問い合わせありがとうございます。ご連絡いたします。
                </div>
              </form>
            </div>
          </section>
        </main>

        <footer class="footer">
          <div class="container">
            <div class="footer-content">
              <div class="footer-section">
                <h3>茶禅一味</h3>
                <p>厳選された茶葉で、至福のひとときを</p>
              </div>
              <div class="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="#home">ホーム</a></li>
                  <li><a href="#products">製品紹介</a></li>
                  <li><a href="#about">会社情報</a></li>
                  <li><a href="#contact">お問い合わせ</a></li>
                </ul>
              </div>
              <div class="footer-section">
                <h4>お問い合わせ</h4>
                <p>電話: 0123-456-7890</p>
                <p>メール: info@chazenichimi.jp</p>
              </div>
            </div>
            <div class="footer-bottom">
              <p>&copy; 2024 茶禅一味. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <script src="js/main.js" type="module"></script>
      </body>
      </html>
    `;
  });

  describe('基本HTML構造', () => {
    test('DOCTYPEとhtmlタグが正しく設定されている', () => {
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html lang="ja">');
    });

    test('メタ情報が適切に設定されている', () => {
      expect(htmlContent).toContain('<meta charset="UTF-8">');
      expect(htmlContent).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      expect(htmlContent).toContain('<title>お茶販売 - 高級茶葉の専門店</title>');
      expect(htmlContent).toContain('<meta name="description" content="');
    });

    test('CSSファイルが正しくリンクされている', () => {
      expect(htmlContent).toContain('<link rel="stylesheet" href="css/style.css">');
      expect(htmlContent).toContain('<link rel="stylesheet" href="css/responsive.css">');
    });

    test('JavaScriptファイルが正しくリンクされている', () => {
      expect(htmlContent).toContain('<script src="js/main.js" type="module"></script>');
    });
  });

  describe('セマンティック構造', () => {
    test('セマンティックHTML5要素が使用されている', () => {
      expect(htmlContent).toContain('<header');
      expect(htmlContent).toContain('<nav');
      expect(htmlContent).toContain('<main>');
      expect(htmlContent).toContain('<section');
      expect(htmlContent).toContain('<footer');
    });

    test('主要セクションが正しく構成されている', () => {
      expect(htmlContent).toContain('id="home"');
      expect(htmlContent).toContain('id="products"');
      expect(htmlContent).toContain('id="about"');
      expect(htmlContent).toContain('id="contact"');
    });

    test('ナビゲーションメニューが正しく構成されている', () => {
      expect(htmlContent).toContain('id="navigation"');
      expect(htmlContent).toContain('id="nav-menu"');
      expect(htmlContent).toContain('class="nav-link"');
      expect(htmlContent).toContain('href="#home"');
      expect(htmlContent).toContain('href="#products"');
      expect(htmlContent).toContain('href="#about"');
      expect(htmlContent).toContain('href="#contact"');
    });
  });

  describe('アクセシビリティ', () => {
    test('フォーム要素に適切なラベルが設定されている', () => {
      expect(htmlContent).toContain('<label for="name">');
      expect(htmlContent).toContain('<label for="email">');
      expect(htmlContent).toContain('<label for="phone">');
      expect(htmlContent).toContain('<label for="subject">');
      expect(htmlContent).toContain('<label for="message">');
    });

    test('必須フィールドが適切にマークされている', () => {
      expect(htmlContent).toContain('required');
    });

    test('画像にalt属性が設定されている', () => {
      expect(htmlContent).toContain('alt="茶園の様子"');
      expect(htmlContent).toContain('loading="lazy"');
    });
  });

  describe('コンポーネント構造', () => {
    test('ヒーローセクションが正しく構成されている', () => {
      expect(htmlContent).toContain('class="hero"');
      expect(htmlContent).toContain('class="hero-title"');
      expect(htmlContent).toContain('class="hero-subtitle"');
      expect(htmlContent).toContain('class="hero-cta"');
      expect(htmlContent).toContain('class="cta-button"');
    });

    test('製品グリッドが正しく構成されている', () => {
      expect(htmlContent).toContain('id="product-grid"');
      expect(htmlContent).toContain('class="product-grid"');
    });

    test('お問い合わせフォームが正しく構成されている', () => {
      expect(htmlContent).toContain('id="contact-form"');
      expect(htmlContent).toContain('class="contact-form"');
      expect(htmlContent).toContain('class="form-group"');
      expect(htmlContent).toContain('class="error-message"');
      expect(htmlContent).toContain('class="success-message"');
    });

    test('フッターが正しく構成されている', () => {
      expect(htmlContent).toContain('class="footer"');
      expect(htmlContent).toContain('class="footer-content"');
      expect(htmlContent).toContain('class="footer-section"');
    });
  });
});