FROM alpine AS build

WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN apk add --no-cache yarn && yarn
COPY . .
RUN yarn build

FROM alpine

WORKDIR /var/lib/nginx/html
RUN apk --no-cache add nginx && mkdir /run/nginx
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist .

EXPOSE 80

CMD nginx -g "daemon off;"