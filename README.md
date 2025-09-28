# Tea Sales LP - お茶販売ランディングページ

[日本語](#日本語) | [English](#english)

## プロジェクト概要

これはお茶の販売を目的としたランディングページです。モダンなWeb技術を使用して、高速表示、レスポンシブデザイン、優れたパフォーマンスを実現しています。

## 特徴

- ✨ **高速表示**: 画像遅延読み込み、リソースヒント、Web Vitals最適化
- 📱 **レスポンシブデザイン**: モバイルファースト、6つのブレークポイント対応
- 🎨 **リッチなアニメーション**: スクロールアニメーション、ホバーエフェクト、マイクロインタラクション
- ♿ **アクセシビリティ**: ARIA属性、キーボードナビゲーション、スクリーンリーダー対応
- 🔧 **モジュラー設計**: ES6モジュールによる保守性の高いコード構造

## 技術スタック

- **HTML5**: セマンティックマークアップ
- **CSS3**: Flexbox, Grid, CSS変数, アニメーション
- **Vanilla JavaScript**: ES6+モジュール、クラスベース設計
- **Web API**: IntersectionObserver, PerformanceObserver, Fetch API

## プロジェクト構造

```
tea-sales-lp/
├── index.html              # メインHTMLファイル
├── css/
│   ├── style.css           # メインスタイルシート
│   └── responsive.css      # レスポンシブデザイン
├── js/
│   ├── main.js             # アプリケーションエントリーポイント
│   └── components/         # コンポーネント
│       ├── HeroSection.js      # ヒーローセクション
│       ├── NavigationManager.js # ナビゲーション管理
│       ├── ProductGrid.js       # 製品グリッド
│       ├── ContactForm.js       # お問い合わせフォーム
│       ├── PerformanceManager.js # パフォーマンス最適化
│       ├── ResponsiveManager.js  # レスポンシブ管理
│       └── AnimationManager.js  # アニメーション管理
├── images/
└── tests/
```

## インストール方法

1. リポジトリをクローン
```bash
git clone https://github.com/your-username/tea-sales-lp.git
cd tea-sales-lp
```

2. ローカルサーバーで実行
```bash
# Python 3を使用
python -m http.server 8000

# またはNode.jsを使用
npx serve .

# またはLive Server拡張機能を使用
```

3. ブラウザで `http://localhost:8000` にアクセス

## コンポーネント

### HeroSection
ヒーローセクションのコンポーネントです。スライダー機能、CTAボタン、画像遅延読み込みを提供します。

### NavigationManager
スムーズスクロール、アクティブセクション検出、モバイルメニュー機能を管理します。

### ProductGrid
製品カタログをグリッド形式で表示します。フィルタリング機能、製品詳細表示を提供します。

### ContactForm
お問い合わせフォームのバリデーションと送信機能を提供します。

### PerformanceManager
パフォーマンス最適化を担当：
- 画像遅延読み込み
- Web Vitals監視
- リソースヒント
- メモリ使用量監視

### ResponsiveManager
レスポンシブデザインを管理：
- ブレークポイント検出
- モバイルメニュー
- レスポンシブ画像
- タッチデバイス最適化

### AnimationManager
アニメーションとインタラクションを管理：
- スクロールアニメーション
- ホバーエフェクト
- パララックス効果
- トースト通知

## 使用方法

### スクロールアニメーション
要素に `data-animation` 属性を追加：
```html
<div class="fade-in" data-animation="fade">アニメーション要素</div>
```

### 画像遅延読み込み
`data-src` 属性を使用：
```html
<img data-src="path/to/image.jpg" alt="説明">
```

### パララックス効果
```html
<div class="parallax" data-parallax-speed="0.5">パララックス要素</div>
```

## 開発

### コード規約
- ESLintでのコードチェック
- ES6+モジュールシステム
- クラスベースのコンポーネント設計
- 日本語でのコメントとドキュメント

### ビルド手順
本プロジェクトはビルドツールを使用せず、ネイティブのHTML/CSS/JavaScriptで動作します。

### テスト
```bash
# ユニットテスト
npm test

# E2Eテスト
npm run test:e2e

# アクセシビリティテスト
npm run test:a11y
```

## パフォーマンス

### 目標指標
- **First Contentful Paint**: 1.5秒以内
- **Largest Contentful Paint**: 2.5秒以内
- **Cumulative Layout Shift**: 0.1以下
- **Time to Interactive**: 3秒以内
- **Lighthouseスコア**: 90以上

### 最適化機能
- IntersectionObserverによる遅延読み込み
- CSS変数による効率的なスタイリング
- イベントデバウンスとスロットリング
- メモリリーク防止

## ブラウザサポート

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ライセンス

MIT License

## 貢献

1. フォーク
2. 機能ブランチ作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. プッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエスト

## 作者

- [おぢぞう Lab.] - [@ojizou003](https://github.com/ojizou003)

## 謝辞

- デザインインスピレーション
- 使用したオープンソースライブラリ
- テストに協力してくれた人々

---

## English

# Tea Sales LP - Tea Sales Landing Page

A modern landing page for tea sales, built with performance and user experience in mind.

## Features

- ✨ **Fast Loading**: Lazy loading, resource hints, Web Vitals optimization
- 📱 **Responsive Design**: Mobile-first, 6 breakpoint system
- 🎨 **Rich Animations**: Scroll animations, hover effects, micro-interactions
- ♿ **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
- 🔧 **Modular Architecture**: ES6 modules, class-based components

## Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, CSS Variables, Animations
- **Vanilla JavaScript**: ES6+ modules, class-based design
- **Web APIs**: IntersectionObserver, PerformanceObserver, Fetch API

## Project Structure

```
tea-sales-lp/
├── index.html              # Main HTML file
├── css/
│   ├── style.css           # Main stylesheet
│   └── responsive.css      # Responsive design
├── js/
│   ├── main.js             # Application entry point
│   └── components/         # Components
│       ├── HeroSection.js      # Hero section
│       ├── NavigationManager.js # Navigation management
│       ├── ProductGrid.js       # Product grid
│       ├── ContactForm.js       # Contact form
│       ├── PerformanceManager.js # Performance optimization
│       ├── ResponsiveManager.js  # Responsive management
│       └── AnimationManager.js  # Animation management
├── images/
└── tests/
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/tea-sales-lp.git
cd tea-sales-lp
```

2. Run with a local server
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx serve .

# Or use Live Server extension
```

3. Open `http://localhost:8000` in your browser

## Components

### HeroSection
Hero section component with slider, CTA buttons, and lazy loading.

### NavigationManager
Manages smooth scrolling, active section detection, and mobile menu.

### ProductGrid
Displays product catalog in grid layout with filtering.

### ContactForm
Handles form validation and submission.

### PerformanceManager
Performance optimization including:
- Image lazy loading
- Web Vitals monitoring
- Resource hints
- Memory usage monitoring

### ResponsiveManager
Responsive design management:
- Breakpoint detection
- Mobile menu
- Responsive images
- Touch device optimizations

### AnimationManager
Animation and interaction management:
- Scroll animations
- Hover effects
- Parallax effects
- Toast notifications

## Usage

### Scroll Animations
Add `data-animation` attribute to elements:
```html
<div class="fade-in" data-animation="fade">Animated element</div>
```

### Lazy Loading Images
Use `data-src` attribute:
```html
<img data-src="path/to/image.jpg" alt="Description">
```

### Parallax Effects
```html
<div class="parallax" data-parallax-speed="0.5">Parallax element</div>
```

## Development

### Code Standards
- ESLint for code quality
- ES6+ module system
- Class-based component design
- Japanese comments and documentation

### Build Process
No build tools required - runs natively with HTML/CSS/JavaScript.

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y
```

## Performance

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

### Optimization Features
- IntersectionObserver for lazy loading
- CSS Variables for efficient styling
- Event debouncing and throttling
- Memory leak prevention

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License

## Contributing

1. Fork
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Author

- [Ojizou Lab] - [@ojizou003](https://github.com/ojizou003)

## Acknowledgments

- Design inspiration
- Open source libraries used
- Testers and contributors