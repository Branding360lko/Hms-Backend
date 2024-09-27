const mongoose = require("mongoose");
const SurgeonChargesSchema = new mongoose.Schema({ timestamp: true });
const SurgeonCharge = mongoose.model("SurgeonCharge", SurgeonChargesSchema);
module.exports = SurgeonCharge;
