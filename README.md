# Mastodon_Misskey_Crossposter

## about this

Mastodon のインスタンスに投稿した際に、同時に Misskey のインスタンスにも投稿する（クロスポスト）ためのスクリプトです。

## required environment

- 必須
  - Node.js(v20 で検証済み)
- 推奨
  - Docker
    - 稼働マシン自体に Node.js をインストールし、pm2 などを使って永続化させる場合は必要ではありません

## how to use

1. Mastodon インスタンスのユーザー設定->開発から API トークンを作成してください

   - 権限は read のみにしてください
   - API トークンは誰にも教えないでください
2. Misskey インスタンスの設定->その他の設定->API から API トークンを作成してください

   - 権限は「ドライブを操作する」「ノートを作成・削除する」にしてください
   - API トークンは誰にも教えないでください
   - API トークンは 1 度しか表示できないため、控えを取っておいてください
3. `.env.sample` を参考に `.env` を作ってください

   - MASTODON_INSTANCE_HOST:Mastodon インスタンスのドメイン（例：mstdn.jp）
   - MASTODON_ACCESS_TOKEN:Mastodon の API トークン
   - MASTODON_USERNAME:Mastodon のユーザー ID
     - 「@」は含めないようにしてください
       - 例: ユーザーページが「http://example.com/@example」の場合「example」のみ
   - MISSKEY_INSTANCE_URL:Misskey インスタンスのドメイン（例：misskey.io）
   - MISSKEY_ACCESS_TOKEN:Misskey の API トークン
4. ファイル一式を稼働させるマシン（VPS 等）に設置し起動してください

   - Docker を使う場合
   - `docker compose up -d --build`にて Docker コンテナをビルドし起動してください
   - Docker を使わない場合

   1. `npm install --also=dev && npm install --save-dev @types/ws @types/form-data`にて依存パッケージとタイプをインストールしてください
   2. `npm install pm2 -g`にて pm2 をインストールしてください
   3. `npm run build`にて `main.ts`を `dist/main.js`にコンパイルしてください
   4. `pm2 start dist/main.js`で起動してください

## caution

閲覧注意フラグなどの投稿設定が引き継げるかは未検証です。
