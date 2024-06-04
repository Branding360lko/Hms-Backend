const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const ManageDepartmentModel = require("../../Models/ManageDepartmentSchema/ManageDepartmentSchema");

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

Router.get("/ManageDepartment-GET-ALL", async (req, res) => {
  try {
    const departments = await ManageDepartmentModel.find();

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/ManageDepartment-GET-ONE/:departmentId", async (req, res) => {
  const DepartmentId = req.params.departmentId;

  try {
    const department = await ManageDepartmentModel.findOne({
      departmentId: DepartmentId,
    });
    if (!department) {
      return res.status(404).json("Department Data Not Found");
    }
    return res.status(200).json(department);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/ManageDepartment-POST", async (req, res) => {
  const {
    departmentCode,
    departmentName,
    parentDepartmentName,
    departmentDescription,
    departmentNoticeText,
    departmentHead,
    roomNumber,
    isAppointmentApplicable,
  } = req.body;
  try {
    const newDepartment = new ManageDepartmentModel({
      departmentId: "DEPT" + generateUniqueId(),
      departmentCode: departmentCode,
      departmentName: departmentName,
      parentDepartmentName: parentDepartmentName,
      departmentDescription: departmentDescription,
      departmentNoticeText: departmentNoticeText,
      departmentHead: departmentHead,
      roomNumber: roomNumber,
      isAppointmentApplicable: isAppointmentApplicable,
    });

    return await newDepartment.save().then((data) =>
      res.status(200).json({
        message: "Department Added Successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put(
  "/ManageDepartment-IsAppointmentApplicable/:departmentId",
  async (req, res) => {
    const ID = req.params.departmentId;

    const { isAppointmentApplicable } = req.body;
    try {
      const department = await ManageDepartmentModel.findOneAndUpdate(
        { departmentId: ID },
        {
          isAppointmentApplicable: isAppointmentApplicable,
        }
      );
      if (!department) {
        return res.status(404).json("Department Data Not Found");
      }
      return res
        .status(200)
        .json({ message: "Appointment Applicable Updated Succesfully" });
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.delete("/ManageDepartment-DELETE/:departmentId", async (req, res) => {
  const DepartmentId = req.params.departmentId;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const departmentData = await ManageDepartmentModel.findOneAndUpdate(
      { departmentId: DepartmentId },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!departmentData) {
      return res.status(404).json("Department Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "Department Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
