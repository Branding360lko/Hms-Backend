const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const IPDPatientDischargeRecieptSchema = new Schema(
  {
    recieptId: {
      type: String,
      required: true,
    },
    uhid: {
      type: String,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    totalbedCharges: {
      type: Number,
      required: true,
    },
    totalNurseCharges: {
      type: Number,
      required: true,
    },
    totalEMOCharges: {
      type: Number,
      required: true,
    },
    totalBioWasteCharges: {
      type: Number,
      required: true,
    },
    totalSanitizationCharges: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const IPDPatientDischargeRecieptModel = mongoose.model(
  "IPDPatientDischargeReciept",
  IPDPatientDischargeRecieptSchema
);

module.exports = IPDPatientDischargeRecieptModel;
