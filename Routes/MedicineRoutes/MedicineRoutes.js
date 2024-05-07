const express = require("express");

const Router = express.Router();

const Medicine = require("../../Models/MedicineSchema/MedicineSchema");

Router.get("/GET-ALL-Medicine", async (req, res) => {
  try {
    const medicine = await Medicine.find();
    if (!medicine) {
      res.status(204).json({ message: "No Data Exits" });
    }
    res.status(200).json({
      message: "Data Fetch Successfully",
      data: medicine,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/add-medicine", async (req, res) => {
  const {
    Name,
    Description,
    Dosage,
    Manufacturer,
    ExpiryDate,
    Price,
    Availability,
    Category,
    PrescriptionRequirement,
    StorageConditions,
    SideEffects,
    Contraindications,
    Warnings,
    Precautions,
    Instructions,
  } = req.body;
  try {
    if (!Name) {
      return res.status(401).json("Feilds are required");
    }
    const medicine = await Medicine.create({
      Name,
      Description,
      Dosage,
      Manufacturer,
      ExpiryDate,
      Price,
      Availability,
      Category,
      PrescriptionRequirement,
      StorageConditions,
      SideEffects,
      Contraindications,
      Warnings,
      Precautions,
      Instructions,
    });

    const medicineData = await Medicine.findById(medicine._id);
    if (!medicineData) {
      res.status(404).json({
        message: "Something went wrong while Saving the Medicine Data",
      });
    }
    return res
      .status(201)
      .json({ message: "SuccessFully Data Created", data: medicineData });
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});
module.exports = Router;
