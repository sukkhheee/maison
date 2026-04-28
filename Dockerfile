# =========================================================================
# Multi-stage build for the Spring Boot backend.
#
# Stage 1: Maven 3.9 + Java 21 to compile + package.
# Stage 2: Slim JRE-only runtime — final image is ~250 MB instead of ~700 MB.
# =========================================================================

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy pom first so Docker can cache the dependency-fetch layer separately.
# Source changes alone won't bust this cache; only pom.xml edits will.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# -------------------------------------------------------------------------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy only the produced fat-jar.
COPY --from=build /workspace/target/*.jar /app/app.jar

# Free-tier hosts (Render, Fly) cap memory tightly. Tell the JVM to size the
# heap as a percentage of the cgroup limit instead of the host's full RAM.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"

# Render injects $PORT (e.g. 10000) — Spring Boot already reads it via
# server.port: ${PORT:8080} in application.yml. EXPOSE is just metadata.
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
