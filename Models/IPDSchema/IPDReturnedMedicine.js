const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const IPDReturnedMedicineSchema = new Schema(
  {
    returnedMedicineId: {
      type: String,
      require: true,
    },
    ipdPatientMainId: {
      type: String,
      require: true,
    },
    medicine: [
      {
        Name: {
          type: String,
          require: true,
        },
        Quantity: {
          type: Number,
          require: true,
          default: 1,
        },
        Price: {
          type: Number,
          require: true,
          default: 0,
        },
        subTotal: {
          type: Number,
          require: true,
          default: 0,
        },
        date: {
          type: String,
          require: true,
        
        },
      },
    ],
    Total: {
      type: Number,
      require: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const IPDReturnedMedicine = mongoose.model(
  "IPDReturnedMedicine",
  IPDReturnedMedicineSchema
);

module.exports = IPDReturnedMedicine;
