FROM node:14.17.3

RUN mkdir /app

WORKDIR /app

RUN npm install -g forever

COPY package.json .
RUN npm install

COPY .env .
COPY ./dist .

EXPOSE 8000 8001

CMD ["forever","main.js"]
