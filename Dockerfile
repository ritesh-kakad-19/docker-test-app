# FROM node:22-alpine

# ENV MONGO_DB_USERNAME=admin \
#     MONGO_DB_PWD=qwerty

# RUN mkdir -p docker-test-app

# COPY . /docker-test-app

# CMD ["npm", "start"]



FROM node:22-alpine

WORKDIR /docker-test-app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
