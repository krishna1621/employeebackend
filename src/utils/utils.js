// utils.js
const calculateTotalHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalMilliseconds = checkOutDate - checkInDate;
    const totalHours = totalMilliseconds / 1000 / 60 / 60; // Convert milliseconds to hours
    return totalHours.toFixed(2);
};

module.exports = {
    calculateTotalHours
};
