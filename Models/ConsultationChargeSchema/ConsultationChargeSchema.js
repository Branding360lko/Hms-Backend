const mongoose = require("mongoose");
const ConsultationChargeSchema = new mongoose.Schema(
  {
    ConsultationName: {
      type: String,
      require,
    },
    Fees: {
      type: Number,
      require,
    },
  },
  { timestamps: true }
);

const ConsultationCharge = mongoose.model(
  "ConsultationCharge",
  ConsultationChargeSchema
);
module.exports = ConsultationCharge;
