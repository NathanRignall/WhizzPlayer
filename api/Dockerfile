FROM node:14-buster-slim

# pre env vars
ENV NODE_ENV=production

# update the system and install apps
RUN apt-get update && apt-get install lame -y && apt-get clean

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# args
ARG VERSION_CODE

# post env vars
ENV PORT=4000
ENV API_VERSION $VERSION_CODE
ENV BACKEND_URL=http://back:5000

# Copying source files
COPY . /usr/src/app

# expose ports
EXPOSE 4000

# run the app
CMD ["npm", "start"]