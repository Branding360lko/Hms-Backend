const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const EmpolyeeAppoiment = require("../../Models/HRPanel/EmpolyeeAppoimentSchema");
const Empolyee = require("../../Models/HRPanel/EmpolyeeSchema");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
require("../../DB/connection");

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

router.post("/create-appointment", async (req, res) => {
  const {
    fullName,
    Email,
    dataofJoin,
    createdBy,
    basicSalary,
    Ensentive,
    Designation,
    Division,
    managementGrade,
    specialAllowance,
    panNumber,
  } = req.body;
  try {
    const appoientment = new EmpolyeeAppoiment({
      mainId: "APP" + generateUniqueId(),
      fullName: fullName,
      Email: Email,
      panNumber: panNumber,
      dataofJoin: dataofJoin,
      Designation: Designation,
      basicSalary: basicSalary,
      managementGrade: managementGrade,
      specialAllowance: specialAllowance,
      Ensentive: Ensentive,
      createdBy: createdBy,
      status: 1,
    });
    await appoientment.save();
    if (!appoientment) {
      return res.status(200).json({ message: "Appoientment is not created" });
    }
    return res
      .status(200)
      .json({ message: "Appoientment is  created", data: appoientment });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
});

router.get("/get-all-appointment", async (req, res) => {
  try {
    const appointments = await EmpolyeeAppoiment.find();
    res.json(appointments);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
});

router.get("/get-appointment-by-id/:customId", async (req, res) => {
  const customId = req.params.customId;
  try {
    const appointment = await EmpolyeeAppoiment.findOne({ _id: customId });
    if (appointment.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appoiment get Successfully", data: appointment });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

  router.put("/appointemant-update/:coustomID", async (req, res) => {
    const customId = req.params.coustomID;
    try {
      const { status } = req.body;
      const appointment = await EmpolyeeAppoiment.findOne({ _id: customId });
      if (appointment.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      if (status === 0) {
        appointment.status = status;
        await appointment.save();
        return res.status(200).json({ messaeg: "appointment not accepeted" });
      }
      appointment.status = status;
      await appointment.save();
      return res.status(200).json({ messaeg: "appointment Updated accepeted" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "internal server error" });
    }
  });

module.exports = router;
