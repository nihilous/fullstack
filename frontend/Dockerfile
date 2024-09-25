FROM node:20.16 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ARG REACT_APP_MODE
ENV REACT_APP_MODE=$REACT_APP_MODE

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]