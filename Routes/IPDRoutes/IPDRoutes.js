const express = require("express");

const Router = express.Router();

const IPD = require("../../Models/IPDSchema/IPDSchema");
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

Router.get("/All-Ipd-Routes", async (req, res) => {
  try {
    const ipdData = await IPD.find({});
    if (!ipdData) {
      res.status(404).json("No Ipd Data Found");
    }
    return res
      .status(200)
      .json({ message: "Ipd Data Feteched Successfully", data: ipdData });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/IPD-Create", upload.none(), async (req, res) => {
  const { medicine, test, Symptoms, Note, ipdPatientData, isPatientsChecked } =
    req.body;

  try {
    const ipd = await IPD.create({
      Note,
      Symptoms,
      medicine,
      test,
      ipdPatientData,
      isPatientsChecked,
    });
    const ipdData = await IPD.findById(ipd?._id);

    if (!ipdData) {
      res.status(500).json("Something went wrong while Saving the IPD Data");
    }

    return res
      .status(201)
      .json({ message: "Data Created Successfully", data: ipdData });
  } catch (error) {
    res.status(500).json({ message: "internal Server Error" });
  }
});
Router.get("/get-one-ipd-data/:Id", async (req, res) => {
  const Id = req.params.Id;

  try {
    const IpdData = await IPD.aggregate([
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
          from: "ipdpatients",
          localField: "ipdPatientData",
          foreignField: "_id",
          as: "IpdPatientData",
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "ipdPatientData",
          foreignField: "_id",
          as: "patientsData",
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
          "testData.Name": 1,
          "testData._id": 1,
          IpdPatientData: 1,
          patientsData: 1,
        },
      },
    ]);

    if (IpdData.length === 0) {
      return res
        .status(404)
        .json({ message: "No IPD record found with the provided ID" });
    }

    return res.status(200).json(IpdData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.put("/update-one-Ipd/:Id", upload.none(), async (req, res) => {
  const Id = req.params.Id;
  const { Symptoms, Note, test, medicine } = req.body;
  try {
    const ipdData = await IPD.findByIdAndUpdate(
      { _id: Id },
      {
        medicine: medicine,
        Symptoms,
        Note,
        test,
      },
      {
        new: true,
        select: "-createdAt,-updatedAt",
      }
    );
    if (!ipdData) {
      res.status(403).json({ message: "Faild To Update Ipd Data" });
    }

    return res
      .status(200)
      .json({ message: "Ipd Data Updated Successfully", data: ipdData });
  } catch (error) {
    res.status(500).json("Something Went Wrong", error);
  }
});
Router.post("/update-ipdPatient-checked/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const ipdPatientChecked = await IPD.findById({ _id: Id });
    if (!ipdPatientChecked) {
      res.status(403).json("Failed While Fetching Patients Ipd Data");
    }
    ipdPatientChecked.isPatientsChecked = !ipdPatientChecked.isPatientsChecked;
    await ipdPatientChecked.save({ validateBeforeSave: false });

    return res.status(201).json({ message: "Successfully Ipd Value Updated" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = Router;