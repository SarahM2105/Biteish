const express = require("express");
const app = express();
app.get("/health", (req, res)) =>
{
    res.send("ok");
});
const port = 3000;
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});