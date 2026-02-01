const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const requiredRole = require("../middleware/roleMiddleware");
const {
    createRestaurant,
    updateRestaurant,
    listMyRestaurants,
    deleteRestaurant,
} = require('../controllers/restaurantController');

const {
    createZone,
    listZones,
    updateZone,
    deleteZone
} = require('../controllers/zoneController');

const {
    createTable,
    listTablesByZone,
    updateTable,
    deleteTable
}= require('../controllers/tableController');

const {
    addUnavailability,
    listUnavailability,
    updateUnavailability,
    deleteUnavailability
} = require('../controllers/unavailabilityController');


const router =express.Router();


router.use(authenticateToken);
router.use(requiredRole(["OWNER"]));
//restaurants
router.post("/restaurants", createRestaurant);
router.get("/restaurants", listMyRestaurants);
router.put("/restaurants/:restaurantId", updateRestaurant);
router.delete("/restaurants/:restaurantId", deleteRestaurant);
//zone
router.post("/restaurants/:restaurantId/zones", createZone);
router.get("/restaurants/:restaurantId/zones", listZones);
router.put("/zones/:zoneId", updateZone);
router.delete("/zones/:zoneId", deleteZone);
//tables
router.post("/zones/:zoneId/tables", createTable);
router.get("/zones/:zoneId/tables", listTablesByZone);
router.put("/tables/:tableId", updateTable);
router.delete("/tables/:tableId", deleteTable);
//Table unavailability
router.post("/tables/:tableId/unavailability", addUnavailability);
router.get("/tables/:tableId/unavailability", listUnavailability);
router.put("/tables/unavailability/:unavailabilityId", updateUnavailability);
router.delete("/tables/unavailability/:unavailabilityId", deleteUnavailability);

module.exports = router;