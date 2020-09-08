FROM alpine

WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache yarn && yarn

EXPOSE 8080

CMD yarn serve