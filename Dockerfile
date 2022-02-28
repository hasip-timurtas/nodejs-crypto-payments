FROM node:14

WORKDIR /app

COPY . ./

COPY package.json ./

RUN npm install

CMD [ "npm", "start" ]