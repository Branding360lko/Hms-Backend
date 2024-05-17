const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ManageDepartmentSchema = new Schema(
  {
    departmentId: {
      type: String,
    },
    departmentCode: {
      type: String,
    },
    departmentName: {
      type: String,
    },
    parentDepartmentName: {
      type: String,
    },
    departmentDescription: {
      type: String,
    },
    departmentNoticeText: {
      type: String,
    },
    departmentHead: {
      type: String,
    },
    roomNumber: {
      type: String,
    },
    isAppointmentApplicable: {
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

const ManageDepartmentModel = mongoose.model(
  "ManageDepartmentSchema",
  ManageDepartmentSchema
);

module.exports = ManageDepartmentModel;
