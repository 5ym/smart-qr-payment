# Smart QR Payment

QRコードを使ったセルフレジ / 事前購入システム。

このリポジトリは、元の **Django REST Framework + Nuxt(Vuetify)** 構成から
**Bun + SvelteKit + SQLite + DaisyUI** へ全面的に書き換えたものです。バックエンドと
フロントエンドは 1 つの SvelteKit アプリに統合されています。

## 技術スタック

| 領域           | 使用技術                                                        |
| -------------- | --------------------------------------------------------------- |
| ランタイム     | [Bun](https://bun.sh) 1.3+                                       |
| フレームワーク | [SvelteKit](https://kit.svelte.dev)（Svelte 5 / runes）+ adapter-node |
| データベース   | SQLite（`bun:sqlite`）+ [Drizzle ORM](https://orm.drizzle.team)  |
| UI             | [Tailwind CSS v4](https://tailwindcss.com) + [DaisyUI v5](https://daisyui.com) |
| 認証           | サーバーサイドセッション（Cookie）+ `Bun.password`（argon2id）  |
| 決済           | Stripe（カード / 3-D セキュア）, Square POS（当日購入）         |
| QR             | 生成: `qrcode` / 読み取り: `html5-qrcode`                       |

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

`db:seed` は既定で管理者ユーザー `admin@sqp.local` / `adminpassword` を作成します
（`ADMIN_EMAIL` / `ADMIN_PASSWORD` で変更可）。

> データベースのテーブルは初回接続時に自動作成されます（`src/lib/server/db/ddl.ts`）。
> マイグレーション運用をしたい場合は `bun run db:push`（drizzle-kit）も利用できます。

## 本番ビルド / 起動

```shell
bun run build
DATABASE_URL=./data/sqp.db ORIGIN=https://your-domain bun ./build/index.js
```

adapter-node の CSRF 判定のため、リバースプロキシ配下では `ORIGIN`
（または `PROTOCOL_HEADER` / `HOST_HEADER`）の設定が必要です。
サーバーは `bun:sqlite` を使うため、必ず **Bun** で起動してください。

### Docker

```shell
docker compose up --build
# アプリ: http://localhost:3000  /  MailHog: http://localhost:8025
```

## 環境変数

`.env.example` を参照してください。主なもの:

- `DATABASE_URL` — SQLite ファイルのパス（既定 `./data/sqp.db`）
- `PUBLIC_BASE_URL` — メール確認リンク等に使う公開 URL
- `SMTP_*` / `MAIL_FROM` — メール送信設定（未設定時はリンクをログ出力）
- `STRIPE_SECRET_KEY` / `PUBLIC_STRIPE_PUBLISHABLE_KEY` — カード決済
- `PUBLIC_SQUARE_APPLICATION_ID` / `PUBLIC_SQUARE_CALLBACK_URL` — 当日購入(Square)

Stripe / Square が未設定でもアプリは起動し、該当機能のみ無効化されます。

## 画面フロー

### 事前購入 `/pre`

1. `/pre` — 商品選択・メール / パスワード登録 → 確認メール送信
2. `/pre/verify/[code]` — メール確認 → アカウント有効化
3. `/pre/pay` — Stripe カード決済（3-D セキュア対応）
4. `/pre/qr` — 受け取り用 QR コードを表示

### 対面販売 `/real`（要スタッフ権限）

- `/real/accept` — カメラで受け取り QR を読み取り → `/real/confirm/[code]`
- `/real/confirm/[code]` — 注文内容を確認し受け取り確定
- `/real/buy` — 当日購入（Square POS を起動）→ `/real/square` コールバック
- `/real/admin` — 直近の受け取り済み注文一覧

## ディレクトリ構成

```
src/
├── app.css                  # Tailwind + DaisyUI テーマ
├── hooks.server.ts          # セッションから locals.user を復元
├── lib/
│   ├── components/          # OrderTable / ProductPicker / Toasts
│   ├── stores/toast.svelte.ts
│   ├── validation.ts        # 共有バリデーション（ブラウザ可）
│   └── server/              # サーバー専用
│       ├── db/              # schema / 接続 / DDL / seed
│       ├── auth.ts          # セッション・パスワード
│       ├── orders.ts        # 注文集計
│       ├── guards.ts        # 認可ヘルパー
│       ├── email.ts stripe.ts util.ts
└── routes/                  # ページ + /api エンドポイント
```

## スクリプト

| コマンド            | 内容                             |
| ------------------- | -------------------------------- |
| `bun run dev`       | 開発サーバー                     |
| `bun run build`     | 本番ビルド                       |
| `bun run start`     | ビルド済みサーバーを起動         |
| `bun run check`     | 型チェック（svelte-check）       |
| `bun run lint`      | Prettier + ESLint                |
| `bun run format`    | Prettier で整形                  |
| `bun run db:seed`   | 初期データ投入                   |
| `bun run db:push`   | スキーマを DB に反映（drizzle）  |
