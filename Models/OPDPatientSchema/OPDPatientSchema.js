const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OPDPatientSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    opdPatientId: {
      type: String,
      required: true,
    },
    opdCaseId: {
      type: String,
      // required: true,
    },
    opdId: {
      type: String,
      // required: true,
    },
    opdDoctorId: {
      type: String,
      required: true,
    },
    opdPatientBloodPressure: {
      type: String,
      // required: true,
    },
    opdPatientStandardCharges: {
      type: String,
      // required: true,
    },
    opdPatientPaymentMode: {
      type: String,
      // required: true,
    },
    opdDoctorVisitDate: {
      type: String,
    },
    opdPatientNotes: {
      type: String,
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

const OPDPatientModel = mongoose.model("OPDPatient", OPDPatientSchema);

module.exports = OPDPatientModel;
