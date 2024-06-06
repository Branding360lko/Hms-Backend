const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ManageBedsSchema = new Schema(
  {
    bedId: {
      type: String,
      required: true,
    },
    bedNumber: {
      type: Number,
      required: true,
    },
    bedTypeName: {
      type: String,
      required: true,
    },
    bedFloor: {
      type: String,
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

const ManageBedsModel = mongoose.model("ManageBeds", ManageBedsSchema);

module.exports = ManageBedsModel;
