// utils/dateUtils.js
const getMonthDateRange = (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month
    return { startDate, endDate };
  };
  
  const getCurrentMonthDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    return getMonthDateRange(currentYear, currentMonth);
  };
  
  const getLastMonthDateRange = () => {
    const now = new Date();
    const lastMonthDate = new Date(now.setMonth(now.getMonth() - 1));
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastMonthYear = lastMonthDate.getFullYear();
    return getMonthDateRange(lastMonthYear, lastMonth);
  };
  
  module.exports = { getCurrentMonthDateRange, getLastMonthDateRange };
  