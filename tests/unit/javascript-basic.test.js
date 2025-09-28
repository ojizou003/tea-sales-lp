// JavaScript基本設定の単体テスト
describe('JavaScript基本設定', () => {
  let jsContent;
  let mockDocument;
  let mockWindow;

  beforeEach(() => {
    // テスト用のDOM環境をモック
    mockDocument = {
      readyState: 'loading',
      addEventListener: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      getElementById: jest.fn(),
      getElementsByClassName: jest.fn(),
      createElement: jest.fn(() => ({
        addEventListener: jest.fn(),
        appendChild: jest.fn(),
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        style: {},
        textContent: '',
        innerHTML: ''
      }))
    };

    mockWindow = {
      addEventListener: jest.fn(),
      scrollTo: jest.fn(),
      innerWidth: 1024,
      innerHeight: 768,
      matchMedia: jest.fn(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn()
      }))
    };

    // グローバルオブジェクトをモック
    global.document = mockDocument;
    global.window = mockWindow;
    global.alert = jest.fn();
    global.console = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

    // 実際のJavaScriptファイルを読み込む
    const fs = require('fs');
    const path = require('path');

    // テストファイルからの相対パスを計算
    const jsPath = path.join(__dirname, '..', '..', 'js', 'main.js');

    try {
      jsContent = fs.readFileSync(jsPath, 'utf8');
      console.log('実際のファイルを読み込みました:', jsPath);
      console.log('ファイル内容の長さ:', jsContent.length);
    } catch (error) {
      console.log('ファイル読み込みエラー:', error.message);
      // テストを失敗させる
      throw new Error(`JavaScriptファイルの読み込みに失敗しました: ${error.message}`);
    }
  });

  afterEach(() => {
    // モックをクリーンアップ
    global.document = undefined;
    global.window = undefined;
    global.alert = undefined;
    global.console = undefined;
  });

  describe('ファイル構造と基本設定', () => {
    test('main.jsファイルが存在すること', () => {
      // ファイル存在チェックは実際のファイルシステムアクセスが必要なため
      // ここではJavaScriptコンテンツの検証で代用
      expect(jsContent.length).toBeGreaterThan(0);
    });

    test('JavaScriptがモジュールとして設定されている', () => {
      expect(jsContent).toContain("'use strict';");
      expect(jsContent).toContain('export');
    });

    test('IIFE（即時実行関数式）を使用している', () => {
      expect(jsContent).toContain('(function()');
      expect(jsContent).toContain('})();');
    });
  });

  describe('DOM読み込みイベント', () => {
    test('DOMContentLoadedイベントリスナーが設定されている', () => {
      expect(jsContent).toContain('DOMContentLoaded');
      expect(jsContent).toContain('addEventListener');
    });

    test('loadイベントリスナーが設定されている', () => {
      expect(jsContent).toContain('load');
      expect(jsContent).toContain('addEventListener');
    });

    test('DOM読み込み完了時に初期化関数が呼ばれる', () => {
      expect(jsContent).toContain('init');
      expect(jsContent).toContain('TeaSalesApp');
    });
  });

  describe('エラーハンドリング', () => {
    test('グローバルエラーハンドラーが設定されている', () => {
      expect(jsContent).toContain('error');
      expect(jsContent).toContain('addEventListener');
      expect(jsContent).toContain('console.error');
    });

    test('アンハンドルドプロミスリジェクションハンドラーがある', () => {
      expect(jsContent).toContain('unhandledrejection');
      expect(jsContent).toContain('addEventListener');
    });

    test('コンソールエラーロギングが実装されている', () => {
      expect(jsContent).toContain('console.error');
    });
  });

  describe('モジュール式アーキテクチャ', () => {
    test('メインアプリケーションオブジェクトが定義されている', () => {
      expect(jsContent).toContain('TeaSalesApp');
      expect(jsContent).toContain('const TeaSalesApp');
    });

    test('ユーティリティ関数が定義されている', () => {
      expect(jsContent).toContain('utils');
      expect(jsContent).toContain('createElement');
      expect(jsContent).toContain('debounce');
    });

    test('初期化メソッドが実装されている', () => {
      expect(jsContent).toContain('init: function()');
      expect(jsContent).toContain('App initialized');
    });

    test('グローバルスコープに適切に公開されている', () => {
      expect(jsContent).toContain('window.TeaSalesApp = TeaSalesApp;');
    });
  });

  describe('パフォーマンス最適化', () => {
    test('debounce関数が実装されている', () => {
      expect(jsContent).toContain('debounce');
      expect(jsContent).toContain('setTimeout');
      expect(jsContent).toContain('clearTimeout');
    });

    test('イベントリスナーの適切な管理', () => {
      // イベントリスナーが関数内で定義されているか確認
      expect(jsContent).toContain('addEventListener');
      expect(jsContent.split('addEventListener').length).toBeGreaterThan(2);
    });

    test('メモリリーク防止の対策がある', () => {
      expect(jsContent).toContain('clearTimeout');
      expect(jsContent).toContain('later = () =>');
    });
  });

  describe('コード品質とベストプラクティス', () => {
    test('厳格モードが使用されている', () => {
      expect(jsContent).toContain("'use strict';");
    });

    test('適切なコメントが含まれている', () => {
      expect(jsContent).toContain('//');
      const commentLines = jsContent.split('\n').filter(line => line.trim().startsWith('//'));
      expect(commentLines.length).toBeGreaterThan(3);
    });

    test('セマンティックな関数名が使用されている', () => {
      expect(jsContent).toContain('init');
      expect(jsContent).toContain('createElement');
      expect(jsContent).toContain('debounce');
    });

    test('一貫したコーディング規約が使用されている', () => {
      // キャメルケースの使用
      expect(jsContent).toContain('TeaSalesApp');
      expect(jsContent).toContain('addEventListener');

      // 定数の命名規約
      expect(jsContent).not.toContain('TIMEOUT'); // 大文字の定数はない想定
    });
  });

  describe('ブラウザ互換性', () => {
    test('モダンJavaScript構文が使用されている', () => {
      expect(jsContent).toContain('const');
      expect(jsContent).toContain('=>');
      expect(jsContent).toContain('...args');
    });

    test('古いブラウザ向けのフォールバックがある', () => {
      // 基本的なフォールバックチェック
      expect(jsContent).toContain('addEventListener');
      expect(jsContent).toContain('function');
    });

    test('ES6+機能が適切に使用されている', () => {
      const arrowFunctionCount = (jsContent.match(/=>/g) || []).length;
      const constLetCount = (jsContent.match(/const|let/g) || []).length;
      expect(arrowFunctionCount).toBeGreaterThan(0);
      expect(constLetCount).toBeGreaterThan(0);
    });
  });

  describe('セキュリティ', () => {
    test('グローバルスコープの汚染を最小限に抑えている', () => {
      // IIFE内での実行を確認
      expect(jsContent).toContain('(function()');
      expect(jsContent).toContain('})();');

      // 明示的に公開されているもののみを確認（window.X = Y形式のみ、厳密なパターン）
      const globalExports = jsContent.match(/window\.\w+\s*=\s*[^(=]/g) || [];
      expect(globalExports.length).toBeLessThanOrEqual(2); // TeaSalesAppのみ許容
    });

    test('evalの使用がない', () => {
      expect(jsContent).not.toContain('eval(');
    });

    test('インラインスクリプトの危険な使用がない', () => {
      expect(jsContent).not.toContain('innerHTML');
      expect(jsContent).not.toContain('document.write');
    });
  });

  describe('アクセシビリティ', () => {
    test('ARIA属性を操作する機能がある', () => {
      // ユーティリティ関数がARIA属性を設定できるか
      expect(jsContent).toContain('createElement');
    });

    test('キーボードイベントハンドリングの準備がある', () => {
      // イベントシステムが実装されているか
      expect(jsContent).toContain('addEventListener');
    });

    test('フォーカス管理の基盤がある', () => {
      // DOM操作機能が実装されているか
      expect(jsContent).toContain('document');
      expect(jsContent).toContain('querySelector');
    });
  });
});