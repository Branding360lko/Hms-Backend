const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReferPatientsSchema = new Schema(
  {
    ipdPatient: {
      type: Schema.Types.ObjectId,
      ref: "ipdpatients",
      required: true,
    },
    referringDoctor: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },
    ReferredDoctor: {
      type: Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },
    ReferedDateAndTime: {
      type: String,
      required: true,
    },
    ReasonForReferal: {
      type: String,
      required: true,
    },
    Note: {
      type: String,
    },
  },
  { timestamps: true }
);
const ReferPatients = mongoose.model("ReferPatients", ReferPatientsSchema);

module.exports = ReferPatients;
