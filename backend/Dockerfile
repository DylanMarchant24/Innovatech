# Etapa 1: Compilacion (Build stage)
FROM maven:3.9.6-amazoncorretto-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compilamos y empaquetamos el archivo JAR (saltando los tests para acelerar el deplo)
RUN mvn clean package -DskipTests

# Etapa 2: Imagen Final super ligera
FROM amazoncorretto:21-alpine
WORKDIR /app
# Copiamos el archivo JAR recien construido de la etapa anterior
COPY --from=build /app/target/app.jar app.jar
# Exponemos el puerto por defecto de Spring Boot
EXPOSE 8080
# Comando de arranque del contenedor
ENTRYPOINT ["java", "-jar", "app.jar"]
