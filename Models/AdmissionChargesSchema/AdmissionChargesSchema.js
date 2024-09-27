const mongoose = require("mongoose");
const AdmissionChargeSchema = new mongoose.Schema(
  {
    mainId: {
      type: String,
      require,
    },
    admissionType: {
      type: String,
      require,
    },
    admissionFees: {
      type: Number,
      require,
    },
  },
  { timestamps: true }
);
const AdmissionChargeModel = mongoose.model(
  "admissionCharge",
  AdmissionChargeSchema
);

module.exports = AdmissionChargeModel;
