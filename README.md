# Smart QR Payment

## 開発環境

traefik環境を先に構築しておく下記参照  
[Local-Dev-Traefik](https://github.com/5ym/Local-Dev-Traefik)  
下記コマンドで立ち上げ

```sh
cp compose.sample.yml compose.yml
docker compose run --rm sqpf sh -c 'yarn'
docker compose run --rm sqpb sh -c 'python manage.py migrate && python manage.py collectstatic --noinput'
docker compose up -d
```

必要に応じてスーパーユーザーの作成

```sh
docker compose exec sqpb sh -c 'python manage.py createsuperuser'
```

モデルを編集しマイグレーションファイルを生成したいとき

```sh
docker compose exec sqpb sh -c 'python manage.py makemigrations && python manage.py migrate'
```
