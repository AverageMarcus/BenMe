FROM node:latest

MAINTAINER Tomohisa Kusano <siomiz@gmail.com>

ENV OPENCV_VERSION 2.4.13.2

ADD https://raw.githubusercontent.com/siomiz/node-opencv/master/build.sh /build.sh
RUN bash /build.sh \
	&& rm /build.sh

ENV LD_LIBRARY_PATH /usr/local/lib



# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# EXPOSE 80
CMD [ "npm", "start" ]
