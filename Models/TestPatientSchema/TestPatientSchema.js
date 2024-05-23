const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TestPatientSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    testPatientId: {
      type: String,
      required: true,
    },
    prescribedByDoctor: {
      type: String,
      required: true,
    },
    test: {
      type: String,
      required: true,
    },
    patientType: {
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
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const TestPatientModel = mongoose.model("TestPatient", TestPatientSchema);

module.exports = TestPatientModel;
