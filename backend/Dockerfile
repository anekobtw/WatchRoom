FROM oven/bun AS frontend-build
WORKDIR /frontend
COPY ../frontend/package.json ../frontend/bun.lock ./
RUN bun install
COPY ../frontend .
RUN bun run build


FROM gradle:9.5.1-jdk21 AS backend-build
WORKDIR /app
COPY backend/ .
COPY --from=frontend-build /frontend/dist ./src/main/resources/static
RUN gradle clean build -x test


FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

