FROM node:20

COPY package.json yarn.lock ./

RUN yarn config set network-timeout 600000
RUN yarn install

COPY . .

RUN yarn install


RUN yarn build

CMD [ "node", "dist/main.js" ]