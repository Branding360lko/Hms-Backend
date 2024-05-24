const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const EmergencyPatientsCheckSchema = new Schema(
  {
    medicine: [
      {
        type: Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],
    test: [
      {
        type: Schema.Types.ObjectId,
        ref: "test",
      },
    ],
    Symptoms: {
      type: String,
    },
    Note: {
      type: String,
    },
    EmergencyPatientData: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    isPatientsChecked: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
  { timestamps: true }
);

const EmergencyPatientsCheck = mongoose.model(
  "EmergencyPatientsCheck",
  EmergencyPatientsCheckSchema
);

module.exports = EmergencyPatientsCheck;
