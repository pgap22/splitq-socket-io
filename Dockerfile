FROM node:22

WORKDIR /app
COPY . /app
RUN npm i

EXPOSE 4000

CMD [ "npm", "start" ]