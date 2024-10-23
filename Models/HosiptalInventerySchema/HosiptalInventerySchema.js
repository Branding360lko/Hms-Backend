const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HospITALINVENTERYSCHEMA = new Schema(
  {
    InventryId: {
      type: String,
      required: true,
    },
    NameOfEquiment: {
      type: String,
      required: true,
    },
    Modal: {
      type: String,
    },
    NameOfManufacturer: {
      type: String,
    },
    DateOfInstallation: {
      type: String,
    },

    CalibrationStatus: {
      type: String,
    },
    WhetherAmc: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const HospitalInventry = mongoose.model(
  "HospITALINVENTERY",
  HospITALINVENTERYSCHEMA
);

module.exports = HospitalInventry;
