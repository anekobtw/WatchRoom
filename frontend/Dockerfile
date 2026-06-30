FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN bun run build

FROM oven/bun:1

WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["bun", "x", "serve", "-s", "dist", "-l", "3000"]

