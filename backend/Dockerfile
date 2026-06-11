FROM gradle:9.5.1-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle clean build -x test

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
