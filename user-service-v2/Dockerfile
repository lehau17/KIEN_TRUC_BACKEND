FROM node:20 as build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn config set network-timeout 3000000 && yarn install 

COPY . .

CMD ["sh", "-c", "npx prisma db push && npx prisma generate && yarn build && yarn start:prod"]
