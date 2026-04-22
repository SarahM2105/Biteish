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
    deleteTable,
    listTableFeatureTags
} = require('../controllers/Owner/tables/tableController');

const {
    getOwnerMenu,
    createMenuSection,
    updateMenuSection,
    deleteMenuSection,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} = require("../controllers/Owner/menu/ownerMenuController");

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
    approveReservation,
    declineReservation,
    listPendingReservations,
    listOwnerReservations,
} = require("../controllers/Owner/bookingController");

const {
    createOwnerChangeRequest,
    cancelChangeRequest,
} = require("../controllers/Owner/Bookings/outgoingChangeRequestsController");

const {
    listChangeRequest,
    approveChangeRequest,
    declineChangeRequest,
} = require("../controllers/Owner/Bookings/IncomingChangeRequestsController");

const {
    checkinCustomer,
    checkOutCustomer,
    listOccupiedTablesForManualCheckOut,
    listAvailableTablesForManualCheckIn,
    manualCheckIn,
    manualCheckOut,
} = require('../controllers/Owner/checkins/index');

const { getOwnerOccupancy } = require("../controllers/occupancyController");
const {
    getOwnerRestaurantProfile,
    updateOwnerRestaurantProfile,
    getOwnerRestaurantImages,
    addOwnerRestaurantImages,
    setPrimaryRestaurantImage,
    deleteOwnerRestaurantImage,
} = require("../controllers/Owner/restaurantProfile/ownerProfileController");
const uploadRestaurantImages = require("../middleware/uploadRestaurantImages");

const { getOwnerDashboard } = require("../controllers/ownerDashboardController");
const { getLateArrivals } = require("../controllers/LateArrivalsController");
const { markNoShow } = require("../controllers/noShowController");

const {
    getMe,
    updateMe,
    updateMyPassword,
} = require("../controllers/userController");

const router = express.Router();

router.use(authenticateToken);
router.use(requiredRole(["OWNER"]));
router.get("/dashboard", getOwnerDashboard);
router.get("/dashboard/late-arrivals", getLateArrivals);
// restaurants
router.post("/restaurants", createRestaurant);
router.get("/restaurants", listMyRestaurants);
router.put("/restaurants/:restaurantId", updateRestaurant);
router.delete("/restaurants/:restaurantId", deleteRestaurant);
// zone
router.post("/restaurants/:restaurantId/zones", createZone);
router.get("/restaurants/:restaurantId/zones", listZones);
router.put("/zones/:zoneId", updateZone);
router.delete("/zones/:zoneId", deleteZone);
// tables
router.post("/zones/:zoneId/tables", createTable);
router.get("/zones/:zoneId/tables", listTablesByZone);
router.put("/tables/:tableId", updateTable);
router.delete("/tables/:tableId", deleteTable);
router.get("/table-tags", listTableFeatureTags);
// menu
router.get("/menu", getOwnerMenu);
router.post("/menu/sections", createMenuSection);
router.patch("/menu/sections/:sectionId", updateMenuSection);
router.delete("/menu/sections/:sectionId", deleteMenuSection);
router.post("/menu/items", createMenuItem);
router.patch("/menu/items/:itemId", updateMenuItem);
router.delete("/menu/items/:itemId", deleteMenuItem);
// table unavailability
router.post("/tables/:tableId/unavailability", addUnavailability);
router.get("/tables/:tableId/unavailability", listUnavailability);
router.put("/tables/unavailability/:unavailabilityId", updateUnavailability);
router.delete("/tables/unavailability/:unavailabilityId", deleteUnavailability);
// booking rule
router.put("/restaurants/:restaurantId/booking-rule", setBookingRule);
router.get("/restaurants/:restaurantId/booking-rule", getBookingRule);
// opening hours
router.put("/restaurants/:restaurantId/opening-hours", upsertOpeningHours);
router.get("/restaurants/:restaurantId/opening-hours", listOpeningHours);
// approve / decline normal bookings
router.get("/reservations/pending", listPendingReservations);
router.patch("/reservations/:reservationId/approve", approveReservation);
router.patch("/reservations/:reservationId/decline", declineReservation);
// change requests
router.get("/reservations", listOwnerReservations);
router.get("/change-request", listChangeRequest);
router.post("/reservations/:reservationId/change-request", createOwnerChangeRequest);
router.patch("/change-request/:requestId/approve", approveChangeRequest);
router.patch("/change-request/:requestId/decline", declineChangeRequest);
router.patch("/change-request/:requestId/cancel", cancelChangeRequest);
// check in / out
router.post("/check-in", checkinCustomer);
router.post("/check-out", checkOutCustomer);
router.get("/manual-check-in/options", listAvailableTablesForManualCheckIn);
router.post("/manual-check-in", manualCheckIn);
router.get("/manual-check-out/options", listOccupiedTablesForManualCheckOut);
router.post("/manual-check-out", manualCheckOut);
router.post("/no-shows/mark", markNoShow);
router.get("/occupancy", getOwnerOccupancy);
//restaurant profile
router.get("/restaurant/profile", getOwnerRestaurantProfile);
router.patch("/restaurant/profile", updateOwnerRestaurantProfile);
router.get("/restaurant/images", getOwnerRestaurantImages);
router.post(
    "/restaurant/images",
    uploadRestaurantImages.array("images", 8),
    addOwnerRestaurantImages
);
router.patch("/restaurant/images/:imageId/primary", setPrimaryRestaurantImage);
router.delete("/restaurant/images/:imageId", deleteOwnerRestaurantImage);
// owner profile
router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/password", updateMyPassword);

module.exports = router;