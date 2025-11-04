# Frontend Dockerfile (Vite/React)
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@8.15.5 && pnpm install --frozen-lockfile
COPY . .
# RUN pnpm run build
EXPOSE 5173
# CMD ["pnpm", "preview", "--host"]
CMD ["pnpm", "run", "dev"]