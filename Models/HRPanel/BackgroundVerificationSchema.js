const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const BackgroundVerificationSchema = new Schema({
  BackgroundVerificationId: { type: String, required: true },
  EmployeeId: { type: String, required: true },
  validdate: { type: String, required: true },
  comments: { type: String },
  isVarified: { type: Boolean },
});

const BackgroundVerification = mongoose.model("BackgroundVerification",BackgroundVerificationSchema);

module.exports = BackgroundVerification;
