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

const bedChargesSchema = new Schema(
  {
    bedId: String,
    days: Number,
    totalBedCharges: Number,
    totalNursingCharges: Number,
    totalEMOCharges: Number,
    totalBioWasteCharges: Number,
    totalSanitizationCharges: Number,
    subTotal: Number,
  },
  { timestamps: true }
);

const totalBedsSchema = new Schema(
  {
    bedId: String,
  },
  { timestamps: true }
);

const EmergencyPatientBalanceSchema = new Schema({
  balanceID: {
    type: String,
    required: true,
  },
  uhid: {
    type: String,
    required: true,
  },
  emergencyPatientRegId: {
    type: String,
  },
  currentBed: String,
  beds: [totalBedsSchema],
  balance: [balanceSubSchema],
  charges: [chargesSubSchema],
  labTestCharges: [chargesSubSchema],
  bedCharges: [bedChargesSchema],
});

const EmergencyPatientBalanceModel = mongoose.model(
  "EmergencyPatientBalance",
  EmergencyPatientBalanceSchema
);

module.exports = EmergencyPatientBalanceModel;
