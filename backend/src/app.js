const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

app.get("/health", (req, res) => {
    res.send("ok");
});

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});