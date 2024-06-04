const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DoctorProfessionalDetailsSchema = new Schema(
  {
    DoctorProfessionalDetailsId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorFee: {
      type: Number,
      required: true,
    },
    doctorDesignation: {
      type: String,
      required: true,
    },
    doctorDepartment: {
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
  },
  { timestamps: true }
);

const DoctorProfessionalDetailsModel = mongoose.model(
  "DoctorProfessionalDetails",
  DoctorProfessionalDetailsSchema
);

module.exports = DoctorProfessionalDetailsModel;
