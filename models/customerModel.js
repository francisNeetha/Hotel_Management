const connection = require("../database/connection");

const customers = (callback) => {
    connection.query("SELECT * FROM customers", callback);
}

module.exports = {customers}