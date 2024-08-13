const express = require("express");
const Router = express.Router();

require("../../DB/connection");

const PatientModel = require("../../Models/PatientSchema/PatientSchema");
const DoctorModel = require("../../Models/DoctorSchema/DoctorSchema");
const NurseModel = require("../../Models/NurseSchema/NurseSchema");

Router.get("/DropdownData-Patient", async (req, res) => {
  // const { query } = req.query;
  try {
    const patientData = await PatientModel.aggregate([
      {
        $sort: { _id: -1 },
      },
      // {
      //   $match: { patientId: { $regex: query, $options: "i" } },
      // },
      {
        $project: {
          patientId: 1,
          patientName: 1,
        },
      },
    ]);

    return res.status(200).json(patientData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/DropdownData-Doctor", async (req, res) => {
  // const { query } = req.query;
  try {
    const doctorData = await DoctorModel.aggregate([
      {
        $sort: { _id: -1 },
      },
      // {
      //   $match: { doctorId: { $regex: query, $options: "i" } },
      // },
      {
        $project: {
          doctorId: 1,
          doctorName: 1,
        },
      },
    ]);

    return res.status(200).json(doctorData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/DropdownData-Nurse", async (req, res) => {
  // const { query } = req.query;
  try {
    const nurseData = await NurseModel.aggregate([
      {
        $sort: { _id: -1 },
      },
      // {
      //   $match: { nurseId: { $regex: query, $options: "i" } },
      // },
      {
        $project: {
          nurseId: 1,
          nurseName: 1,
        },
      },
    ]);

    return res.status(200).json(nurseData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
