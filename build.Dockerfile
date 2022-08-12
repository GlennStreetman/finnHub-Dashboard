FROM node:14-alpine AS dev
# RUN npm install pm2 -g
WORKDIR /app
COPY package*.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build
CMD ["npm", "run", "start"]