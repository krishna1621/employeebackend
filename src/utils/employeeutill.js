const Employee = require('../models/employee');

// Function to create a new employee
exports.createEmployee = async (employeeData) => {
    try {
        const newEmployee = new Employee(employeeData);
        const employee = await newEmployee.save();
        return employee;
    } catch (err) {
        throw new Error(`Error creating employee: ${err.message}`);
    }
};

// Function to find an employee by employeeId
exports.findEmployeeById = async (employeeId) => {
    try {
        const employee = await Employee.findOne({ employeeId: employeeId });
        return employee;
    } catch (err) {
        throw new Error(`Error finding employee: ${err.message}`);
    }
};

// Function to update employee details
exports.updateEmployee = async (employeeId, updateData) => {
    try {
        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeId: employeeId },
            updateData,
            { new: true }
        );
        return updatedEmployee;
    } catch (err) {
        throw new Error(`Error updating employee: ${err.message}`);
    }
};
