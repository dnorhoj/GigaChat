FROM node:18.15-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PUBLIC_API_URL=https://gigachatapi.dnorhoj.me
ENV PUBLIC_WS_URL=wss://gigachatapi.dnorhoj.me

RUN npm run build

FROM node:18.15-alpine

WORKDIR /app

COPY package.json .
COPY --from=build /app/node_modules/ ./node_modules/
COPY --from=build /app/build/ ./build/

EXPOSE 3000

CMD ["node", "build/index.js"]
