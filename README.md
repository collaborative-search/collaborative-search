# collaborative-search

## Prerequisites
- NodeJS installed and added to path
- Python installed and added to path
- MongoDB installed and added to path
- Get Bing SearchAPI key and place it in [bing.js](./backend/app/services/search/providers/bing.js) file

## Run the project
- Make sure that the mongo db is up and running. It can be tested by entering the Following command
```
>>> mongo
```
- Start the Summarization module by navigating to its folder and type
```
>>> python app.py
```
- Start the Ranker module by navigating to its folder and type
```
>>> python app.py
```
- Now Navigate to the Backend folder and
```
>>> npm install
>>> npm run start

- Now the backed is up and running
```
- Finally, Start the Front-end app
```
>>> npm install
>>> npm start
```
- The System would open itselfmin browser window or you can access it by heading to the url
```
http://localhost:8080/
```
