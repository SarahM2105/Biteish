const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authMiddleware');
//restaurant list
router.post("/tables/:tableId/book", authenticateToken, bookingController.createBooking);
router.get("/reservations", authenticateToken, bookingController.listUserReservations);
router.put("/reservations/:reservationId", authenticateToken, bookingController.updateReservation);
router.patch("/reservations/:reservationId/cancel", authenticateToken, bookingController.cancelReservation);

module.exports = router;
