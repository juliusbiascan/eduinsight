FROM node:18-alpine AS base

## Create App Directory
WORKDIR /usr/src/app

## copy package, tsconfig
COPY package*.json ./
COPY tsconfig*.json ./
COPY tslint.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Install production dependencies only
RUN npm ci

## bind the app to port 4000 mapped by the docker daemon 
EXPOSE 9001

## define the runtime 
CMD ["npm", "run", "dev"]
