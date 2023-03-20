FROM node:18.15-alpine AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM node:18.15-alpine

WORKDIR /app

COPY package.json .
COPY --from=build /app/build/ .

EXPOSE 3000

CMD ["node", "index.js"]
