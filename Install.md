# WhizzPlayer Raspberry Pi Install Instructions
## Update Pi
sudo apt-get update <br>
sudo apt-get upgrade -y <br>
sudo reboot <br>
## Set Pi Settings
sudo raspi-config
- System Option - Audio - Headphones
- System Option - Password - ENTER NEW PASSWORD
- System Option - Hostname - WhizzPlayer
- Interface Option - SSH - Enable
## Set Volume
alsamixer
- set volume to 80 (this is the highest volume I have found which causes no/little distortion)
# Download Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
# Install Docker Compose
sudo apt-get install docker-compose -y
# Make File Directories
mkdir WhizzPlayer<br>
cd WhizzPlayer<br>
mkdir mysql<br>
mkdir uploads<br>
mkdir uploads/save<br>
mkdir uploads/temp<br>
# Set Up Docker Compose
nano docker-compose.yaml
- PASTE LATEST DOCKER COMPOSE PROD FROM GITHUB [HERE](docker-compose.prod.yaml)
# Start Program
sudo docker-compose up -d<br>
<strong>Navigate to http://IPADDRESS/setup</strong>

# Additional Configuration
WhizzPlayer can be configured using the default.json file in the config folder. Be sure to restart the docker container after modifcations.

# Update Containers
sudo docker-compose pull<br>
sudo docker-compose up -d<br>