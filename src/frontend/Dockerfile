FROM node:10.16.3-alpine

WORKDIR /code
COPY . /code
RUN npm install
CMD ["npx", "babel", "--watch", "src", "--out-dir", "build", "--presets", "react-app/prod"]
