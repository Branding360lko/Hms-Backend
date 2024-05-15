const express = require("express");

const Router = express.Router();

const Pharmacy = require("../../Models/PharmacySchema/PharmacySchema");

Router.get("/get-all-pharamacy", async (req, res) => {
  try {
    const pharamcyData = await Pharmacy.find();
    if (!pharamcyData) {
      return res.status(403).json({ message: "No Data Found in Pharamcy" });
    }

    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: pharamcyData });
  } catch (error) {
    res.status(500).json("internal Server error");
  }
});
Router.get("/get-one-pharamacy/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const pharamcyData = await Pharmacy.findOne({ _id: Id });
    if (!pharamcyData) {
      res.status(404).json({ message: "No Data Found with this Id" });
    }
    res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: pharamcyData });
  } catch (error) {
    res.status(500).json("internal Server Error");
  }
});
Router.post("/create-pharamacy", async (req, res) => {
  const { pharmacistId, patientId, medicineId, dosge, frequency, instruction } =
    req.body;
  if (!(pharmacistId && patientId)) {
    return res
      .status(403)
      .json({ message: "pharmacistId and patientId field is required" });
  }
  try {
    console.log(
      pharmacistId,
      patientId,
      medicineId,
      dosge,
      frequency,
      instruction
    );
    const pharamacyCreatedData = await Pharmacy.create({
      pharmacistId,
      patientId,
      medicineId,
      dosge,
      frequency,
      instruction,
    });
    console.log(pharamacyCreatedData);
    const pharamcyData = await Pharmacy.findById(pharamacyCreatedData._id);
    if (!pharamcyData) {
      return res
        .status(403)
        .json({ message: "Failed To Save Data,Try Again Later" });
    }

    return res.status(201).json({
      message: "Successfully Saved Pharamcy data",
      data: pharamcyData,
    });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
Router.put("/update-pharamacy/:Id", async (req, res) => {
  const Id = res.params.Id;
  const { medicineId, dosge, frequency, instruction } = req.body;
  try {
    const pharamcyData = await Pharamcy.findById({ _id: Id });
    if (!pharamcyData) {
      return res.status(403).json({ message: "No Pharamacy Data Found" });
    }
    await pharamcyData({
      medicineId: medicineId ? medicineId : pharamcyData.medicineId,
      dosge: dosge ? dosge : pharamcyData?.dosge,
      frequency: frequency ? frequency : pharamcyData?.frequency,
      instruction: instruction ? instruction : pharamcyData.instruction,
    });
    await pharamcyData.save();
    res.status(200).json({ message: "Updated SuccessFully" });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});

module.exports = Router;
