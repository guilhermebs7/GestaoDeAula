FROM node:20-slim

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY server ./server

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && until npx prisma migrate deploy; do echo 'Aguardando o banco...'; sleep 2; done && node server/src/app.js"]