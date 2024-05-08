const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const FloorsDepartmentModel = require("../../Models/FloorsDepartmentSchema/FloorsDepartmentSchema");

const generateUniqueId = () => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const uniqueId = `${year}${month}${day}${hours}${minutes}${seconds}`;

  return uniqueId;
};

Router.get("/FloorsDepartment-GET-ALL", async (req, res) => {
  try {
    const floors = await FloorsDepartmentModel.find();

    res.status(200).json(floors);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/FloorsDepartment-GET-ONE/:floorDepartmentId", async (req, res) => {
  const ID = req.params.floorDepartmentId;

  try {
    const floorDepartment = await FloorsDepartmentModel.findOne({
      floorDepartmentId: ID,
    });
    if (!floorDepartment) {
      return res.status(404).json("Floors Department Data Not Found");
    }
    return res.status(200).json(floorDepartment);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/FloorsDepartment-POST", async (req, res) => {
  const {
    departmentCode,
    floorsName,
    departmentName,
    floorsDescription,
    floorsNoticeText,
    floorsHead,
    floorsNumber,
    isAppointmentApplicable,
  } = req.body;

  try {
    const newFloorDepartment = new FloorsDepartmentModel({
      floorDepartmentId: "FLR" + generateUniqueId(),
      departmentCode: departmentCode,
      floorsName: floorsName,
      departmentName: departmentName,
      floorsDescription: floorsDescription,
      floorsNoticeText: floorsNoticeText,
      floorsHead: floorsHead,
      floorsNumber: floorsNumber,
      isAppointmentApplicable: isAppointmentApplicable,
    });

    return await newFloorDepartment.save().then((data) =>
      res.status(200).json({
        message: "Floor Department Added Successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put(
  "/FloorDepartment-PUT-IsAppointmentApplicable/:floorDepartmentId",
  async (req, res) => {
    const ID = req.params.floorDepartmentId;

    const { isAppointmentApplicable } = req.body;
    try {
      const department = await FloorsDepartmentModel.findOneAndUpdate(
        { floorDepartmentId: ID },
        {
          isAppointmentApplicable: isAppointmentApplicable,
        }
      );
      if (!department) {
        return res.status(404).json("Floor Department Data Not Found");
      }
      return res
        .status(200)
        .json({ message: "Appointment Applicable Updated Succesfully" });
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.delete(
  "/FloorsDepartment-DELETE/:floorDepartmentId",
  async (req, res) => {
    const ID = req.params.floorDepartmentId;

    try {
      let date = new Date().toLocaleDateString();
      let time = new Date().toLocaleTimeString();

      const departmentData = await FloorsDepartmentModel.findOneAndUpdate(
        { floorDepartmentId: ID },
        {
          isDeleted: true,
          deletedAt: `${date} ${time}`,
        }
      );

      if (!departmentData) {
        return res.status(404).json("Floors Department Data Not Found");
      }
      return res
        .status(200)
        .json({ message: "Floors Department Data Deleted Successfully" });
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

module.exports = Router;
