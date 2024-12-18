FROM node:18-alpine AS base

## Create App Directory
WORKDIR /usr/src/app

## copy package, tsconfig
COPY package*.json ./
COPY tsconfig*.json ./
COPY tslint.json ./

## build node_modules/
RUN npm ci

## copy src files 
COPY . . 

## bind the app to port 4000 mapped by the docker daemon 
EXPOSE 4000

## define the runtime 
CMD ["npm", "run", "dev"]
