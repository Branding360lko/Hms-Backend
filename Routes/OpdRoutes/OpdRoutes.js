const express = require("express");

const Router = express.Router();
const cookie = require("cookie-parser");
const OPD = require("../../Models/OPDSchema/OPDSchema");
const multer = require("multer");
const mongoose = require("mongoose");
const OPDPatientModel = require("../../Models/OPDPatientSchema/OPDPatientSchema");
const IPDPatientModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");
const EmergencyPatientModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");

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
  const {
    medicine,
    test,
    Symptoms,
    Note,
    OpdPatientData,
    isPatientsChecked,
    NextAppoiment,
  } = req.body;
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
      NextAppoiment,
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
          as: "OpdPatientData",
        },
      },

      {
        $unwind: "$OpdPatientData",
      },
      {
        $lookup: {
          from: "patients",
          localField: "OpdPatientData.opdPatientId",
          foreignField: "patientId",
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
          OpdPatientData: 1,
          patientsData: 1,
          NextAppoiment: 1,
        },
      },
    ]);

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
  const { Symptoms, Note, test, medicine, isPatientsChecked, NextAppoiment } =
    req.body;
  try {
    const opdData = await OPD.findByIdAndUpdate(
      { _id: Id },
      {
        medicine,
        Symptoms,
        Note,
        test,
        NextAppoiment,
      },
      {
        new: true,
        select: "-createdAt,-updatedAt",
      }
    );
    // const opdData = await OPD.findById({ _id: Id });
    console.log(opdData);
    if (!opdData) {
      res.status(403).json({ message: "Faild To Update Opd Data" });
    }
    console.log(opdData);
    return res.status(200).json({ message: "Opd Data Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
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
Router.get("/doctor-dashboard-details/:doctorId", async (req, res) => {
  const Id = req.params.doctorId;
  try {
    const opdPatientsDetails = await OPDPatientModel.countDocuments({
      opdDoctorId: Id,
    });
    const ipdPatientsDetails = await IPDPatientModel.countDocuments({
      ipdDoctorId: Id,
      ipdPatientDischarged: false,
    });
    const emergencyPatientsDetails = await EmergencyPatientModel.countDocuments(
      {
        doctorId: Id,
        emergencyPatientDischarged: false,
      }
    );

    res.status(200).json({
      ipdPatientsDetails,
      opdPatientsDetails,
      emergencyPatientsDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error");
  }
});
Router.get("/nurse-dashboard-details/:nurseId", async (req, res) => {
  const Id = req.params.nurseId;
  try {
    const ipdPatientsDetails = await IPDPatientModel.countDocuments({
      ipdNurseId: Id,
      ipdPatientDischarged: false,
    });
    const emergencyPatientsDetails = await EmergencyPatientModel.countDocuments(
      {
        nurseId: Id,
        emergencyPatientDischarged: false,
      }
    );

    res.status(200).json({
      ipdPatientsDetails,
      emergencyPatientsDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error");
  }
});
module.exports = Router;
