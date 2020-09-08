# Smart QR Payment
## 開発環境
下記コマンドで立ち上げ
```sh
cp docker-compose-sample.yml docker-compose.yml
docker-compose run --rm sf-sqp sh -c 'yarn'
docker-compose run --rm sb-sqp sh -c 'pip install -r requirements.txt'
docker-compose up -d sqp-db
docker-compose run --rm sb-sqp sh -c 'python3 manage.py migrate'
docker-compose up -d
```