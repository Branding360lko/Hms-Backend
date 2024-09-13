const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TreatmentGivenInBriefSchema = new Schema({
  date: {
    type: Date,
  },
  operation: {
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
});

const EmergencyNurseDischargeDetailsSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    emergencyPatientRegId: {
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
    TreatmentGivenInBrief: {
      type: [TreatmentGivenInBriefSchema],
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

const EmergencyNurseDischargeDetailsModel = mongoose.model(
  "EmergencyNurseDischargeDetails",
  EmergencyNurseDischargeDetailsSchema
);

module.exports = EmergencyNurseDischargeDetailsModel;
