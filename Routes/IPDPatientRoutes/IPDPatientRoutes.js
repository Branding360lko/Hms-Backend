const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const IPDPatientModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");

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

Router.get("/IPDPatient-GET-ALL", async (req, res) => {
  try {
    const ipdPatientData = await IPDPatientModel.find();

    res.status(200).json(ipdPatientData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/IPDPatient-GET-ONE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    const ipdPatientData = await IPDPatientModel.findOne({ mainId: id });

    if (!ipdPatientData) {
      return res.status(404).json("IPD Patient Data Not Found");
    }
    return res.status(200).json(ipdPatientData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/IPDPatient-POST", async (req, res) => {
  const {
    ipdPatientId,
    ipdDoctorId,
    ipdPatientNotes,
    ipdDepositAmount,
    ipdPaymentMode,
    // ipdWardNo,
    ipdFloorNo,
    // ipdRoomNo,
    ipdBedNo,
  } = req.body;

  try {
    if (!ipdPatientId && !ipdDoctorId) {
      return res
        .status(422)
        .json({ error: "Please fill the field completely!" });
    }
    const newIpdPatientData = new IPDPatientModel({
      mainId: "P-IPD-" + generateUniqueId(),
      ipdPatientId: ipdPatientId,
      ipdDoctorId: ipdDoctorId,
      ipdDepositAmount: ipdDepositAmount,
      ipdPaymentMode: ipdPaymentMode,
      // ipdWardNo: ipdWardNo,
      ipdFloorNo: ipdFloorNo,
      // ipdRoomNo: ipdRoomNo,
      ipdBedNo: ipdBedNo,
      ipdPatientNotes: ipdPatientNotes,
    });

    return await newIpdPatientData.save().then((data) =>
      res.status(200).json({
        message: "IPD Patient Added Successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/IPDPatient-PUT/:Id", async (req, res) => {
  const id = req.params.Id;

  const {
    ipdPatientId,
    ipdDoctorId,
    ipdPatientNotes,
    ipdDepositAmount,
    ipdPaymentMode,
    // ipdWardNo,
    ipdFloorNo,
    // ipdRoomNo,
    ipdBedNo,
  } = req.body;
  try {
    const ipdPatientData = await IPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        ipdPatientId: ipdPatientId
          ? ipdPatientId
          : IPDPatientModel.ipdPatientId,
        ipdDoctorId: ipdDoctorId ? ipdDoctorId : IPDPatientModel.ipdDoctorId,
        ipdDepositAmount: ipdDepositAmount
          ? ipdDepositAmount
          : IPDPatientModel.ipdDepositAmount,
        ipdPaymentMode: ipdPaymentMode
          ? ipdPaymentMode
          : IPDPatientModel.ipdPaymentMode,
        // ipdWardNo: ipdWardNo ? ipdWardNo : IPDPatientModel.ipdWardNo,
        ipdFloorNo: ipdFloorNo ? ipdFloorNo : IPDPatientModel.ipdFloorNo,
        // ipdRoomNo: ipdRoomNo ? ipdRoomNo : IPDPatientModel.ipdRoomNo,
        ipdBedNo: ipdBedNo ? ipdBedNo : IPDPatientModel.ipdBedNo,
        ipdPatientNotes: ipdPatientNotes
          ? ipdPatientNotes
          : IPDPatientModel.ipdPatientNotes,
      }
    );

    if (!ipdPatientData) {
      return res.status(404).json("IPD Patient Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "IPD Patient Data Updated Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/IPDPatient-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const ipdPatientData = await IPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!ipdPatientData) {
      return res.status(404).json("IPD Patient Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "IPD Patient Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
