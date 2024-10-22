const { types } = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TestPatientSchema = new Schema(
  {
    mainId: {
      type: String,
      required: true,
    },
    testPatientId: {
      type: String,
      required: true,
    },
    prescribedByDoctor: {
      type: String,
      required: true,
    },
    test: [
      {
        Name: {
          type: String,
          require: true,
        },
        Price: {
          type: Number,
          require: true,
        },
        Quantity: {
          type: Number,
          require: true,
        },
        Total: {
          type: Number,
          require: true,
        },
      },
    ],
    discountPercentage: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    finalChargedAmount: {
      type: Number,
      default: 0,
    },
    discountGivenBy: {
      type: String,
    },
    total: {
      type: Number,
      default: 0,
    },
    patientType: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
    },
    note: {
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

const TestPatientModel = mongoose.model("TestPatient", TestPatientSchema);

module.exports = TestPatientModel;
