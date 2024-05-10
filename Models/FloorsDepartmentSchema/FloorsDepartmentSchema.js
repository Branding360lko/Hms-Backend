const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FloorsDepartmentSchema = new Schema(
  {
    floorDepartmentId: {
      type: String,
      required: true,
    },
    departmentCode: {
      type: String,
    },
    floorsName: {
      type: String,
    },
    departmentName: {
      type: String,
    },
    floorsDescription: {
      type: String,
    },
    floorsNoticeText: {
      type: String,
    },
    floorsHead: {
      type: String,
    },
    floorsNumber: {
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
  },
  { timestamps: true }
);

const FloorsDepartmentModel = mongoose.model(
  "FloorsDepartment",
  FloorsDepartmentSchema
);

module.exports = FloorsDepartmentModel;
