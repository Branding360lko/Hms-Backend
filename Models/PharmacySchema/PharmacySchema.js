const { required } = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const PharmacySchema = new Schema(
  {
    pharmacistId: {
      type: Schema.Types.ObjectId,
      ref: "pharmacyemployees",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "patients",
      required: true,
    },
    medicineId: [
      {
        type: Schema.Types.ObjectId,
        ref: "medicines",
      },
    ],
    dosge: {
      type: String,
    },
    frequency: {
      type: String,
    },
    instruction: {
      type: String,
    },
  },
  { timestamps: true }
);

const Pharmacy = mongoose.model("Pharmacy", PharmacySchema);

module.exports = Pharmacy;
