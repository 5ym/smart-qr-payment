# Smart QR Payment
## 開発環境
traefik環境を先に構築しておく下記参照  
https://gist.github.com/5ym/000f1fc05e061ba6976a69fdc00c7792  
下記コマンドで立ち上げ
```sh
cp docker-compose-sample.yml docker-compose.yml
docker-compose run --rm sqp-front sh -c 'yarn'
docker-compose up -d sqp-db
docker-compose run --rm sqp-back sh -c 'python3 manage.py migrate'
docker-compose up -d
```

必要に応じてスーパーユーザーの作成
```
docker-compose run --rm sqp-back sh -c 'python3 manage.py createsuperuser'
```