<div align="center">

# Astra Studio

### データを、探索できる空間へ。

ビジュアルダッシュボード制作 · Three.js デジタルツイン · SVG ヘッダーデザイナー

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

[デモ](https://yinweinidongle.github.io/big-screen-astra/) · [テンプレート](https://yinweinidongle.github.io/big-screen-astra/templates/city/) · [Header Studio](https://yinweinidongle.github.io/big-screen-astra/header-studio/) · [フル機能版](https://shanghai-city-observatory.brainy-pony-0848.chatgpt.site/)

![MIT](https://img.shields.io/badge/license-MIT-8fb6ff) ![Vue 3](https://img.shields.io/badge/Vue-3-42b883) ![Three.js](https://img.shields.io/badge/Three.js-WebGL-101827) ![Node](https://img.shields.io/badge/Node-%E2%89%A522.12-5c9e56)

![4 種類の業種別テンプレートの実際の画面](docs/screenshots/overview.webp)

</div>

Astra Studio は、自由配置のキャンバス、データ可視化、操作できる 3D シーン、アニメーション付きヘッダーの制作を一つのワークスペースにまとめたツールです。テンプレートから始め、各コンポーネントの配置、スタイル、データ、インタラクションを調整できます。内蔵の業務データはすべてデモ用です。README は 3 言語に対応しています。現在のエディター UI は中国語です。

## それぞれ異なる 4 つのテンプレート

レイアウト、パネル、チャート、3D シーンを業種ごとに設計しています。

| テンプレート | デザインとシーンの特徴 | デモ |
| --- | --- | --- |
| スマートシティ | 寒色の指令センター。342 棟のインスタンス建築、上海のランドマーク、橋、水辺の遊歩道、車の流れ | [都市](https://yinweinidongle.github.io/big-screen-astra/templates/city/) |
| スマート農業 | エメラルドと淡い金色。温室、1,134 株の作物、果樹、灌漑・ろ過設備、ドローン | [農業](https://yinweinidongle.github.io/big-screen-astra/templates/agriculture/) |
| スマート工場 | グラファイトと琥珀色。内部が見える工場、ロボットアーム、AGV、搬送ライン、配管、保守通路 | [工業](https://yinweinidongle.github.io/big-screen-astra/templates/industry/) |
| スマートキャンパス | 紫と銀のガラス表現。カーテンウォール、空中連絡通路、屋上太陽光、充電設備、噴水 | [キャンパス](https://yinweinidongle.github.io/big-screen-astra/templates/campus/) |

## 制作ワークスペース

![Astra Studio エディターの実際の画面](docs/screenshots/workbench.webp)

- **自由なレイアウト**：ドラッグ、8 方向のサイズ変更、複数選択、グループ化、重なり順、ロック、吸着、整列、等間隔配置。全体表示、全面表示、幅に合わせる表示、引き伸ばしに対応。
- **視覚効果の設定**：29 コンポーネント、14 種のチャート、6 テーマ、6 背景、8 種の枠。回転数字、スクロールリスト、グラデーション、グロー、周辺減光、色行列。
- **空間コンポーネント**：Three.js シーンと地球、GLB/glTF 読み込み、マテリアル、アニメーション、FlyTo、自動巡回、モデル選択、POI カード。Mapbox の建築・DEM 地形には利用者自身の公開 Token が必要です。
- **データと連動**：静的 JSON、HTTP、WebSocket、フィールド対応付け、更新間隔、クリック・ホバー、絞り込み、ドリルダウン。SQL は Worker 側の制限付き D1 クエリを利用し、外部 DB は独自の HTTP ゲートウェイ経由で接続します。
- **持ち運べるプロジェクト**：IndexedDB 保存、元に戻す・やり直し、ローカル履歴。JSON や素材を含む `.astra.zip` を入出力できます。

## Scene Studio · 既存のシーンにモデルを配置

![Scene Studio エディター](docs/screenshots/scene-editor.webp)

ワークスペースの **场景编辑**、または 3D コンポーネントの **进入 3D 场景编辑**から開きます。現在の都市、農場、工場、キャンパスを保持したまま、同じコンポーネント内にモデルを追加できます。

1. オフィス、倉庫、太陽光パネル、風車、充電器、ロボットアーム、ポンプ、カメラ、樹木、コンテナの 10 素材から選択できます。単体設備の GLB プリセット 3 種類と、独自の GLB/glTF アップロードにも対応します。
2. ギズモで移動・回転・拡縮するか、シーンの表面をクリックして配置します。ワールド / ローカル座標、吸着、複製、表示切替、ロック、元に戻す・やり直し、初期視点の保存が利用できます。`W / E / R` でツールを切り替え、`F` で選択対象に寄ります。
3. 8 種類のマテリアルから色、金属度、粗さ、透明度、発光、ホログラム走査を調整します。回転・浮遊・脈動の動きや GLB 内蔵アニメーションも設定できます。
4. モデルに追従するラベル、または独立したラベルを表面に配置できます。タイトル、説明、状態、最大 8 行の情報、強調色、HTTP/HTTPS リンクを設定し、**交互预览** でポップアップを確認できます。
5. **应用并返回** で元のコンポーネントへ保存します。モデルファイルは `.astra.zip` に同梱され、ラベルと変換情報はプロジェクト、履歴、公開設定に保持されます。

3D コンポーネントごとに最大 64 オブジェクトを追加できます。内蔵シーンは基礎レイヤーとして保持し、追加したモデルとラベルを個別に編集します。オブジェクトの編集で基礎シーン全体を再構築することはありません。ポップアップの情報は利用者が設定し、コンポーネント間の連動はインタラクション設定で行います。

![カスタムラベルと情報パネル](docs/screenshots/scene-panel.webp)

## Astra Copilot · ダッシュボード設計エージェント

![ツール実行と品質チェックの実画面](docs/screenshots/agent-copilot.webp)

右上の **智能创作** から業務、スタイル、指標、シーンを記述します。**18 個のネイティブツール** で編集可能な作品を生成し、現在の画面や選択した部品だけを調整できます。Header、グラフ、既存 3D シーン、マテリアル、対話ラベルに対応します。

- **実行 → フィードバック → 評価 → 修正**：実際の引数、結果、所要時間、失敗を確認できます。DOM、文字切れ、画面境界、データ項目、連動先、Three.js の計測値をチェック。モデル呼び出しは最大 16 ラウンド、修正は最大 2 ラウンドです。
- **適用前のプレビュー**：元の作品と草稿を比較し、一括適用・取り消しが可能。選択範囲とロックを尊重し、手動編集との競合を検出します。完成した草稿は再読み込み後も復元でき、停止しても完了部分を保持します。
- **モデル設定**：標準は OpenRouter / `anthropic/claude-haiku-5.5`。DeepSeek、Qwen、GLM、Kimi、Doubao、SiliconFlow、MiniMax、OpenAI、Anthropic、Gemini、カスタム HTTPS 互換 API を設定できます。モデル一覧取得、ID 入力、実際の関数呼び出しテストに対応。各社のキーとツール対応モデルが必要です。
- **サーバー側の認証情報**：標準キーはワークスペース所有者専用。個人接続はアカウントごとに分離し、D1 に AES-GCM で暗号化保存します。キーはフロントエンド、作品 JSON、エクスポートに含まれません。接続先変更時は新しいキーが必要です。

スコアは構造・実行状況のチェックであり、画像の美的評価ではありません。実データ未提供時はデモデータを使用し、データソース設定だけで接続成功とは表示しません。

ローカルでは `.dev.vars.example` を `.dev.vars` にコピーし、`AGENT_DEFAULT_API_KEY`、`AGENT_DEFAULT_MODEL`、固定の 64 桁 16 進数 `AGENT_ENCRYPTION_KEY` を設定して `npm run dev` を実行します。本番はランタイム Secret と `AGENT_DEFAULT_OWNER_ID` または `AGENT_DEFAULT_OWNER_EMAIL`、Sites 認証が必要です。キーを `VITE_*` に入れないでください。暗号化キー変更後は個人キーの再保存が必要です。

GitHub Pages は静的エディターです。**携带项目打开智能创作** は、送信元を検証するウィンドウ通信で現在の作品、入力内容、本機素材（合計 100 MB まで）をフル機能版へ渡します。既存作品を保持し、ログイン後に生成できます。受信だけで有料モデルを自動実行することはありません。

## Header Studio

![Header Studio の実際の画面](docs/screenshots/header-studio.webp)

12 種類の背景と輪郭に合わせた SVG 軌跡を用意しています。画像のアップロード、折れ線・曲線の描画、ノードとタイトルの移動、左右同期ミラー、交点以降の余分な線分の自動切り取りに対応します。

彗星、フェードする尾、残像、移動する点、粒子、連続光点、パルス、信号コード、スキャン、双方向合流、波紋、スペクトル、電弧、明滅、静的輪郭の 15 エフェクトを搭載。色、速度、方向、太さ、グローを調整できます。

Vue 単一ファイルコンポーネント、またはコンポーネント・画像・JSON を含む ZIP として出力できます。出力先では Vue 3.5+ が必要です。`P` で折れ線、`B` で曲線、`Enter` で完了、`V` で選択、`Space` で一時停止、`Ctrl/⌘ Z` で元に戻します。

科技 Header ウィジェットと Header Studio は、完全な設定と SVG レンダラーを共有します。ウィジェットを選択 → **进入 Header 设计器** → **应用到组件** で、画面を離れずに編集できます。プレビューには現在のダッシュボードと 3D シーンを表示します。フォント、太さ、サイズ、位置、字間、グラデーション、文字の発光、透明度、表示方法が即時反映されます。プリセットを変更してもタイトルを保持。キャンセル保護、元に戻す、再編集、プロジェクト入出力に対応します。独立版の **用于大屏** からもデザインをワークスペースへ渡し、適用前に確認できます。

![ヘッダーとダッシュボードの連携](docs/screenshots/header-connected.webp)


## ローカルで起動

**Node.js 22.12+** と npm が必要です。

```bash
git clone https://github.com/yinweinidongle/big-screen-astra.git
cd big-screen-astra
npm ci
npm run dev
```

開発コマンドはローカル D1 のマイグレーションを適用し、Vite `:5173` と Worker `:8787` を起動します。開発用アカウントはこのローカル環境でのみ有効です。

```bash
npm test                 # エディター、シーン、実 D1/R2、ヘッダー、交点処理
npm run build            # フロントエンド + Worker
npm run preview          # フル構成のビルドをローカルで確認
npm run build:pages      # dist/pages に静的サイトを生成
npm run preview:pages    # Pages 用ビルドを確認
```

## 2 つの公開方法

| 機能 | GitHub Pages | Worker + D1 + R2 |
| --- | :---: | :---: |
| テンプレート、3D、ヘッダー編集、コンポーネント出力 | ✓ | ✓ |
| ローカルプロジェクト、素材、履歴、プロジェクトパッケージ | ✓ | ✓ |
| ブラウザーからの HTTP / WebSocket 接続 | 接続先の CORS・接続許可が必要 | ✓ |
| アカウントごとのクラウドプロジェクト・素材 | — | ✓ |
| D1 SQL、公開スナップショット、パスワード・Token 共有 | — | ✓ |

**GitHub Pages**：`.github/workflows/pages.yml` が `master` / `main` への push 時に検証、ビルド、公開を実行します。Settings → Pages → Source で **GitHub Actions** を選択してください。ワークフローはリポジトリ名からベースパスを設定します。ローカルの既定値は `/big-screen-astra/` です。`PAGES_BASE_PATH=/my-repo/ npm run build:pages` で変更できます。個別の HTML エントリーがあるため、下層 URL への直接アクセスと再読み込みが可能です。[Vite の公開ガイド](https://vite.dev/guide/static-deploy.html#github-pages)も参照してください。

**フル機能版**：`npm run build` で `dist/client` と `dist/server` を生成します。Worker に `ASSETS`、D1 `DB`、R2 `BUCKET` をバインドし、`drizzle/` のマイグレーションを適用してください。クラウドへの書き込みは Sites の信頼済みユーザー識別情報を利用します。別のホストへ移す場合はサーバー側認証の対応が必要です。本番で `LOCAL_DEV` を有効にしないでください。保護された共有にはサーバー側の検証が必要で、静的ホスティングだけでは利用できません。

## ページ一覧

以下は公開先のベースパスからの相対パスです。

| パス | ページ |
| --- | --- |
| `/`、`/studio/` | ビジュアルエディター |
| `/templates/city/`、`/templates/agriculture/`、`/templates/industry/`、`/templates/campus/` | 編集可能な業種別テンプレートのプレビュー |
| `/header-studio/` | ヘッダーデザイナー |
| `/city/`、`/demo01/`、`/demo02/`、`/demo03/` | 従来の都市・農業・工業・キャンパスの独立デモ |
| `/player/` | ローカルプロジェクトのプレーヤー |
| `/view/:slug` | サーバーで公開したダッシュボード。フル構成が必要 |

## 性能と構成

建築・植生のインスタンス化、静的ジオメトリの統合、必要時の分割読み込み、影のキャッシュ、DPR の自動調整を利用しています。非表示・画面外のシーンは描画を止め、一時停止中は必要に応じて描画し、終了時に GPU リソースを解放します。画質 3 段階の上限は 30 / 30 / 60fps、DPR は 1× / 1.5× / 2× です。実際の性能は機器、解像度、ブラウザーによって異なります。

```text
src/workbench/          キャンバス、schema、部品、データ接続、詳細 3D シーン
src/studio/             ヘッダー編集、SVG 軌跡、プリセット、Vue/ZIP 出力
src/demos/              従来の独立ダッシュボード
src/paths.js            ルート・Pages サブパスの URL 処理
server/                 認証、権限、プロジェクト、公開、SQL、素材サービス
db/ · drizzle/          D1 定義とマイグレーション
scripts/                開発、ビルド、ジオメトリ・統合検証
docs/screenshots/       実際のアプリケーションのスクリーンショット
```

## コントリビュートとライセンス

Issue と Pull Request を歓迎します。提出前に `npm test` と `npm run build:pages` を実行してください。シーンを変更した場合は 4 テンプレートのアニメーション、一時停止、POI、描画負荷を確認してください。

本プロジェクト独自のコードは [MIT License](LICENSE) で公開しています。依存ライブラリ、フォント、地図サービス、パブリックドメインの地理データについては[第三者の権利表記](THIRD_PARTY_NOTICES.md)を参照してください。背景には AI 生成素材を含み、プロンプトは `docs/` に保存しています。手続き的に生成したシーンとデモデータは、実測地理情報や実稼働設備の状態を示すものではありません。
