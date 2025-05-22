# Dockerfile in /backend
FROM node:18

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 5000

CMD ["node", "index.js"]