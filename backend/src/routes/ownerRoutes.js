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

const {
    setBookingRule,
    getBookingRule,
} = require('../controllers/bookingRuleController');

const {
    upsertOpeningHours,
    listOpeningHours
} = require('../controllers/openingHourController');

const {
    updateReservation,
    approveReservation,
    declineReservation
} = require("../controllers/bookingController");
const {
    listChangeRequest,
    approveChangeRequest,
    declineChangeRequest,
} = require('../controllers/ownerReservationController');

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
//booking rule
router.put("/restaurants/:restaurantId/booking-rule", setBookingRule);
router.get("/restaurants/:restaurantId/booking-rule", getBookingRule);
//opening hours
router.put("/restaurants/:restaurantId/opening-hours",upsertOpeningHours);
router.get("restaurants/:restaurantId/opening-hours", listOpeningHours);
//approve decline flow
router.patch("/reservations/:reservationId/approve", approveReservation);
router.patch("/reservations/:reservationId/decline", declineReservation);
// approving/ decline change requests
router.get("/change-request", listChangeRequest);
router.patch("/change-request/:requestId/approve", approveChangeRequest);
router.patch("/change-request/:requestId/decline", declineChangeRequest);

module.exports = router;