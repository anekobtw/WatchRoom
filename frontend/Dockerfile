FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN bun run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

