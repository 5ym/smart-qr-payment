FROM alpine

WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache python3-dev py-pip build-base mariadb-connector-c-dev && pip install -r requirements.txt

EXPOSE 8000

CMD python3 manage.py runserver