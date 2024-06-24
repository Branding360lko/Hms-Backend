const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const emergencyPatientDischargeRecieptSchema = new Schema(
  {
    emergencyRecieptId: {
      type: String,
      required: true,
    },
    emergencyPatientRegId: {
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

const EmergencyPatientDischargeRecieptModel = mongoose.model(
  "EmergencyPatientDischargeReciept",
  emergencyPatientDischargeRecieptSchema
);

module.exports = EmergencyPatientDischargeRecieptModel;
