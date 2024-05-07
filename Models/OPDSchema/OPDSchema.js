const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const OPDSchema = new Schema(
  {
    medicine: [
      {
        type: Schema.Types.ObjectId,
        ref: "medicines",
      },
    ],
    test: [
      {
        type: Schema.Types.ObjectId,
        ref: "tests",
      },
    ],
    Symptoms: {
      type: String,
    },
    Note: {
      type: String,
    },
    OpdData: {
      type: Schema.Types.ObjectId,
      ref: "OPDPatient",
    },
  },
  { timestamps: true }
);
const OPD = mongoose.model("OPD", OPDSchema);

module.exports = OPD;
