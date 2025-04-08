# Use official OpenJDK 17 image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the built JAR file
COPY target/registration-service-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables for database
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/registration_db
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=password
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
