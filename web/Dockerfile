FROM node:14.15.5-buster

# args
ARG VERSION_CODE

# env vars
ENV PORT 3000
ENV NODE_ENV=production

ENV NEXT_PUBLIC_VERSION=:$VERSION_CODE
ENV NEXT_TELEMETRY_DISABLED: 1

# update the system and install apps
RUN apt-get update
RUN apt-get install libvips -y

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Copying source files
COPY . /usr/src/app

# Building app
RUN npm run build

# expose ports
EXPOSE 3000

# Running the app
CMD "npm" "run" "start"