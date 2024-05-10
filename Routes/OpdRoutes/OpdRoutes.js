const express = require("express");

const Router = express.Router();
const cookie = require("cookie-parser");
const OPD = require("../../Models/OPDSchema/OPDSchema");
const multer = require("multer");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

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
Router.post("/OPD-Create", upload.none(), async (req, res) => {
  const { medicine, test, Symptoms, Note, OpdPatientData, isPatientsChecked } =
    req.body;
  console.log(
    medicine,
    test,
    Symptoms,
    Note,
    OpdPatientData,
    isPatientsChecked
  );
  try {
    const opd = await OPD.create({
      Note,
      Symptoms,
      medicine,
      test,
      OpdPatientData,
      isPatientsChecked,
    });
    const opdData = await OPD.findById(opd?._id);

    if (!opdData) {
      res.status(500).json("Something went wrong while Saving the OPD Data");
    }

    return res
      .status(201)
      .json({ message: "Data Created Successfully", data: opdData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Faild To Store Date" });
  }
});
Router.get("/get-one-opd-data/:Id", async (req, res) => {
  const Id = req.params.Id;

  try {
    const OpdData = await OPD.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId.createFromHexString(Id) },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine",
          foreignField: "_id",
          as: "medicineData",
        },
      },
      {
        $lookup: {
          from: "tests",
          localField: "test",
          foreignField: "_id",
          as: "testData",
        },
      },
      {
        $lookup: {
          from: "opdpatients",
          localField: "OpdPatientData",
          foreignField: "_id",
          as: "OpdPatientData1",
        },
      },
      {
        $project: {
          _id: 1,
          Symptoms: 1,
          Note: 1,
          "medicineData.Name": 1,
          "medicineData.Price": 1,
          "medicineData._id": 1,

          "testData.TestName": 1,
          "testData._id": 1,
          OpdPatientData1: 1,
        },
      },
    ]);

    console.log(OpdData);

    if (OpdData.length === 0) {
      return res
        .status(404)
        .json({ message: "No OPD record found with the provided ID" });
    }

    return res.status(200).json(OpdData);
  } catch (error) {
    console.error("Error fetching OPD record:", error);
    res.status(500).json("Internal Server Error");
  }
});
Router.put("/update-one-Opd/:Id", upload.none(), async (req, res) => {
  const Id = req.params.Id;
  const { Symptoms, Note, test, medicine, isPatientsChecked } = req.body;
  try {
    const opdData = await OPD.findByIdAndUpdate(
      { _id: Id },
      {
        medicine: medicine,
        Symptoms,
        Note,
        test,
        isPatientsChecked,
      },
      {
        new: true,
        select: "-createdAt,-updatedAt",
      }
    );
    if (!opdData) {
      res.status(403).json({ message: "Faild To Update Opd Data" });
    }
    console.log(opdData);
    return res
      .status(200)
      .json({ message: "Opd Data Updated Successfully", data: opdData });
  } catch (error) {
    res.status(500).json("Something Went Wrong", error);
  }
});
Router.post("/update-patient-checked/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const opdPatientChecked = await OPD.findById({ _id: Id });
    if (!opdPatientChecked) {
      res.status(403).json("Failed While Fetching Patients Opd Data");
    }
    opdPatientChecked.isPatientsChecked = !opdPatientChecked.isPatientsChecked;
    await opdPatientChecked.save({ validateBeforeSave: false });

    return res.status(201).json({ message: "Successfully Opd Value Updated" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = Router;
