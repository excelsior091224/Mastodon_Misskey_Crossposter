# Node.jsの公式イメージをベースとする
FROM node

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコピー
# もしpackage-lock.jsonがなければ、package.jsonのみを指定
COPY package*.json ./

# パッケージをインストール
RUN npm install --also=dev && npm install --save-dev @types/ws @types/form-data

# アプリケーションのソースコードをコピー
COPY . .

# TypeScriptをトランスパイル
RUN npm run build

# アプリケーションがリッスンするポートを指定
EXPOSE 3000

# # 環境変数を設定
# ENV MASTODON_INSTANCE_HOST=your.instance.host
# ENV MASTODON_ACCESS_TOKEN=youraccesstoken
# ENV MASTODON_USERNAME=yourusername
# ENV MISSKEY_INSTANCE_URL=your.misskey.instance
# ENV MISSKEY_ACCESS_TOKEN=yourmisskeyaccesstoken
# ENV DISCHARGE_MODE=true

# アプリケーションを起動
CMD [ "node", "dist/main.js" ]
