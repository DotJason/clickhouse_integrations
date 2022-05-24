function start_server(data) {
  const mysql = require('mysql2');
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'default',
    port: 9004,
    database: 'default'
  });

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
    var start_date = req.query.start_date;
    var end_date = req.query.end_date;
    var type = req.query.type;
    var duration = req.query.duration;

    params = [start_date, end_date]

    if (type) {
      params.push(type);
    }

    if (duration) {
      params.push(duration);
    }

    console.log(`Querying, type: ${type}, duration: ${duration}, start date: ${start_date}, end date: ${end_date}`);

    connection.query(`
      SELECT
        county AS county,
        count() AS count,
        sum(price) AS price
      FROM uk_price_paid
      WHERE
        date >= ?
        AND date <= ?
        ${type ? "AND type IN ?" : ""}
        ${duration ? "AND duration IN ?" : ""}
      GROUP BY
        county
      ORDER BY
        county
      `,
      params,
      function (err, results, fields) {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Query complete, got ${results.length} entries`);
        res.json(results);
      }
    )
  })

  app.listen(port, function (err) {
    if (err) {
      console.log("Error while starting server:", err);
    } else {
      console.log("Server started at port " + port);
    }
  })
}

start_server();
