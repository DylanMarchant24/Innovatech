# Imagen de ejecucion liviana (sin compilar - Maven compila en host EC2)
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
