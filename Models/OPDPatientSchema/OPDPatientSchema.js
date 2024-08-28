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
    opdPatientDicountPercentageByDoctorId: {
      type: String,
      // required: true,
    },
    opdPatientDicountPercentageByDoctor: {
      type: String,
      // required: true,
    },

    opdPatientRefundedAmount: {
      type: String,
      default: 0,
      // required: true,
    },
    opdPatientFinalChargedAmount: {
      type: String,
      default: 0,
      // required: true,
    },
    opdDoctorVisitDate: {
      type: Date,
    },
    opdPatientNotes: {
      type: String,
    },
    opdPatientDiscountAlloted: {
      type: Boolean,
      default: false,
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
