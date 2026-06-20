FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_API_VERSION=v1

RUN printf "VITE_API_URL=%s\nVITE_API_VERSION=%s\n" "$VITE_API_URL" "$VITE_API_VERSION" > .env.production
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
