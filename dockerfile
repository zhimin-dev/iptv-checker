FROM node
RUN mkdir /app
ADD . /app
WORKDIR /app
EXPOSE 8080
CMD [ "node", "server.js" ]