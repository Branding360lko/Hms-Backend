const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const IPDVitalSchema = new Schema(
  {
    mainId: {
      type: String,
    },
    IpdPatientId: {
      type: String,
    },
    Name: {
      type: String,
      require: true,
    },
    Price: {
      type: Number,
      require: true,
    },
    StartTime: {
      type: Date,
      require: true,
    },
    EndTime: {
      type: Date,
      require: true,
    },
    Total: {
      type: Number,
      require: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const IPDVITAL = mongoose.model("IPDVITAL", IPDVitalSchema);

module.exports = IPDVITAL;
