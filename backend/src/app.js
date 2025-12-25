const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
    res.send("ok");
});

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});