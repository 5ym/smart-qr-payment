# Smart QR Payment
## 開発環境
traefik環境を先に構築しておく下記参照  
https://github.com/5ym/Local-Dev-Traefik
下記コマンドで立ち上げ
```sh
cp docker-compose-sample.yml docker-compose.yml
docker-compose run --rm sqp-front sh -c 'yarn'
docker-compose up -d sqp-db
docker-compose run --rm sqp-back sh -c 'python3 manage.py migrate'
docker-compose up -d
```

必要に応じてスーパーユーザーの作成
```sh
docker-compose run --rm sqp-back sh -c 'python3 manage.py createsuperuser'
```