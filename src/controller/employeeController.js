const {
  createEmployee,
  findEmployeeById,
  updateEmployee,
} = require("../utils/employeeutill");
const {
  calculateTotalHours,
  calculateSalary,
  calculatePF,
} = require("../utils/attendanceutills");
const Attendance = require("../models/attendence");
const Employee = require("../models/employee");
const multer = require('multer');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();

require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Utility function to upload image to S3
async function uploadImageToS3(imageBuffer, imageName) {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageName,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
    };
    await s3Client.send(new PutObjectCommand(params));
    console.log("Image uploaded to S3:", imageName);
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageName}`;
    return imageUrl;
  } catch (err) {
    console.error("Error uploading image to AWS S3:", err);
    throw err;
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new employee
exports.createEmployee = [
  upload.single('employeeImage'),
  async (req, res) => {
    const { 
      employeeId, 
      name, 
      email, 
      position, 
      department, 
      hourlyRate,
      bankCode,
      branchName,
      bankName,
      bankBranch,
      bankAccountNumber,
      costCentre,
      ccDescription,
      grade,
      employeeGroup,
      panNumber 
    } = req.body;
  
    let employeeImage = '';
    if (req.file) {
      const imageName = `${Date.now()}-${req.file.originalname}`;
      employeeImage = await uploadImageToS3(req.file.buffer, imageName);
    }

    const employeeData = {
      employeeId,
      name,
      email,
      position,
      department,
      hourlyRate,
      bankCode,
      branchName,
      bankName,
      bankBranch,
      bankAccountNumber,
      costCentre,
      ccDescription,
      grade,
      employeeGroup,
      panNumber,
      employeeImage
    };

    try {
      const employee = await createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
];

// Update an existing employee
exports.updateEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const updateData = req.body;
  try {
    const updatedEmployee = await updateEmployee(employeeId, updateData);
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.generateSalarySlip = async (req, res) => {
  const { employeeId } = req.body;
  const { filter } = req.query;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let startDate, endDate;
    const currentDate = new Date();
    if (filter === "currentMonth") {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    } else if (filter === "lastMonth") {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    } else {
      return res.status(400).json({ message: "Invalid filter parameter" });
    }

    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startDate, $lt: endDate },
    });

    const totalHours = calculateTotalHours(attendanceRecords);
    const salary = calculateSalary(totalHours, employee.hourlyRate);
    const pfAmount = calculatePF(salary);
    const grossSalary = salary - pfAmount;

    const salarySlip = {
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      startDate,
      endDate,
      totalHours,
      salary: salary.toFixed(2),
      pfAmount: pfAmount.toFixed(2),
      grossSalary: grossSalary.toFixed(2),
      slipNumber: generateSlipNumber(),
      bankDetails: {
        bankCode: employee.bankCode,
        branchName: employee.branchName,
        bankName: employee.bankName,
        bankBranch: employee.bankBranch,
        bankAccountNumber: employee.bankAccountNumber,
      },
      additionalDetails: {
        costCentre: employee.costCentre,
        ccDescription: employee.ccDescription,
        grade: employee.grade,
        employeeGroup: employee.employeeGroup,
        panNumber: employee.panNumber,
        payPeriod: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      },
      payments: {
        basicSalary: salary.toFixed(2),
        totalPayments: salary.toFixed(2),
      },
      deductions: {
        providentFund: pfAmount.toFixed(2),
        totalDeductions: pfAmount.toFixed(2),
      },
      netSalary: (salary - pfAmount).toFixed(2),
    };

    res.status(200).json(salarySlip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to generate or fetch slip number (dummy implementation)
const generateSlipNumber = () => {
  return `SLIP-${Date.now()}`;
};
