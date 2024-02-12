FROM python:3.9-slim as base
WORKDIR /usr/src/app
EXPOSE 8000
COPY requirements.txt .
RUN apt update && apt -y install gcc make libpq-dev && pip install -r requirements.txt

FROM base
COPY . .
RUN python manage.py collectstatic --noinput
CMD gunicorn back.asgi:application -k uvicorn.workers.UvicornWorker