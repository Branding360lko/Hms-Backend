const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NurseSchema = new Schema(
  {
    nurseId: {
      type: String,
      required: true,
    },
    nurseName: {
      type: String,
      required: true,
    },
    nurseEmail: {
      type: String,
    },
    nursePhone: {
      type: Number,
      required: true,
    },
    nurseQualification: {
      type: String,
    },
    nurseAge: {
      type: Number,
    },
    nurseImage: {
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

const NurseModel = mongoose.model("Nurse", NurseSchema);

module.exports = NurseModel;
