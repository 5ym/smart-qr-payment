FROM alpine

WORKDIR /usr/src/app
COPY requirements.txt .
RUN apk add --no-cache python3-dev py-pip build-base mariadb-connector-c-dev nginx && mkdir /run/nginx && pip install -r requirements.txt
COPY . .
RUN python3 manage.py collectstatic --noinput
COPY default.conf /etc/nginx/conf.d/

EXPOSE 80

CMD nginx && gunicorn back.asgi:application -k uvicorn.workers.UvicornWorker