const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  assignfrom: {
    type: Schema.Types.ObjectId,
    ref: "Employelistdata",
    required: true, // Ensure assignfrom is required
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "Employelistdata",
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    default: "Pending",
  },
});

module.exports = mongoose.model("Task", TaskSchema);
