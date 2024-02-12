FROM unit:python
USER unit
WORKDIR /usr/src/app
EXPOSE 80
COPY --chown=unit:unit requirements.txt .
RUN apt update && apt -y install gcc make libpq-dev && pip install -r requirements.txt
COPY --chown=unit:unit . .
RUN python manage.py collectstatic --noinput
USER root
COPY .unit.conf.json /docker-entrypoint.d/