const customerModel = require("../models/customerModel");
const { createBooking } = require("../models/customerModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//LOGIN

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    customerModel.getAdminByEmail(email, (err, admin) => {
        if (err) {
            return res.status(500).json({ error: "Database error." });
        }

        if (admin) {
            
            const isValidPassword = password === admin.password; 
            if (!isValidPassword) {
                return res.status(401).json({ error: "Invalid credentials." });
            }

            
            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            
            customerModel.customers((err, customers) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to fetch customers." });
                }

                return res.status(200).json({
                    message: "Login successful.",
                    role: "admin",
                    token,
                    customers, 
                });
            });

        } else {
            
            customerModel.getCustomerByEmail(email, (err, customer) => {
                if (err) {
                    return res.status(500).json({ error: "Database error." });
                }

                if (!customer) {
                    return res.status(404).json({ error: "User not found." });
                }
                

                
                const isValidPassword = password === customer.password; 
                if (!isValidPassword) {
                    return res.status(401).json({ error: "Invalid credentials." });
                }

                
                const token = jwt.sign(
                    { id: customer.id, email: customer.email, role: "customer" },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                return res.status(200).json({
                    message: "Login successful.",
                    role: "customer",
                    token,
                    customer
                });
            });
        }
    });
};



const bookRoom = async (req, res) => {
    const { num_of_room, num_of_guest, checkin_date, checkout_date, room_id } = req.body;

    if (!num_of_room || !num_of_guest || !checkin_date || !checkout_date || !room_id) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const bookingData = {
        customer_id: req.user.id, 
        num_of_room,
        num_of_guest,
        status: "Pending", 
        checkin_date,
        checkout_date,
        room_id,
    };

    try {
        const result = await createBooking(bookingData);
        res.status(201).json({ message: "Room booked successfully!", bookingId: result.insertId });
    } catch (error) {
        console.error("Error while booking room:", error);
        res.status(500).json({ error: "Failed to book room." });
    }
};

//signup

const signup = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password ) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer = { name, email, phone, password: hashedPassword, role: "customer" };

        
        const result = await customerModel.addCustomers(newCustomer);

        const token = jwt.sign(
            { id: result.insertId, email: newCustomer.email, role: newCustomer.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({ message: "Customer registered successfully.", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during signup." });
    }
};

//GET CUSTOMERS
const customers = (req, res) => {
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


//GET CUSTOMERS BY ID
const getCustomerById = (req, res) => {
    const customerId = req.params.id;

    customerModel.getCustomerById(customerId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve customer." });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }

        res.status(200).json(result[0]);
    });
};


//POST USER
const addCustomer = (req, res) => {
    const data = req.body;

    if (!data.name || !data.email || !data.phone || !data.address || !data.password || !data.role) {
        return res.status(400).json({ error: "All fields are required." });
    }

    customerModel.addCustomer(data, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to add customer." });
        }
        res
            .status(201).json({ message: "Customer added successfully", customerId: result.insertId,});
    });

    customerModel.addCustomer(data, (err, result) => {
        if (err) {
            if (err.message === "Email already in use") {
                return res.status(400).json({ error: "Email already in use." });
            }
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to add customer." });
        }
        res.status(201).json({ message: "Customer added successfully", customer: result });
    });
    
};


//DELETE USER
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


//UPDATE USER
const updateCustomer = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    if (!data.name && !data.email && !data.phone && !data.address && !data.role) {
        return res
            .status(400)
            .json({ error: "At least one field is required to update." });
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
    if (data.role) {
        fields.push("role = ?");
        values.push(data.role);
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
module.exports = {
    customers,
    getCustomerById,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    login,
    signup, 
    bookRoom
};
