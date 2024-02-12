# Smart QR Payment

## 開発環境

traefik環境を先に構築しておく下記参照  
[Local-Dev-Traefik](https://github.com/5ym/Local-Dev-Traefik)  
下記コマンドで立ち上げ

```shell
cp compose.sample.yml compose.yml
docker compose run --rm sqpf i
docker compose run --rm sqpb sh -c 'python manage.py migrate'
docker compose up -d
```

必要に応じてスーパーユーザーの作成

```shell
docker compose exec sqpb sh -c 'python manage.py createsuperuser'
```

モデルを編集しマイグレーションファイルを生成したいとき

```shell
docker compose exec sqpb sh -c 'python manage.py makemigrations && python manage.py migrate'
```

pythonのパッケージを更新して静的ファイルを更新したいとき

```shell
docker compoose exec sqpb sh -c 'python manage.py collectstatic --noinput'
```