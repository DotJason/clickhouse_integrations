# clickhouse_integrations

A simple showcase of how a ClickHouse server can be accessed via the MySQL protocol to be used in different notebooks and JS.

## Legal

Contains HM Land Registry data © Crown copyright and database right 2021. This data is licensed under the Open Government Licence v3.0.

## Demo JS app

The /javcascript folder contains a Node.js app that uses [mysql2](https://www.npmjs.com/package/mysql2) to access a locally running ClickHouse server and [dc.js](https://dc-js.github.io/dc.js/) for graph rendering.

- The first horizontal bar graph shows the average property paid price by county, sorted by price descending.
- The second horizontal bar graph shows total property items sold by county, sorted by item count descending.
- Data can be filtered to only include sales made in a specific time period, using the filter at the top of the page (from 1995 to 2022).

### Running the app

Before running the JS app, make sure to have a running [ClickHouse server](https://clickhouse.com/docs/en/quick-start) with the [UK Property Price Paid](https://clickhouse.com/docs/en/getting-started/example-datasets/uk-price-paid/) dataset imported.

To run the JS server app on your machine:

1. Install [Node.js](https://nodejs.org/en/).
2. Download this repository to your machine.
3. Go to the /javascript folder in the terminal and install npm package dependencies by running this command:
```
npm install
```
4. Run the app using this command:
```
node app
```
The default port for this app is 3000, so once the app is running the page can be accessed locally on [localhost:3000](http://localhost:3000/)
