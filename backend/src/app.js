const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
if (!process.env.JWT_TOKEN) {
    console.error("Missing JWT token to authenticate");
    process.exit(1);
}

console.log("cwd: ", process.cwd());
console.log("__dirname: ", __dirname);
console.log("DATABASE_URL loaded?", !!process.env.DATABASE_URL);
const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/health", (req, res) => {
    res.send("ok");
});

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});