const express = require('express');
const authenticateToken = require("../middleware/authMiddleware");
const requiredRole = require("../middleware/roleMiddleware");

const router = express.Router();
router.get("/me", authenticateToken, (req, res) => {
    res.json({
        message : "user authenticated",
        user: req.user
    });
});

router.get("/customer-area", authenticateToken,  requiredRole(["CUSTOMER"]), (req, res) => {
    res.json({message: "customer access success"})
})

router.get("/owner-area", authenticateToken, requiredRole(["OWNER"]), (req, res) => {
    res.json({message: "owner access success"})
})

router.get("/admin-area", authenticateToken, requiredRole(["ADMIN"]), (req, res) => {
    res.json({message: "admin access success"})
})

module.exports = router;