const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const testSchema = new Schema(
  {
    TestName: {
      type: String,
      required: true,
    },
    Availability: {
      type: Boolean,
      default: true,
    },
    Cost: {
      type: Number,
      required: true,
    },
    Category: {
      type: String,
    },
    Description: {
      type: String,
    },
  },
  { timestamps: true }
);
const Test = mongoose.model("test", testSchema);

module.exports = Test;
