FROM node:14-alpine AS dev
RUN npm install pm2 -g
RUN apk add --no-cache bash
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
EXPOSE 5000