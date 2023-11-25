FROM ubuntu:latest
RUN apt update -y
RUN apt install ffmpeg -y
RUN apt install nodejs -y
RUN mkdir /app
ADD . /app
WORKDIR /app
EXPOSE 8080
CMD [ "node", "server.js" ]