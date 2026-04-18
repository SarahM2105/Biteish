const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const requiredRole = require("../middleware/roleMiddleware");

const  {
    createBooking,
    listUserReservations,
    updateReservation,
    cancelReservation,
} = require("../controllers/Customer/bookingController");

const { getReservationQr } = require("../controllers/qrController");
const { listRestaurants } = require("../controllers/publicRestaurantController");

const {
    listZonesForRestaurant,
    listTablesForZone,
    getRestaurantDetails,
    createRestaurantReview,
    getMyRestaurantReview,
    updateRestaurantReview,
} = require("../controllers/customer/customerBrowseController");

const {
    listFavouriteRestaurants,
    addFavouriteRestaurant,
    removeFavouriteRestaurant,
} = require("../controllers/customer/favouriteController");

const {
    getMe,
    updateMe,
    updateMyPassword,
} = require("../controllers/userController");
const { getSearchFilterOptions } = require("../controllers/customer/SearchFilterOptionsController");
const uploadReviewImages = require("../middleware/uploadReviewImages");

router.use(authenticateToken);
router.use(requiredRole(["CUSTOMER"]));

router.post("/tables/:tableId/book", createBooking);
router.get("/reservations", listUserReservations);
router.put("/reservations/:reservationId", updateReservation);
router.patch("/reservations/:reservationId/cancel", cancelReservation);

router.get("/restaurants/filter-options", getSearchFilterOptions);
router.get("/restaurants/search", listRestaurants);

router.get("/restaurants/:restaurantId/reviews/me", getMyRestaurantReview);
router.post(
    "/restaurants/:restaurantId/reviews",
    uploadReviewImages.array("images", 3),
    createRestaurantReview
);
router.put(
    "/restaurants/:restaurantId/reviews",
    uploadReviewImages.array("images", 3),
    updateRestaurantReview
);

router.get("/restaurants/:restaurantId/zones", listZonesForRestaurant);
router.get("/zones/:zoneId/tables", listTablesForZone);
router.get("/restaurants/:restaurantId", getRestaurantDetails);
router.get("/reservations/:reservationId/qr", getReservationQr);
router.get("/favourites", listFavouriteRestaurants);
router.post("/favourites/:restaurantId", addFavouriteRestaurant);
router.delete("/favourites/:restaurantId", removeFavouriteRestaurant);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/password", updateMyPassword);

module.exports = router;