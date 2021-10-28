FROM node:14-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
EXPOSE 5000