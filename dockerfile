FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install ffmpeg -y
RUN apt-get install nodejs -y
RUN mkdir /app
ADD . /app
WORKDIR /app
EXPOSE 8080
CMD [ "node", "server.js" ]