const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const IPDSchema = new Schema(
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
    ipdPatientData: {
      type: Schema.Types.ObjectId,
      ref: "IPDPatient",
    },
    ipdPatientMainId: {
      type: String,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      default: null,
    },
    ReferedDoctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      default: null,
    },
    AdditionalDoctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      default: null,
    },
    ipdPatientCurrentBed: {
      type: String,
    },
    VisitDateTime: {
      type: String,
      require: true,
    },
    isPatientsChecked: {
      type: Boolean,
      require: true,
      default: false,
    },
    submittedBy: {
      type: String,
      default: "Assigned Doctor",
    },
    discharge: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
  { timestamps: true }
);

const IPD = mongoose.model("IPD", IPDSchema);

module.exports = IPD;
