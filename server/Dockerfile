FROM node:18.15-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "db-push:start"]