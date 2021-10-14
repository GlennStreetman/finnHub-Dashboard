FROM node:14-alpine AS Dashboard
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . ./
RUN npm run build
EXPOSE 80
CMD ["npm", "run", "start"]