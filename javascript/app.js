const express = require('express')
const app = express()

const port = 3000;

app.get('/', function (req, res) {
  res.sendFile('views/index.html', { root: __dirname })
})

app.get('/js/index.js', function (req, res) {
  res.sendFile('js/index.js', { root: __dirname })
})

app.listen(port, function (err) {
    if (err) {
        console.log("Error while starting server:", err);
    } else {
        console.log("Server has been started at port " + port);
    }
})
