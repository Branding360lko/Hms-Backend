const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const IPDSchema = new Schema(
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
    IpdPatientData: {
      type: Schema.Types.ObjectId,
      ref: "IPDPatient",
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
