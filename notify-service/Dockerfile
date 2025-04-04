FROM node:20


COPY package.json yarn.lock ./

RUN yarn config set network-timeout 600000
RUN yarn 

COPY . .

RUN yarn build

COPY templates /dist/templates

CMD [ "yarn",  "start:prod" ]