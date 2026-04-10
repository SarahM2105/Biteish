const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
if (!process.env.JWT_SECRET) {
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
const customerRoutes = require("./routes/customerRoutes");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options(/.*/, cors());



app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/owner", ownerRoutes);

app.use("/api/customer", customerRoutes);
app.get("/health", (req, res) => {
    res.send("ok");
});

const PORT = 3000;
/* app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
}); */

const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});

app.use((err, req, res, next)=> {
    if (err.message === "Only image files are allowed") {
        return res.status(400).json({ message: err.message });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large (max 5MB)" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
});