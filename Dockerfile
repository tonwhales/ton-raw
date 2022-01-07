FROM node:16
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
CMD [ "node", "./build/index.js" ]