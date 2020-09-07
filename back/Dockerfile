FROM alpine

WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache python3

EXPOSE 8000

CMD python manage.py runserver