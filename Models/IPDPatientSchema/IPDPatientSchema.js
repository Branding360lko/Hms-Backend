const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const IPDPatientSchema = new Schema(
  // {
  //   mainId: {
  //     type: String,
  //     required: true,
  //   },
  //   ipdPatientId: {
  //     type: String,
  //     required: true,
  //   },
  //   ipdCaseId: {
  //     type: String,
  //     // required: true,
  //   },
  //   ipdDoctorId: {
  //     type: String,
  //     required: true,
  //   },
  //   ipdId: {
  //     type: String,
  //     // required: true,
  //   },
  //   ipdPatientBloodPressure: {
  //     type: String,
  //     // required: true,
  //   },
  //   ipdPatientBedType: {
  //     type: String,
  //     // required: true,
  //   },
  //   ipdPatientBed: {
  //     type: String,
  //     // required: true,
  //   },
  //   ipdPatientNotes: {
  //     type: String,
  //   },
  //   ipdBillStatus: {
  //     type: String,
  //     // default: false,
  //     // required: true,
  //   },
  //   isDeleted: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   deletedAt: {
  //     type: String,
  //   },
  //   createdBy: {
  //     type: String,
  //   },
  // },
  {
    mainId: {
      type: String,
      required: true,
    },
    ipdPatientId: {
      type: String,
      required: true,
    },
    ipdDoctorId: {
      type: String,
      required: true,
    },
    ipdDepositAmount: {
      type: String,
    },
    ipdPaymentMode: {
      type: String,
    },
    // ipdWardNo: {
    //   type: String,
    // },
    ipdFloorNo: {
      type: String,
    },
    // ipdRoomNo: {
    //   type: String,
    // },
    ipdBedNo: {
      type: String,
    },
    ipdPatientNotes: {
      type: String,
    },
    ipdPatientDischarged: {
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
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const IPDPatientModel = mongoose.model("IPDPatient", IPDPatientSchema);

module.exports = IPDPatientModel;
