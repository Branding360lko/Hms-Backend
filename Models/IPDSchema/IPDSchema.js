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
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
    },
    ReferedDoctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      default: null,
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
  },
  { timestamps: true }
);

const IPD = mongoose.model("IPD", IPDSchema);

module.exports = IPD;
