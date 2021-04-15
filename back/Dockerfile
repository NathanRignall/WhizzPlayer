FROM node:14.16.1-buster

# pre env vars
ENV NODE_ENV=production

# update the system and install apps
RUN apt-get update && apt-get install mpg123 -y && apt-get clean

# create the app dir
WORKDIR /usr/src/app

# install the dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

# args
ARG VERSION_CODE

# post env vars
ENV PORT=5000
ENV API_URL=http://api:4000

# move the app to location
COPY . .

# expose ports
EXPOSE 5000

# run the app
CMD ["npm", "start"]