const { checkinCustomer } = require("./checkInCustomer");
const { checkOutCustomer } = require("./checkOutCustomer");
const { listAvailableTablesForManualCheckIn } = require("./listAvailableTablesForManualCheckIn");
const { listOccupiedTablesForManualCheckOut } = require("./listOccupiedTablesForManualCheckOut");
const { manualCheckIn } = require("./manualCheckIn");
const { manualCheckOut } = require("./manualCheckOut");

module.exports = {
    checkinCustomer,
    checkOutCustomer,
    listAvailableTablesForManualCheckIn,
    listOccupiedTablesForManualCheckOut,
    manualCheckIn,
    manualCheckOut,
};