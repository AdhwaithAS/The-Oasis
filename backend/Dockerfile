FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy backend files
COPY . .

# Ensure directories exist and compile pure Java classes
RUN mkdir -p bin data logs && \
    javac -encoding UTF-8 -d bin $(find src -name "*.java")

# Railway injects $PORT dynamically; fallback to 8080 locally
ENV PORT=8080
EXPOSE 8080

# Execute server using the dynamic PORT provided by Railway
CMD ["sh", "-c", "java -cp bin com.hotel.Main"]
