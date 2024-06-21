const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const EmpolyeeAppoimentSchema = new Schema(
  {
    mainId: { type: String, required: true },
    fullName: { type: String },
    Email: { type: String },
    panNumber: { type: String },
    Designation: { type: String, required: true },
    Division: { type: String },
    dataofJoin: { type: String, required: true },
    basicSalary: { type: String, required: true },
    managementGrade: { type: String, required: true },
    specialAllowance: { type: String, required: true },
    Ensentive: { type: String },
    createdBy: { type: String },
    status: { type: Number },
  },
  { timestamps: true }
);

const EmpolyeeAppoiment = mongoose.model(
  "EmpolyeeAppoiment",
  EmpolyeeAppoimentSchema
);

module.exports = EmpolyeeAppoiment;
