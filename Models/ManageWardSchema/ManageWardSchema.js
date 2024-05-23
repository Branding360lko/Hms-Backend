const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ManageWardSchema = new Schema(
  {
    wardId: {
      type: String,
      required: true,
    },
    floorsName: {
      type: String,
      required: true,
    },
    wardName: {
      type: String,
      required: true,
    },
    wardDescription: {
      type: String,
    },
    wardNumber: {
      type: Number,
    },
    isAppointmentApplicable: {
      type: Boolean,
      default: false,
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

const ManageWardModel = mongoose.model("ManageWard", ManageWardSchema);

module.exports = ManageWardModel;
