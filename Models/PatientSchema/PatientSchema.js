const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// let softDelete = require("mongoosejs-soft-delete");

const PatientSchema = new Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      // required: true,
    },
    patientFatherName: {
      type: String,
    },
    patientHusbandName: {
      type: String,
    },
    patientDateOfBirth: {
      type: String,
      required: true,
    },
    patientAge: {
      type: Number,
      // required: true,
    },
    patientPhone: {
      type: String,
      required: true,
    },
    patientPhone2: {
      type: String,
    },
    patientHeight: {
      type: String,
    },
    patientWeight: {
      type: String,
    },
    patientGender: {
      type: String,
      required: true,
    },
    patientBloodGroup: {
      type: String,
    },
    patientImage: {
      type: String,
    },
    patientAdmittingCategory: {
      type: String,
      default: "Patient Registered Only",
    },
    patientLocalAddress: {
      type: String,
    },
    patientPermanentAddress: {
      type: String,
    },
    patientCity: {
      type: String,
    },
    patientState: {
      type: String,
    },
    patientCountry: {
      type: String,
    },
    patientZipCode: {
      type: String,
    },
    createdBy: {
      type: Object,
    },
    editedBy: {
      type: Object,
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

// PatientSchema.plugin(softDelete);

const PatientModel = mongoose.model("Patient", PatientSchema);

module.exports = PatientModel;
