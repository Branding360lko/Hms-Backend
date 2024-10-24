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
    bedType: {
      type: String,
      // required: true,
    },
    bedSubType: {
      type: String,
    },
    bedFloor: {
      type: String,
      required: true,
    },
    bedCharges: {
      type: Number,
      required: true,
    },
    nursingCharges: {
      type: Number,
      // required: true,
      default:0,
    },
    EMOCharges: {
      type: Number,
      // required: true,
      default:0,
    },
    bioWasteCharges: {
      type: Number,
      // required: true,
      default:0,
    },
    sanitizationCharges: {
      type: Number,
      // required: true,
      default:0,
    },
    bedAvailableOrNot: {
      type: Boolean,
      default: true,
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
