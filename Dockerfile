FROM node:22

WORKDIR /usr/src/cubos_bank

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start:prod"]