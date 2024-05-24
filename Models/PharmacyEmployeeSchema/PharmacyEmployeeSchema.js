const { required } = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const PharmacyEmployeeSchema = new Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    Designation: {
      type: String, // e.g. Pharmacist, Pharmacy Technician, Pharmacy Assistant
      required: true,
    },
    JoiningDate: {
      type: String,
      required: true,
    },
    EmployeePhoto: {
      type: String,
    },
    LicenseInfo: {
      LicenseNumber: {
        type: String,
      },
      ExpiryDate: {
        type: String,
      },
    },
    ShiftDetails: {
      type: String,
      required: true,
      default: "Morning",
    },
  },
  { timestamps: true }
);

const PharmacyEmployee = mongoose.model(
  "PharmacyEmployee",
  PharmacyEmployeeSchema
);

module.exports = PharmacyEmployee;
