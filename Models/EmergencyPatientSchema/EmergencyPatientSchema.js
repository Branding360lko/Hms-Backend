const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EmergencyPatientSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    bedId: {
      type: String,
      required: true,
    },
    admittingDateTime: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: String,
    },
  },
  { timestamps: true }
);

const EmergencyPatientModel = mongoose.model(
  "EmergencyPatient",
  EmergencyPatientSchema
);

module.exports = EmergencyPatientModel;
