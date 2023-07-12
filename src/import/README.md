## How to import quarterly data from FI

1. Adjust the zip-url in src/import/fetch.js
2. Run src/import/fetch.js. A file funds.zip should be written to /data folder.
3. Run src/import/unzip.js. A file funds.json should be written to /data folder.
4. Run src/import/toCsv.js. A file db.json and some other files should be written to /data folder.
5. Copy db.json to /src folder.
6. Build and deploy the widget.
