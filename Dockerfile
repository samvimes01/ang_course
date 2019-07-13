FROM node:12-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
RUN npm install -g @angular/cli
COPY package.json /app/package.json
RUN npm install
COPY . /app
CMD ng serve --host 0.0.0.0 --poll=1500
EXPOSE 4200 49153
