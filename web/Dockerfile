FROM node:14.16.1-buster

# pre env vars
ENV NODE_ENV=production

# update the system and install apps
RUN apt-get update && apt-get install libvips -y && apt-get clean

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# args
ARG VERSION_CODE

# post env vars
ENV PORT 3000
ENV NEXT_PUBLIC_VERSION $VERSION_CODE
ENV NEXT_PUBLIC_API_URL /api
ENV NEXT_TELEMETRY_DISABLED 1

# Copying source files
COPY . /usr/src/app

# Building app
RUN npm run build

# expose ports
EXPOSE 3000

# Running the app
CMD "npm" "run" "start"