const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DoctorVisitSchema = new Schema(
  {
    doctorVisitId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    visitDate: {
      type: String,
      required: true,
    },
    visitTime: {
      type: String,
      required: true,
    },
    visitReason: {
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

const DoctorVisitModel = mongoose.model("DoctorVisit", DoctorVisitSchema);

module.exports = DoctorVisitModel;
