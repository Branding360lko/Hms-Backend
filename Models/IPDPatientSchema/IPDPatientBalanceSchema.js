const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const balanceSubSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    patientType: String,
    totalBalance: Number,
    addedBalance: Number,
    paymentMethod: String,
    balanceNote: String,
  },
  { timestamps: true }
);

const itemsSchema = new Schema({
  itemName: String,
  quantity: Number,
  price: Number,
  date: String,
});

const chargesSubSchema = new Schema(
  {
    items: [itemsSchema],
    total: Number,
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
  charges: [chargesSubSchema],
  labTestCharges: [chargesSubSchema],
});

const IPDPatientBalanceModel = mongoose.model(
  "IPDPatientBalance",
  IPDPatientBalanceSchema
);

module.exports = IPDPatientBalanceModel;
