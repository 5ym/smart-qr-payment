# mogiri / もぎり

もぎり。QR で入場受付と物販(事前購入・当日販売・受け取り)をまとめて回すイベント用システム。

物販は旧 Smart QR Payment(**Django REST Framework + Nuxt(Vuetify)** から
**Bun + SvelteKit + SQLite + Pico CSS** へ書き換えたもの)、入場受付は旧 QRcode Entry System(qes、
**Laravel + jQuery** から同じ構成へ書き換えたもの)で、2 つを 1 つの SvelteKit アプリに統合しました。
スタッフのアカウントとログインは物販側の仕組み(`users.is_staff`)に揃えています。

## 技術スタック

| 領域           | 使用技術                                                        |
| -------------- | --------------------------------------------------------------- |
| ランタイム     | [Bun](https://bun.sh) 1.3+                                       |
| フレームワーク | [SvelteKit 3](https://svelte.dev/docs/kit)（Svelte 5 / runes）+ adapter-node |
| データベース   | SQLite（`bun:sqlite`、生SQLの薄いクエリ層）                    |
| UI             | [Blades](https://blades.ninja/) の Pico（Pico CSS v2 の後継、素の CSS）+ 自前スタイル |
| 認証           | サーバーサイドセッション（Cookie）+ `Bun.password`（argon2id）  |
| メール         | Azure Communication Services（Email REST API / 依存ゼロ）       |
| 決済           | Stripe（カード / 3-D セキュア）, Square POS（当日購入）         |
| QR             | 生成: `qrcode` / 読み取り: `html5-qrcode`                       |
| Lint/Format    | [Biome](https://biomejs.dev)                                    |

## セットアップ

```shell
# 依存関係のインストール
bun install

# サンプル商品と管理者ユーザーを投入（.env の DATABASE_URL を使用）
cp .env.example .env
bun run db:seed

# 開発サーバー起動（http://localhost:5173）
bun run dev
```

`db:seed` は既定で管理者ユーザー `admin@mogiri.local` / `adminpassword` を作成します
（`ADMIN_EMAIL` / `ADMIN_PASSWORD` で変更可）。このユーザーはスタッフ権限を持ち、
対面販売(`/real`)と入場受付のスタッフ画面(`/entry/status` / `/entry/list`)の両方に使えます。

> データベースのテーブルは初回接続時に自動作成されます（`src/lib/server/db/ddl.ts`）。
> ORM は使わず、`bun:sqlite` の上に薄い型付きクエリ層（`src/lib/server/db/repo.ts`）を置いています。

## 本番ビルド / 起動

```shell
ORIGIN=https://your-domain bun run build
DATABASE_URL=./data/mogiri.db bun ./build/index.js
```

SvelteKit の CSRF 判定は、自分の origin とフォーム送信の `Origin` を突き合わせます。
自分の origin は既定ではリクエストの `Host` と `https` から求めるので、
TLS を終端するリバースプロキシが `Host` をそのまま渡すなら設定は要りません。
それ以外（平文 http で直に開く、`Host` を書き換える等）は、**ビルド時**に `ORIGIN`
を渡して `paths.origin` に埋め込むか、実行時に `PROTOCOL_HEADER` / `HOST_HEADER`
を設定してください（adapter-node 6 で実行時の `ORIGIN` は無くなりました）。
`ORIGIN` はビルド成果物に埋め込まれるため、公開ドメインを変えたら再ビルドが必要です。
サーバーは `bun:sqlite` を使うため、必ず **Bun** で起動してください。

> **実行時依存ゼロ**: すべての依存は `devDependencies` にあり、adapter-node が
> サーバーバンドルへ固めるため、本番実行に `node_modules` は不要です
> （`build/` と Bun だけで動きます）。

### Docker

```shell
docker compose up --build
# アプリ: http://localhost:3000
```

## 環境変数

`.env.example` を参照してください。アプリが読む変数は `src/env.ts` で宣言します（SvelteKit 3 は宣言したものしか読めません）。主なもの:

- `DATABASE_URL` — SQLite ファイルのパス（既定 `./data/mogiri.db`）
- `PUBLIC_BASE_URL` — メール確認リンク等に使う公開 URL
- `ACS_CONNECTION_STRING`（または `ACS_ENDPOINT` + `ACS_ACCESS_KEY`）/ `ACS_SENDER_ADDRESS`
  — Azure Communication Services のメール送信設定（未設定時はリンクをログ出力）
- `STRIPE_SECRET_KEY` / `PUBLIC_STRIPE_PUBLISHABLE_KEY` — カード決済
- `PUBLIC_SQUARE_APPLICATION_ID` / `PUBLIC_SQUARE_CALLBACK_URL` — 当日購入(Square)

ACS / Stripe / Square が未設定でもアプリは起動し、該当機能のみ無効化（メールはログ出力）されます。

## 画面フロー

### 事前購入 `/pre`

1. `/pre` — 商品選択・メール / パスワード登録 → 確認メール送信
2. `/pre/verify/[code]` — メール確認 → アカウント有効化
3. `/pre/pay` — Stripe カード決済（3-D セキュア対応）
4. `/pre/qr` — 受け取り用 QR コードを表示

### 対面販売 `/real`（要スタッフ権限）

- `/real/accept` — カメラで受け取り QR を読み取り → `/real/confirm/[code]`
  (入場 QR を読んだときは `/entry/status?secret=…` へ)
- `/real/confirm/[code]` — 注文内容を確認し受け取り確定
- `/real/buy` — 当日購入（Square POS を起動）→ `/real/square` コールバック
- `/real/admin` — 直近の受け取り済み注文一覧

### 入場受付 `/entry`

1. `/entry` — 来場者が名前・連絡先・住所を登録 → 9 桁のシークレットと入場用 QR コードを発行
   (アカウントは作らない)。シークレットを入れれば QR を再表示できる
2. 受付でスタッフが QR を読み取る(`/real/accept` のカメラでも、端末の QR リーダーでも可)。
   QR の中身は `<origin>/entry/status?secret=…` の URL
3. `/entry/status?secret=…`(要スタッフ権限)— 登録内容とステータスを表示。
   「支払切替」「入場切替」はそれぞれを反転、「支払+入場」は両方を済みにする
4. `/entry/list`(要スタッフ権限)— 全登録の一覧

ステータスは `entries.status` のビットフラグ(1 = 入場済, 2 = 支払済)で、qes と同じ値です。
未ログインでスタッフ画面を開くと `/login?redirect=…` へ送られ、ログイン後に元の画面へ戻ります。

## ディレクトリ構成

```
src/
├── app.css                  # Blades の Pico の読み込みと共通クラス
├── env.ts                   # 読む環境変数の宣言（`$app/env/private` / `$app/env/public`）
├── hooks.server.ts          # セッションから locals.user を復元
├── lib/
│   ├── components/          # OrderTable / ProductPicker / Toasts
│   ├── stores/toast.svelte.ts
│   ├── validation.ts        # 共有バリデーション・入場 QR の判定（ブラウザ可）
│   └── server/              # サーバー専用
│       ├── db/              # index(接続) / schema(型) / ddl / repo(クエリ) / seed
│       ├── auth.ts          # セッション・パスワード
│       ├── orders.ts        # 注文集計
│       ├── guards.ts        # 認可ヘルパー
│       ├── acs.ts email.ts  # Azure Communication Services メール送信
│       ├── stripe.ts util.ts
└── routes/                  # ページ + /api エンドポイント
```

## スクリプト

| コマンド            | 内容                             |
| ------------------- | -------------------------------- |
| `bun run dev`       | 開発サーバー                     |
| `bun run build`     | 本番ビルド                       |
| `bun run start`     | ビルド済みサーバーを起動         |
| `bun run check`     | 型チェック（svelte-check + TypeScript 7 / tsgo） |
| `bun run lint`      | Biome チェック(lint + format)  |
| `bun run format`    | Biome で整形・自動修正           |
| `bun run test`      | 単体テスト(`bun test`)        |
| `bun run db:seed`   | 初期データ投入                   |
