FROM node:14-buster-slim

# pre env vars
ENV NODE_ENV=production

# update the system and install apps
RUN apt-get update && apt-get install mpg123 -y && apt-get clean

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# args
ARG VERSION_CODE

# post env vars
ENV PORT=5000
ENV BACK_VERSION $VERSION_CODE
ENV API_URL=http://api:4000

# Copying source files
COPY . /usr/src/app

# expose ports
EXPOSE 5000

# run the app
CMD ["npm", "start"]