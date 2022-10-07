FROM node:16

# Initiate Docker Image Labels
LABEL maintainer="hoplin"
LABEL email="jhoplin7259@gmail.com"
LABEL organization="DSC Community"

# Update / Upgrade package list and install vim
RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install vim -y

# Set timezone to KST
RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

# Initiate Working Directory
RUN mkdir -p /apps
WORKDIR /apps

VOLUME [ "/apps" ]