const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const IPDPatientDischargeRecieptSchema = new Schema(
  {
    recieptId: {
      type: String,
      required: true,
    },
    IPDPatientRegId: {
      type: String,
      // required: true,
    },
    patientUHID: {
      type: String,
    },
    BHT: {
      type: String,
      // required: true,
    },
    surgery: {
      type: String,
    },
    bedId: {
      type: String,
    },
    dateAndTimeOfDischarge: {
      type: Date,
    },
    result: {
      type: String,
    },
  },
  { timestamps: true }
);

const IPDPatientDischargeRecieptModel = mongoose.model(
  "IPDPatientDischargeReciept",
  IPDPatientDischargeRecieptSchema
);

module.exports = IPDPatientDischargeRecieptModel;
