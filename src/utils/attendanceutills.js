const Employee = require('../models/employee');
const Attendance = require('../models/attendence');
/**
 * Calculate the Provident Fund (PF) amount.
 * @param {number} salary - The total salary from which PF is to be calculated.
 * @param {number} [pfRate=0.12] - The PF rate, default is 12%.
 * @returns {number} - The PF amount.
 */
  exports.calculatePF = (salary, pfRate = 0.12) => {
    return salary * pfRate;
  };
  

// Function to find an employee by employeeId
exports.findEmployeeByEmployeeId = async (employeeId) => {
    try {
        const employee = await Employee.findOne({ employeeId: employeeId });
        return employee;
    } catch (err) {
        throw new Error(`Error finding employee: ${err.message}`);
    }
};

// Function to find attendance records for an employee on a specific date
exports.findAttendanceRecord = async (employeeId, date) => {
    try {
        let today = new Date(date).setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ employee: employeeId, date: today });
        return attendance;
    } catch (err) {
        throw new Error(`Error finding attendance record: ${err.message}`);
    }
};

// Function to calculate total hours worked from attendance records
exports.calculateTotalHours = (attendanceRecords) => {
    let totalHours = 0;
    attendanceRecords.forEach((record) => {
        totalHours += parseFloat(record.totalHours) || 0;
    });
    return totalHours.toFixed(2);
};

// Function to calculate salary based on total hours worked and employee hourly rate
exports.calculateSalary = (totalHours, hourlyRate) => {
    const salary = totalHours * hourlyRate;
    return salary;
};
