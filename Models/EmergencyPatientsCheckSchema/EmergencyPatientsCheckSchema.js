const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const EmergencyPatientsCheckSchema = new Schema(
  {
    medicine: [
      {
        Name: {
          type: String,
          require: true,
        },
        Quantity: {
          type: Number,
          require: true,
          default: 1,
        },
        Price: {
          type: Number,
          require: true,
        },
      },
    ],
    test: [
      {
        Name: {
          type: String,
          require: true,
        },
        Quantity: {
          type: Number,
          require: true,
          default: 1,
        },
        Price: {
          type: Number,
          require: true,
        },
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
    mainId: {
      type: String,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      default: null,
    },
    additionalDoctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      default: null,
    },
    emergencyPatientCurrentBed: {
      type: String,
    },
    VisitDateTime: {
      type: String,
      require: true,
    },
    discharge: {
      type: Boolean,
      require: true,
      default: false,
    },
    submittedBy: {
      type: String,
      default: "Assigned Doctor",
    },
  },
  { timestamps: true }
);

const EmergencyPatientsCheck = mongoose.model(
  "EmergencyPatientsCheck",
  EmergencyPatientsCheckSchema
);

module.exports = EmergencyPatientsCheck;
