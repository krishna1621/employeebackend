const Attendance = require("../models/attendence");
const Employee = require("../models/employee");
const {
  findEmployeeByEmployeeId,
  findAttendanceRecord,
  calculateTotalHours,
  calculateSalary,
  calculatePF, // Assuming you have a utility function to calculate PF
} = require("../utils/attendanceutills");
const {
  getCurrentMonthDateRange,
  getLastMonthDateRange,
} = require("../utils/dateUtils");

require('dotenv').config();

const dailyWage = 100; // Adjust this to the actual daily wage
const currentMonth = new Date().getMonth() + 1; // June is represented as 5 in JavaScript (0-based), add 1 to get the correct month
const currentYear = new Date().getFullYear();

exports.checkIn = async (req, res) => {
  const { employeeId } = req.body;
  try {
    const employee = await findEmployeeByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let today = new Date().setHours(0, 0, 0, 0);
    let attendance = await findAttendanceRecord(employee._id, today);

    if (!attendance) {
      attendance = new Attendance({
        employee: employee._id,
        date: today,
        checkIn: new Date(),
      });
    } else {
      if (attendance.checkIn) {
        return res
          .status(400)
          .json({ message: "Already checked in for today" });
      }
      attendance.checkIn = new Date();
    }

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.checkOut = async (req, res) => {
  const { employeeId } = req.body;
  try {
    const employee = await findEmployeeByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let today = new Date().setHours(0, 0, 0, 0);
    let attendance = await findAttendanceRecord(employee._id, today);

    if (!attendance || !attendance.checkIn) {
      return res
        .status(400)
        .json({ message: "No check-in record found for today" });
      a;
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out for today" });
    }

    attendance.checkOut = new Date();

    // Calculate total hours
    let checkIn = new Date(attendance.checkIn);
    let checkOut = new Date(attendance.checkOut);
    let totalHours = (checkOut - checkIn) / 1000 / 60 / 60; // Convert milliseconds to hours
    attendance.totalHours = totalHours.toFixed(2);

    await attendance.save();
    res.status(200).json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllAttendanceRecords = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const employee = await findEmployeeByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const attendanceRecords = await Attendance.find({ employee: employee._id });
    res.status(200).json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllEmployees = async (req, res) => {
  const filter = req.query.filter || "currentMonth"; // Default to 'currentMonth' if filter is not provided
  let startDate, endDate;

  // Determine the start and end dates based on the filter
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Months are 0-based, so +1 to get the current month

  if (filter === "currentMonth") {
    startDate = new Date(currentYear, currentMonth - 1, 1); // First day of the current month
    endDate = new Date(currentYear, currentMonth, 1); // First day of the next month
  } else if (filter === "lastMonth") {
    startDate = new Date(currentYear, currentMonth - 2, 1); // First day of the previous month
    endDate = new Date(currentYear, currentMonth - 1, 1); // First day of the current month
  } else {
    return res.status(400).json({ message: "Invalid filter parameter" });
  }

  try {
    const employees = await Employee.find();

    // Populate attendance records for each employee and calculate working days, leave days, and salary
    const employeesWithAttendance = await Promise.all(
      employees.map(async (employee) => {
        const attendanceRecords = await Attendance.find({
          employee: employee._id,
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        });

        const workingDays = attendanceRecords.filter(
          (record) => record.status === "Present"
        ).length;
        const totalDaysInMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0
        ).getDate();
        const totalLeave = attendanceRecords.filter(
          (record) => record.status === "On Leave"
        ).length;
        const leaveDays = totalDaysInMonth - workingDays - totalLeave;
        const totalHours = calculateTotalHours(attendanceRecords);
        const salary = calculateSalary(totalHours, employee.hourlyRate);
        const pfAmount = calculatePF(salary);
        const grossSalary = salary - pfAmount;

        return {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          department: employee.department,
          dateJoined: employee.dateJoined,
          attendanceRecords: attendanceRecords,
          workingDays: workingDays,
          leaveDays: leaveDays,
          totalLeave: totalLeave,
          salary: salary,
          pfAmount: pfAmount,
          grossSalary: grossSalary,
        };
      })
    );

    res.status(200).json(employeesWithAttendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.calculateSalary = async (req, res) => {
  const { employeeId, filter } = req.params;
  let dateRange;

  if (filter === "currentMonth") {
    dateRange = getCurrentMonthDateRange();
  } else if (filter === "lastMonth") {
    dateRange = getLastMonthDateRange();
  } else {
    return res.status(400).json({ message: "Invalid filter" });
  }

  try {
    const employee = await findEmployeeByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: {
        $gte: dateRange.startDate,
        $lt: dateRange.endDate,
      },
    });

    const totalHours = calculateTotalHours(attendanceRecords);
    const salary = calculateSalary(totalHours, employee.hourlyRate);
    const pfAmount = calculatePF(salary);
    const grossSalary = salary - pfAmount;

    res.status(200).json({ totalHours, salary, pfAmount, grossSalary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res
      .status(400)
      .json({ message: "Date query parameter is required" });
  }

  try {
    let targetDate = new Date(date).setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      date: targetDate,
    }).populate("employee");

    if (attendanceRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "No attendance records found for this date" });
    }

    res.status(200).json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
