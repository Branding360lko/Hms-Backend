const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const IPDNurseDischargeDetailsSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    ipdPatientRegId: {
      type: String,
      required: true,
    },
    nurseId: {
      type: String,
      // required: true,
    },
    admittedFor: {
      type: String,
    },
    investigationORProcedure: {
      type: String,
    },
    conditionDuringDischarge: {
      type: String,
    },
    date: {
      type: String,
    },
    operations: {
      type: String,
    },
    indications: {
      type: String,
    },
    surgeon: {
      type: String,
    },
    assistants: {
      type: String,
    },
    nurse: {
      type: String,
    },
    anaesthetist: {
      type: String,
    },
    anaesthesia: {
      type: String,
    },
    implantDetails: {
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

const IPDNurseDischargeDetailsModel = mongoose.model(
  "IPDNurseDischargeDetails",
  IPDNurseDischargeDetailsSchema
);

module.exports = IPDNurseDischargeDetailsModel;
