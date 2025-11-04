# Backend Dockerfile (NestJS)
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@8.15.5 && pnpm install --frozen-lockfile
COPY . .
# RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "start"]