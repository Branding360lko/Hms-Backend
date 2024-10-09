const express = require("express");

const Router = express.Router();
require("../../DB/connection");

const VitalCare = require("../../Models/VitalCareSchema/VitalCareSchema");
const { upload } = require('../../utils/upload')
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

Router.get("/get-all-vital-care", async (req, res) => {
  try {
    const vitalCareData = await VitalCare.find().sort({ createdAt: -1 });
    if (vitalCareData.length === 0 || !vitalCareData) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: vitalCareData });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.post("/add-vital-care", upload.none(), async (req, res) => {
  const { vitalCareName, hourlyCharges } = req.body;
  try {
    if (!(vitalCareName || hourlyCharges)) {
      return res.status(404).json({ message: "Fill All Required Fields" });
    }
    const vitalCareDate = await VitalCare.create({
      mainId: "VC-" + generateUniqueId(),
      vitalCareName: vitalCareName,
      hourlyCharges: hourlyCharges,
    });
    const vitalCare = await VitalCare.findById(vitalCareDate._id);
    if (!vitalCare || vitalCare.length === 0) {
      return res
        .status(401)
        .json("Something Went Wrong While Saving vitalCare Data");
    }
    return res.status(201).json({ message: "Data Saved Successfully" });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.get("/get-one-vital-care/:vitalCareId", async (req, res) => {
  const vitalCareId = req.params.vitalCareId;
  try {
    const vitalCareData = await VitalCare.findOne({ mainId: vitalCareId });
    if (!vitalCareData || vitalCareData?.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: vitalCareData });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.put("/update-one-vital-care/:vitalCareId", upload.none(), async (req, res) => {
  const vitalCareId = req.params.vitalCareId;
  const { vitalCareName, hourlyCharges } = req.body;
  try {
    const updatedVitalCare = await VitalCare.findOneAndUpdate(
      {
        mainId: vitalCareId,
      },
      {
        vitalCareName: vitalCareName ? vitalCareName : VitalCare.vitalCareName,
        hourlyCharges: hourlyCharges ? hourlyCharges : VitalCare.hourlyCharges,
      },
      { new: true }
    );
    if (!updatedVitalCare || updatedVitalCare?.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res.status(200).json({ message: "Data Updated Successfully" });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.delete("/delete-one-vital-care/:vitalCareId", async (req, res) => {
  const vitalCareId = req.params.vitalCareId;
  try {
    const deletedVitalCare = await VitalCare.findOneAndDelete({
      mainId: vitalCareId,
    });
    if (!deletedVitalCare || deletedVitalCare?.length === 0) {
      return res.status(200).json({ message: "No Data Found To Delete" });
    }
    return res.status(200).json({ message: "Data Deleted Successfully" });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});

module.exports = Router;
