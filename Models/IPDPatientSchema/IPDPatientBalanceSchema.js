const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const balanceSubSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    patientType: String,
    totalBalance: Number,
    addedBalance: Number,
    paymentMethod: String,
  },
  { timestamps: true }
);

const IPDPatientBalanceSchema = new Schema({
  balanceID: {
    type: String,
    required: true,
  },
  uhid: {
    type: String,
    required: true,
  },
  ipdPatientRegId: {
    type: String,
  },
  balance: [balanceSubSchema],
});

const IPDPatientBalanceModel = mongoose.model(
  "IPDPatientBalance",
  IPDPatientBalanceSchema
);

module.exports = IPDPatientBalanceModel;
