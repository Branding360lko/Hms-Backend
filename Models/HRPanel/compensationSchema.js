const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CompensationSchema = new Schema(
  {
    EmpolyeeID: { type: String },
    Compensationpayout: { type: Number },
    EffectiveDate: { type: String },
    createdBy: { type: String },
    Status: { type: String },
  },
  { timestamps: true }
);
const Compensation = mongoose.model("Compensation", CompensationSchema);

module.exports = Compensation;
