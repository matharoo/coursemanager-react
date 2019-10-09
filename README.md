=======
# coursemanager-react
course marks manager built using ReactJS and indexedDB (dexie.js)

## Requirements
You’ll need to have Node 8.16.0 or Node 10.16.0 or later version on your local development machine (but it’s not required on the server). You can use nvm (macOS/Linux) or nvm-windows to easily switch Node versions between different projects.

## How to build

```sh
git clone the repo
npm install or yarn
yarn build
serve -s build
```

## Spinning up a docker container
```sh
cd coursemanager-react
docker build -t newreact .
docker run -it -p 80:80 -d newreact
```
Done. You can access the app on http://localhost 
