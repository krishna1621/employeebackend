const express = require('express');
const cors = require('cors');
const connectDB = require('./config/config');
const dotenv = require('dotenv');
const employeeRoutes = require('./routes/employeRoutes');
const attendanceRoutes = require('./routes/attendeanceRoutes');
const taskRouter = require('./routes/tasksRoutes');
const userRoutes = require('./routes/userRoutes');
const morgan = require('morgan');
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRouter);
app.use('/api', userRoutes);
app.use(morgan('dev'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!', details: err.message });
  });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
