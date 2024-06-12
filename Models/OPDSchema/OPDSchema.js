const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const OPDSchema = new Schema(
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
    NextAppoiment: {
      type: String,
    },
    OpdPatientData: {
      type: Schema.Types.ObjectId,
      ref: "OPDPatient",
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
    },
    isPatientsChecked: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
  { timestamps: true }
);
const OPD = mongoose.model("OPD", OPDSchema);

module.exports = OPD;
