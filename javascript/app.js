function start_server(data) {
  const express = require('express')
  const app = express()

  const port = 3000;

  app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname })
  })

  app.get('/index.js', (req, res) => {
    res.sendFile('index.js', { root: __dirname })
  })

  app.get("/json", (req, res) => {
    res.json(data);
  })

  app.listen(port, function (err) {
    if (err) {
      console.log("Error while starting server:", err);
    } else {
      console.log("Server started at port " + port);
    }
  })
}


// Use mysql2 to get data from ClickHouse and then start the server

mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'default',
  port: 9004,
  database: 'default'
});

connection.query(`
  SELECT
    toYear(date) AS year,
    county AS county,
    count() AS count,
    sum(price) AS price
  FROM uk_price_paid
  GROUP BY
    year,
    county
  ORDER BY
    year
  `,
  function (err, results, fields) {
    start_server(results);
  }
)
