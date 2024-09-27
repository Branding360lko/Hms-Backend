const mongoose = require("mongoose");
const VitalCareSchema = new mongoose.Schema(
  {
    mainId: {
      type: String,
      require,
    },
    vitalCareName: {
      type: String,
      require,
    },
    hourlyCharges: {
      type: Number,
      require,
    },
  },
  { timestamps: true }
);
const VitalCare = mongoose.model("VitalCare", VitalCareSchema);
module.exports = VitalCare;
