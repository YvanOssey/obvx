# ---- Étape 1 : compilation ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Dépendances d'abord : mises en cache tant que pom.xml ne change pas
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src ./src
RUN mvn -q -B -DskipTests package && cp target/*.jar app.jar

# ---- Étape 2 : image d'exécution légère ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Utilisateur sans droits administrateur
RUN useradd --system --uid 1001 obvx
USER obvx

COPY --from=build /app/app.jar app.jar

# Render fournit le port dans $PORT (repris par server.port)
ENV PORT=8080
EXPOSE 8080

# Mémoire adaptée à la taille du conteneur
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseSerialGC", "-jar", "app.jar"]
