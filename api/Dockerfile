FROM node:14.15.5-buster

# env vars
ENV PORT=4000
ENV NODE_ENV=production

# update the system and install apps
RUN apt-get update
RUN apt-get install lame -y

# create the app dir
WORKDIR /usr/src/app

# install the dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

# move the app to location
COPY . .

# expose ports
EXPOSE 4000

# run the app
CMD ["npm", "start"]