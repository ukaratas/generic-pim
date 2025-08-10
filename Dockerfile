# Stage 1: Build Angular
FROM node:20-alpine AS web-build
WORKDIR /src
COPY pim-web/package*.json ./pim-web/
RUN cd pim-web && npm ci
COPY pim-web ./pim-web
RUN cd pim-web && npm run build -- --configuration production

# Stage 2: Publish .NET API
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS api-build
WORKDIR /src
COPY Pim.Api/*.csproj Pim.Api/
RUN dotnet restore Pim.Api/Pim.Api.csproj
COPY Pim.Api/ Pim.Api/
COPY Pim.Api/appsettings.json Pim.Api/
RUN dotnet publish Pim.Api/Pim.Api.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
# Copy published API
COPY --from=api-build /app/publish .
# Copy Angular build into wwwroot (flatten browser output)
COPY --from=web-build /src/pim-web/dist/pim-web/browser ./wwwroot
# Expose default port
# Respect Render's dynamic PORT if provided
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080}
EXPOSE 8080
# Optional: set environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "Pim.Api.dll"] 