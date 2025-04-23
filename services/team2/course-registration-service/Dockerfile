# Use pre-built jar to avoid building inside Docker
FROM eclipse-temurin:17-jdk-jammy
RUN mkdir -p /app && chmod -R 777 /app
WORKDIR /app
COPY target/registration-service-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
