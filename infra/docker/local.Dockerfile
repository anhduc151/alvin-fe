FROM node:20-slim AS development

WORKDIR /home/app

COPY . .

RUN npm install -g pnpm

RUN pnpm i

CMD ["pnpm", "dev"]
