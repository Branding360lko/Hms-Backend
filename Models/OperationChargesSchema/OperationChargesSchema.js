const mongoose = require("mongoose");
const OperationChargesSchema = new mongoose.Schema({ timestamp: true });
const OperationCharge = mongoose.model(
  "OperationCharge",
  OperationChargesSchema
);
module.exports = OperationCharge;
