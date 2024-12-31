const express = require("express");
const app = express();
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hotel_management",
});

connection.connect();

app.get("/", (req, res) => {
    connection.query(`SELECT * FROM customers`, function (err, rows, fields) {
        console.log("Connection result error " + err);
        console.log("no of records is " + rows.length);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows));
    });
});

app.get("/user", (req, res, next) => {
    res.send("User Router Working");
});

app.get("*", (req, res, next) => {
    res.status(404);
    res.send("404 error");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
