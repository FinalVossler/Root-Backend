FROM node:latest

COPY ./package*.json ./

WORKDIR /usr/src/app

COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build

EXPOSE 5000

CMD [ "node", "dist/server.js" ]

