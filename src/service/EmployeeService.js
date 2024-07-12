const Employee = require('../models/employee'); // Adjust the path as needed

const createEmployee = async (employeeData) => {
    const employee = new Employee(employeeData);
    await employee.save();
    return employee;
};

module.exports = { createEmployee };
