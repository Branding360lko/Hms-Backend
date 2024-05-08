const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DoctorSchema = new Schema(
  {
    doctorId: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorEmail: {
      type: String,
      required: true,
    },
    doctorQualification: {
      type: String,
    },
    doctorSpecialization: {
      type: String,
    },
    doctorDOB: {
      type: String,
    },
    doctorPhone: {
      type: Number,
      required: true,
    },
    doctorGender: {
      type: String,
    },
    doctorBloodGroup: {
      type: String,
    },
    doctorImage: {
      type: String,
    },
    doctorLocalAddress: {
      type: String,
    },
    doctorPermanentAddress: {
      type: String,
    },
    doctorCity: {
      type: String,
    },
    doctorState: {
      type: String,
    },
    doctorCountry: {
      type: String,
    },
    doctorZipCode: {
      type: Number,
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

const DoctorModel = mongoose.model("Doctor", DoctorSchema);

module.exports = DoctorModel;
