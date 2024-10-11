const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EmergencyPatientSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    nurseId: {
      type: String,
      required: true,
    },
    bedId: {
      type: String,
      required: true,
    },
    // admittingDateTime: {
    //   type: String,
    //   // required: true,
    // },
    notes: {
      type: String,
      // required: true,
    },
    emergencyDepositAmount: {
      type: Number,
      required: true,
    },
    emergencyAddedAmount: {
      type: Number,
    },
    emergencyPatientRemainingAmount: {
      type: Number,
    },
    emergencyPaymentMode: {
      type: String,
    },
    emergencyFloorNo: {
      type: String,
    },
    emergencyPatientNurseRequestForDischarge: {
      type: Boolean,
      default: false,
    },
    emergencyPatientDoctorRequestForDischarge: {
      type: Boolean,
      default: false,
    },
    emergencyPatientNurseConfirmation: {
      type: Boolean,
      default: false,
    },
    emergencyPatientDoctorConfirmation: {
      type: Boolean,
      default: false,
    },
    emergencyPatientDischarged: {
      type: Boolean,
      default: false,
    },
    emergencyPatientAdmissionCharge: {
      type: Number,
      default: 0,
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

const EmergencyPatientModel = mongoose.model(
  "EmergencyPatient",
  EmergencyPatientSchema
);

module.exports = EmergencyPatientModel;
