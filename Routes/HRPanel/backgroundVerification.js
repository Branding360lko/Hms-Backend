const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const BackgroundVerification = require("../../Models/HRPanel/BackgroundVerificationSchema");

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

router.get("/employee-Varifcatio/get", async (req, res) => {
  try {
    const employeeVarifiaction = await BackgroundVerification.find();
    if (employeeVarifiaction.length === 0) {
      return res
        .status(202)
        .json({ message: "Data not exit", data: employeeVarifiaction });
    }
    return res.status(200).json({
      message: "employee Background varification get successfully",
      data: employeeVarifiaction,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/employee-Varifiaction/get/:Id", async (req, res) => {
  const employeeid = req.params.Id;
  try {
    const employeeVarifiaction = await BackgroundVerification.findOne({
      EmployeeId: employeeid,
    });
    if (employeeVarifiaction.length === 0) {
      return res
        .status(200)
        .json({ message: "Data not exit", data: employeeVarifiaction });
    }
    return res.status(200).json({
      message: "employee Background varification get successfully",
      data: employeeVarifiaction,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/employee-varification/create", async (req, res) => {
  try {
    const { EmployeeId, validdate, comments, isVarified } = req.body;
    const employeeVarifiaction = new BackgroundVerification({
      BackgroundVerificationId: "BV" + generateUniqueId(),
      EmployeeId: EmployeeId,
      validdate: validdate,
      comments: comments,
      isVarified: isVarified,
    });
    await employeeVarifiaction.save();
    return res.status(200).json({
      message: "backgrout varification data created successfull",
      data: employeeVarifiaction,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
