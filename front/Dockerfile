FROM alpine AS build

WORKDIR /usr/src/app
COPY . .
RUN apk add --no-cache yarn && yarn && yarn build

FROM alpine

RUN apk --no-cache add nginx
RUN mkdir /run/nginx
WORKDIR /var/lib/nginx/html
COPY --from=build /usr/src/app/dist .
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD nginx -g "daemon off;"