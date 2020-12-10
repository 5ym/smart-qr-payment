# Smart QR Payment

## 開発環境

traefik環境を先に構築しておく下記参照  
[Local-Dev-Traefik](https://github.com/5ym/Local-Dev-Traefik)
下記コマンドで立ち上げ

```sh
cp docker-compose-sample.yml docker-compose.yml
docker-compose run --rm sqp-front sh -c 'yarn'
docker-compose up -d sqp-db
docker-compose run --rm sqp-back sh -c 'python3 manage.py migrate && python3 manage.py collectstatic --noinput'
docker-compose up -d
```

必要に応じてスーパーユーザーの作成

```sh
docker-compose exec sqp-back sh -c 'python3 manage.py createsuperuser'
```

モデルを編集しマイグレーションファイルを生成したいとき

```sh
docker-compose exec sqp-back sh -c 'python3 manage.py makemigrations && python3 manage.py migrate'
```
