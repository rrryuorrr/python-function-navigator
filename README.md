# Python Function Navigator

Pythonファイル内のクラスや関数へ素早く移動するための、軽量なVS Code拡張機能です。

Python言語サーバーが利用できる場合はVS CodeのDocument Symbolを使用し、利用できない場合はインデントを考慮した簡易パーサーへ自動的に切り替わります。

## 主な機能

- `class`、`def`、`async def`を一覧表示
- クラス内のメソッド、コンストラクター、ネスト関数を階層表示
- 一覧の項目をクリックすると、該当するコードへ移動して名前を選択
- エディターの切り替え時とファイル保存時に自動更新
- 編集停止から400ミリ秒後に更新し、入力中の負荷を抑制
- VSIXファイルによるオフラインインストールに対応

## 表示例

`test/sample.py`を開くと、Explorerに次のような一覧が表示されます。

```text
Python 関数一覧
|-- def main
|   `-- def nested_helper
|-- class ReportParser
|   |-- def __init__
|   |-- def parse
|   `-- async def export_csv
`-- async def load_data
```

## 動作要件

- VS Code 1.85.0以降
- Microsoft Python拡張機能の導入を推奨

Python拡張機能がなくても簡易パーサーで動作しますが、正確なシンボル解析にはPython言語サーバーが必要です。

## オフライン環境へのインストール

GitHub Releasesから`python-function-navigator-0.0.1.vsix`をダウンロードし、オフライン環境へコピーしてください。

### VS Codeの画面からインストール

1. コマンドパレットを開きます。
2. **Extensions: Install from VSIX...**を実行します。
3. コピーしたVSIXファイルを選択します。

### コマンドでインストール

```bash
code --install-extension python-function-navigator-0.0.1.vsix
```

インストール先のPCには、Node.js、npm、インターネット接続は不要です。

## 使い方

1. Pythonファイルを開きます。
2. Explorerサイドバーを開きます。
3. **Python 関数一覧**ビューを探します。
4. クラス名または関数名をクリックします。
5. エディターが該当するコードへ移動します。

一覧を手動更新する場合は、ビュー右上の更新アイコンをクリックするか、コマンドパレットから**Python Function Navigator: 一覧を更新**を実行してください。

## 開発方法

ビルド環境にのみNode.js 20以降とnpmが必要です。

```bash
npm install
npm run compile
npm test
```

VS Codeで`F5`を押すと、`test/sample.py`を開いたExtension Development Hostが起動します。

## VSIXの作成

インターネットへ接続できるビルド環境で、依存パッケージをインストールしてからパッケージを作成します。

```bash
npm install
npm run compile
npm test
npm run package
```

`python-function-navigator-0.0.1.vsix`が生成されます。このファイルをオフライン配布用に保管してください。

## 検証

付属の`test/sample.py`には次のケースが含まれています。

- トップレベル関数
- ネスト関数
- コンストラクターとメソッドを持つクラス
- 非同期メソッド
- トップレベルの非同期関数

`npm test`で簡易パーサーの動作を検証できます。

画面操作を確認する場合は、VS Codeで`F5`を押してExplorerを開き、各シンボルをクリックしてください。関数の追加や名前変更を行い、編集または保存後に一覧が更新されることも確認してください。

## 制限事項

- 簡易パーサーは、Pythonの文字列、デコレーター、複雑な複数行宣言を完全には解析しません。
- 引数一覧やdocstringは表示しません。
- 複数ファイル横断検索、関数呼び出し解析、import依存関係解析には対応していません。
- バージョン0.0.1ではPythonのみ対応しています。

## トラブルシューティング

### 関数一覧が表示されない

- エディター右下の言語モードが**Python**になっているか確認してください。
- より正確な解析が必要な場合は、Microsoft Python拡張機能を導入または有効化してください。
- **Python Function Navigator: 一覧を更新**を実行してください。
- Python言語サーバーが利用できない場合は、ファイルを保存すると簡易パーサーが使用されます。

### VSIXをインストールできない

- VS Codeが1.85.0以降であることを確認してください。
- VSIXファイルを再コピーし、破損していないか確認してください。
- コマンドで導入する場合は、VSIXの絶対パスを指定してください。

## ライセンス

MIT License
