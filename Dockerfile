# Building the app and installing dependencies
FROM node:12.2.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --silent
COPY . /app
RUN npm run build

# Setting up nginx for prod enivronment
FROM nginx:1.16.0-alpine
COPY --from=build /app/build /app
RUN rm /etc/nginx/conf.d/default.conf
COPY config/default.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]