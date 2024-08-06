const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const IPDDoctorDischargeDetailsSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    ipdPatientRegId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    provisionalDiagnosis: {
      type: String,
    },
    finalDiagnosis: {
      type: String,
    },
    physicianInCharge: {
      type: String,
    },
    name: {
      type: String,
    },
    ICD: {
      type: String,
    },
    result: {
      type: String,
    },
    disease_Diagnose: {
      type: String,
    },
    adviseDuringDischarge: {
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

const IPDDoctorDischargeDetailsModel = mongoose.model(
  "IPDDoctorDischargeDetails",
  IPDDoctorDischargeDetailsSchema
);

module.exports = IPDDoctorDischargeDetailsModel;
