const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MedicineSchema = new Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
    },
    Dosage: {
      type: String,
    },
    Manufacturer: {
      type: String,
    },
    BATCH: {
      type: String,
    },
    EXPIRY: {
      type: String,
    },
    QTY: {
      type: Number,
      required: true,
    },
    Mrp: {
      type: Number,
      required: true,
    },
    RATE: {
      type: Number,
      required: true,
    },
    Availability: {
      type: Boolean,
      default: true,
      required: true,
    },
    Category: {
      type: String,
    },
    PrescriptionRequirement: {
      type: String,
    },
    StorageConditions: {
      type: String,
    },
    SideEffects: {
      type: String,
    },
    Contraindications: {
      type: String,
    },
    Warnings: {
      type: String,
    },
    Precautions: {
      type: String,
    },
    Instructions: {
      type: String,
    },
  },
  { timestamps: true }
);
const Medicine = mongoose.model("Medicine", MedicineSchema);

module.exports = Medicine;
