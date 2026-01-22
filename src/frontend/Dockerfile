# Dockerfile for JivaDesk frontend
FROM oven/bun:latest as build
WORKDIR /app
COPY . .
RUN bun install && bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
