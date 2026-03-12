const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const requiredRole = require("../middleware/roleMiddleware");

const {
    createBooking,
    updateReservation,
    listUserReservations,
    cancelReservation,
} = require("../controllers/bookingController");

const {getReservationQr} = require("../controllers/qrController");
const { listRestaurants } = require("../controllers/publicRestaurantController");

const {
    listZonesForRestaurant,
    listTablesForZone,
} = require("../controllers/customerBrowseController");

const { getMe } = require("../controllers/userController");

router.use(authenticateToken);
router.use(requiredRole(["CUSTOMER"]));

router.post("/tables/:tableId/book", createBooking);
router.get("/reservations", listUserReservations);
router.put("/reservations/:reservationId", updateReservation);
router.patch("/reservations/:reservationId/cancel", cancelReservation);

router.get("/restaurants/search", listRestaurants);
router.get("/restaurants/:restaurantId/zones", listZonesForRestaurant);
router.get("/zones/:zoneId/tables", listTablesForZone);
router.get("/reservations/:reservationId/qr", getReservationQr);

router.get("/me", getMe);

module.exports = router;
