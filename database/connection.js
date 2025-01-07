const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect((err) => {
    if(err){
        console.log("There is an error in connection", err);
    }
    else{
        console.log("Connected to Database");
    }
});

module.exports = connection;