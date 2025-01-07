const customerModel = require("../models/customerModel");

const customers = (req, res) =>{
    customerModel.customers((err, rows, fields) => {
        console.log("Connection result error " + err);
        console.log("no of records is " + rows.length);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows));
    });
};

module.exports = {customers};