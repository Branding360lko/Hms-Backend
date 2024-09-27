const express = require("express");

const Router = express.Router();
require("../../DB/connection");

const AdmissionChargeModel = require("../../Models/AdmissionChargesSchema/AdmissionChargesSchema");

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

Router.post("/add-admission-charge", async (req, res) => {
  const { admissionType, admissionFees } = req.body;
  try {
    if (!admissionType || !admissionFees) {
      return res.status(404).json({ message: "Fill All Required Fields" });
    }
    const admissionChargeData = await AdmissionChargeModel.create({
      mainId: "AC-" + generateUniqueId(),
      admissionType: admissionType,
      admissionFees: admissionFees,
    });
    const admissionCharge = await AdmissionChargeModel.findById(
      admissionChargeData._id
    );
    if (!admissionCharge) {
      return res
        .status(401)
        .json("Something Went Wrong While Saving AdmissionCharge Data");
    }
    return res.status(201).json({
      message: "Successfully AdmissionCharge Data Saved",
      data: admissionCharge,
    });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
Router.get("/get-all-admission-charges", async (req, res) => {
  try {
    const admissionChargeData = await AdmissionChargeModel.find();
    if (!admissionChargeData) {
      return res.status(403).json({
        message: "Something Went Wrong While Finding Data, Try After SomeTime",
      });
    }
    if (admissionChargeData?.length === 0) {
      return res.status(200).json({
        message: "No Data Found",
      });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch SuccessFully", data: admissionChargeData });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
Router.get("/get-one-admission-charge/:admissionId", async (req, res) => {
  const admissionId = req.params.admissionId;
  try {
    const admissionData = await AdmissionChargeModel.findOne({
      mainId: admissionId,
    });
    if (!admissionData || admissionData?.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: admissionData });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.put("/update-one-admission-charge/:admissionId", async (req, res) => {
  const admissionId = req.params.admissionId;
  const { admissionType, admissionFees } = req.body;
  try {
    const admissionData = await AdmissionChargeModel.findOneAndUpdate(
      {
        mainId: admissionId,
      },
      {
        admissionType: admissionType
          ? admissionType
          : AdmissionChargeModel?.admissionType,
        admissionFees: admissionFees
          ? admissionFees
          : AdmissionChargeModel?.admissionFees,
      },
      { new: true }
    );
    if (!admissionData || admissionData?.length === 0) {
      return res.status(404).json({ message: "No Data Found" });
    }
    return res.status(200).json({ message: "Data Updated Successfully" });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.delete("/delete-one-admission-charge/:admissionId", async (req, res) => {
  const admissionId = req.params.admissionId;
  try {
    const deleteAdmissionData = await AdmissionChargeModel.findOneAndDelete({
      mainId: admissionId,
    });
    if (!deleteAdmissionData || deleteAdmissionData?.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res.status(200).json({ message: "Admission Charge Deleted" });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
module.exports = Router;
