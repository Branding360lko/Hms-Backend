const express = require("express");

const Router = express.Router();

const mongoose = require("mongoose");

require("../../DB/connection");

const TestPatientModel = require("../../Models/TestPatientSchema/TestPatientSchema");

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

Router.get("/TestOfPatient-GET-ALL", async (req, res) => {
  try {
    const testPatients = await TestPatientModel.find();
    return res.status(200).json(testPatients);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/TestOfPatient-GET-ONE/:ID", async (req, res) => {
  const id = req.params.ID;
  try {
    const testPatient = await TestPatientModel.findOne({ mainId: id });

    if (!testPatient) {
      return res.status(404).json("Test Patient Not Found!");
    }

    if (testPatient) {
      return res.status(200).json(testPatient);
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/TestOfPatient-POST", async (req, res) => {
  const { testPatientId, prescribedByDoctor, test, patientType } = req.body;
  try {
    const newTestPatient = new TestPatientModel({
      mainId: "TP-" + generateUniqueId(),
      testPatientId: testPatientId,
      prescribedByDoctor: prescribedByDoctor,
      test: test,
      patientType: patientType,
    });

    // console.log(newTestPatient);

    return await newTestPatient.save().then((data) => {
      return res.status(200).json({
        message: "Test Of Patient Created Successfully!",
        data: data,
      });
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/TestOfPatient-PUT/:ID", async (req, res) => {
  const id = req.params.ID;
  const { testPatientId, prescribedByDoctor, test, patientType } = req.body;

  try {
    const updatedTestPatient = await TestPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        testPatientId: testPatientId
          ? testPatientId
          : TestPatientModel.testPatientId,
        prescribedByDoctor: prescribedByDoctor
          ? prescribedByDoctor
          : TestPatientModel.prescribedByDoctor,
        test: test ? test : TestPatientModel.test,
        patientType: patientType ? patientType : TestPatientModel.patientType,
      }
    );

    if (!updatedTestPatient) {
      return res.status(404).json("Test Patient Data Not Found");
    }

    if (updatedTestPatient) {
      return res.status(200).json("Test Patient Data Updated Successfully!");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/TestOfPatient-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const testPatientData = await TestPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!testPatientData) {
      return res.status(404).json("Test Patient Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "Test Patient Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
