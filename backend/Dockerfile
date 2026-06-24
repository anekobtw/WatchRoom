FROM gradle:9.5.1-jdk21 AS build
WORKDIR /app

COPY gradle ./gradle
COPY build.gradle settings.gradle ./

RUN gradle dependencies --no-daemon

COPY . .

RUN gradle clean build -x test --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

