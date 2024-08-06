const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Compensation = require("../../Models/HRPanel/CompensationSchema");
const Empolyee = require("../../Models/HRPanel/EmpolyeeSchema");
const mongoose = require("mongoose");

require("../../DB/connection");

router.get("/Empoyee/comapensation/all", async (req, res) => {
  try {
    const Comp = await Compensation.aggregate([
      {
        $lookup: {
          from: "empolyees",
          localField: "EmpolyeeID",
          foreignField: "mainId",
          as: "employee",
        },
      },
    ]);
    //    const emp = await Empolyee.find({ mainId: "EMP20240320140433" })
    if (!Comp) {
      return res.status(404).json({ message: "Compensation not find" });
    }
    return res
      .status(200)
      .json({ message: "Get data successfully", data: Comp });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intrnal server error" });
  }
});

router.get("/Empoyee/comapensation/:id", async (req, res) => {
  const customId = req.params.id;
  try {
    const Comp = await Compensation.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(customId),
        },
      },
      {
        $lookup: {
          from: "empolyees",
          localField: "EmpolyeeID",
          foreignField: "mainId",
          as: "employee",
        },
      },
    ]);
    if (Comp.length === 0) {
      return res.status(404).json({ message: "comapensation not found" });
    }
    res.json(Comp);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
});

router.post("/Empoyee/comapensation/create", async (req, res) => {
  const { EmpolyeeID, Compensationpayout, EffectiveDate, Status, createdBy } =
    req.body;
  try {
    const comm = new Compensation({
      EmpolyeeID: EmpolyeeID,
      Compensationpayout: Compensationpayout,
      EffectiveDate: EffectiveDate,
      createdBy: createdBy,
      Status: Status,
    });
    await comm.save();
    return res
      .status(200)
      .json({ message: "Compensationpayout created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/Employee/compensation-update/:ID", async (req, res) => {
  const { Compensationpayout, EffectiveDate, Status } = req.body;
  const customId = req.params.ID; // Corrected parameter name

  try {
    const comm = await Compensation.findOne({ _id: customId }); // Changed .find() to .findOne()

    if (!comm) {
      return res.status(404).json("Compensationpayout data not found"); // Corrected status code
    }

    comm.Compensationpayout = Compensationpayout;
    comm.EffectiveDate = EffectiveDate;
    comm.Status = Status;

    await comm.save(); // Now comm is an instance of the Mongoose model, so .save() should work
    return res
      .status(200)
      .json({ message: "Compensationpayout update successfully", data: comm });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
});

module.exports = router;
