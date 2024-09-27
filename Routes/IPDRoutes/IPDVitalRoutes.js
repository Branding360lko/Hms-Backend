const express = require("express");

const Router = express.Router();

const mongoose = require("mongoose");

require("../../DB/connection");
const IPDVITAL = require("../../Models/IPDSchema/IPDVitalSchema");
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

Router.get("/get-all-ipd-vital", async (req, res) => {
  try {
    const IpdVitalData = await IPDVITAL.find();
    if (!IpdVitalData || IpdVitalData.length === 0) {
      return res.status(404).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Feteched Successfully", data: IpdVitalData });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.post("/add-ipd-vital-service", async (req, res) => {
  const { IpdPatientId, Name, Price, StartTime } = req.body;
  try {
    if (!(IpdPatientId || Name || Price || StartTime)) {
      return res.status(403).json("Please Fill All Required Fileds");
    }
    const IpdVitalData = await IPDVITAL.create({
      mainId: "IPD-V-" + generateUniqueId(),
      IpdPatientId: IpdPatientId,
      Name: Name,
      Price: Price,
      StartTime: StartTime,
    });

    const IpdVital = await IPDVITAL.findById(IpdVitalData?._id);

    if (!IpdVital) {
      res
        .status(500)
        .json("Something went wrong while Saving the IpdVital Data");
    }

    return res
      .status(201)
      .json({ message: "Data Created Successfully", data: IpdVital });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.get("/get-one-ipd-vital/:ipdvitalId", async (req, res) => {
  const { ipdvitalId } = req.params;
  try {
    const IpdVitalData = await IPDVITAL.findOne({
      mainId: ipdvitalId,
    });
    if (!IpdVitalData && IpdVitalData?.length === 0) {
      return res.status(404).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch successfully", data: IpdVitalData });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.get("/get-all-ipd-vital/:ipdPatientId", async (req, res) => {
  const { ipdPatientId } = req.params;
  try {
    const IpdVitalData = await IPDVITAL.find({
      ipdPatientId: ipdPatientId,
    });
    if (!IpdVitalData && IpdVitalData?.length === 0) {
      return res.status(404).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch successfully", data: IpdVitalData });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.put("/update-one-ipd-vital/:ipdvitalId", async (req, res) => {
  const ipdvitalId = req.params;
  const { Name, Price, StartTime, EndTime } = req.body;
  try {
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.delete("/delete-one-ipd-vital/:ipdvitalId", async (req, res) => {
  const { ipdvitalId } = req.params;
  try {
    const deleteIpdVital = await IPDVITAL.findOneAndDelete({
      mainId: ipdvitalId,
    });
    if (!deleteIpdVital || deleteIpdVital?.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res.status(200).json({ message: "Deleted Successfully" });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});

module.exports = Router;
