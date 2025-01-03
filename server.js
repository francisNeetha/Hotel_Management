require("dotenv").config();
const express = require("express");
const app = express();
app.disable('x-powered-by');

const customerRoute = require("./routes/customers");
app.use(express.json());
app.use("/customers", customerRoute);
app.get("/", (req, res, next) => {
    res.send("Home Page");
});

app.get("*", (req, res, next) => {
    res.status(404);
    res.send("404 error");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
