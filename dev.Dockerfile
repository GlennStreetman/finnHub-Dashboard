FROM node:14-alpine AS dev
# RUN npm install pm2 -g
RUN apk add --no-cache bash
WORKDIR /app
COPY package*.json ./
COPY package-lock.json ./
RUN npm install
COPY ./src/server/db/postgresVersions/* ./build/server/db/postgresVersions/*
EXPOSE 5000
CMD ["npm", "run", "dev"]