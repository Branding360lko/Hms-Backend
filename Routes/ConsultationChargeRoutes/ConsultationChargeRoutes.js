const express = require("express");

const Router = express.Router();
require("../../DB/connection");

const ConsultationCharge = require("../../Models/ConsultationChargeSchema/ConsultationChargeSchema");

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
Router.get("/get-all-Consultation-Charge", async (req, res) => {
  try {
    const ConsultationChargeData = await ConsultationCharge.find();
    if (!ConsultationChargeData || ConsultationChargeData?.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res.status(200).json({
      message: "Data Fetch Successfully",
      data: ConsultationChargeData,
    });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});

module.exports = Router;
