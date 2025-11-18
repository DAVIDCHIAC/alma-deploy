# Etapa de build
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de producción
FROM node:22-slim

WORKDIR /app

COPY --from=build /app/dist ./dist

# Instalar un servidor estático liviano
RUN npm install -g serve

EXPOSE 8080

# serve sirve la carpeta dist en el puerto 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
