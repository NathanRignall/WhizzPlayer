# WhizzPlayer Raspberry Pi Install Instructions

sudo apt-get update
sudo apt-get upgrade -y
sudo reboot

sudo raspi-config
- System Option - Audio - Headphones
- System Option - Password - ENTER NEW PASSWORD
- System Option - Hostname - WhizzPlayer
- Interface Option - SSH - Enable

alsamixer
- set volume to 80

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

sudo apt-get install docker-compose -y

mkdir WhizzPlayer
cd WhizzPlayer
mkdir mysql
mkdir uploads
mkdir uploads/save
mkdir uploads/temp

nano docker-compose.yaml
- PASTE LATEST DOCKER COMPOSE PROD FROM GITHUB)

sudo docker-compose up -d