const express = require("express");

const Router = express.Router();

const OPD = require("../../Models/OPDSchema/OPDSchema");

Router.get("/OPD-GET-ALL", async (req, res) => {
  try {
    const opdData = await OPD.find();
    if (!opdData) {
      res.status(204).json({ message: "No Data Exits" });
    }
    res.status(200).json({
      message: "Data Fetch Successfully",
      data: opdData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.post("/OPD-Create", async (req, res) => {
  const { medicine, test, Symptoms, Note, OpdData } = req.body;
  console.log(medicine, test, Symptoms, Note, OpdData);
  try {
    const opd = await OPD.create({
      medicine,
      Note,
      Symptoms,
      test,
      OpdData,
    });
    const opdData = await OPD.findById(opd?._id);

    if (!opdData) {
      res.status(500).json("Something went wrong while Saving the OPD Data");
    }

    return res
      .status(201)
      .json({ message: "User registered Successfully", data: opdData });
  } catch (error) {
    res.status(500).json({ message: "Faild To Store Date" });
  }
});
module.exports = Router;
