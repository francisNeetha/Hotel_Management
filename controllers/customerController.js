const customerModel = require("../models/customerModel");

const customers = (req, res) =>{
    customerModel.customers((err, rows, fields) => {
        console.log("Connection result error " + err);
        if (err || !rows) {
            return res.status(500).json({ error: "Failed to fetch customers." });
        }
        console.log("no of records is " + rows.length);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows));
    });
};

const addCustomer = (req, res) => {
    const data = req.body;
    if (!data.name || !data.email || !data.phone) {
        return res.status(400).json({ error: "All fields are required." });
    }

    customerModel.addCustomer(data, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to add customer." });
        }
        res.status(201).json({ message: "Customer added successfully", customerId: result.insertId });
    });
};

const deleteCustomer = (req, res) => {
    const id = req.params.id;

    customerModel.deleteCustomer(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to delete customer." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }
        res.status(200).json({ message: "Customer deleted successfully." });
    });
};


const updateCustomer = (req, res) => {
    const id = req.params.id;
    const data = req.body;

   
    if (!data.name && !data.email && !data.phone && !data.address) {
        return res.status(400).json({ error: "At least one field is required to update." });
    }

   
    const fields = [];
    const values = [];
    
    if (data.name) {
        fields.push("name = ?");
        values.push(data.name);
    }
    if (data.email) {
        fields.push("email = ?");
        values.push(data.email);
    }
    if (data.phone) {
        fields.push("phone = ?");
        values.push(data.phone);
    }
    if (data.address) {
        fields.push("address = ?");
        values.push(data.address);
    }

   
    values.push(id);


    const query = `UPDATE customers SET ${fields.join(", ")} WHERE id = ?`;

    
    customerModel.updateCustomer(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update customer." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }
        res.status(200).json({ message: "Customer updated successfully." });
    });
};




module.exports = {customers, addCustomer,
    deleteCustomer,
    updateCustomer
};