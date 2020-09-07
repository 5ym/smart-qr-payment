FROM alpine

WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache yarn && yarn

CMD yanr serve