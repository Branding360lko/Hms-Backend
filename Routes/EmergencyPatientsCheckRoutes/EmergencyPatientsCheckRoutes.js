const express = require("express");
const Router = express.Router();
const EmergencyPatientsCheck = require("../../Models/EmergencyPatientsCheckSchema/EmergencyPatientsCheckSchema");
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

Router.get("/All-EmergencyPatientsChecks-Routes", async (req, res) => {
  try {
    const emergencyData = await EmergencyPatientsCheck.find({});
    if (!emergencyData) {
      res.status(404).json("No Emergency Data Found");
    }
    return res.status(200).json({
      message: "Emergency Data Feteched Successfully",
      data: emergencyData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.post(
  "/add-EmergencyPatientsChecks-Routes",
  upload.none(),
  async (req, res) => {
    const {
      Symptoms,
      Note,
      EmergencyPatientData,
      isPatientsChecked,
      doctorId,
      VisitDateTime,
      mainId,
    } = req.body;

    try {
      const medicine = req.body.medicine ? JSON.parse(req.body.medicine) : [];
      const test = req.body.test ? JSON.parse(req.body.test) : [];

      const emergency = await EmergencyPatientsCheck.create({
        Note,
        Symptoms,
        medicine: medicine.map((med) => ({
          Name: med.name,
          Quantity: med.quantity,
          Price: med.price,
        })),
        test: test.map((tst) => ({
          Name: tst.name,
          Quantity: tst.quantity,
          Price: tst.price,
        })),
        EmergencyPatientData,
        isPatientsChecked,
        doctorId,
        VisitDateTime,
        mainId,
      });
      const emergencyData = await EmergencyPatientsCheck.findById(
        emergency?._id
      );

      if (!emergencyData) {
        res
          .status(500)
          .json("Something went wrong while Saving the Emergency Data");
      }

      return res
        .status(201)
        .json({ message: "Data Created Successfully", data: emergencyData });
    } catch (error) {
      res.status(500).json({ message: "internal Server Error" });
    }
  }
);
Router.get("/get-one-EmergencyPatientsChecks/:Id", async (req, res) => {
  const Id = req.params.Id;

  try {
    const EmergencyData = await EmergencyPatientsCheck.aggregate([
      {
        $match: {
          EmergencyPatientData: mongoose.Types.ObjectId.createFromHexString(Id),
        },
      },
      // {
      //   $lookup: {
      //     from: "medicines",
      //     localField: "medicine",
      //     foreignField: "_id",
      //     as: "medicineData",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "tests",
      //     localField: "test",
      //     foreignField: "_id",
      //     as: "testData",
      //   },
      // },
      {
        $lookup: {
          from: "emergencypatients",
          localField: "EmergencyPatientData",
          foreignField: "_id",
          as: "EmergencyPatientData",
        },
      },
      {
        $unwind: "$EmergencyPatientData",
      },

      {
        $lookup: {
          from: "patients",
          localField: "EmergencyPatientData.patientId",
          foreignField: "patientId",
          as: "patientsData",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorData",
        },
      },
      {
        $project: {
          _id: 1,
          Symptoms: 1,
          Note: 1,
          medicine: 1,
          test: 1,
          VisitDateTime: 1,
          EmergencyPatientData: 1,
          patientsData: 1,
          doctorData: 1,
        },
      },
    ]);

    if (EmergencyData.length === 0) {
      return res.status(404).json({
        message: "No EmergencyData record found with the provided ID",
      });
    }

    return res
      .status(200)
      .json({ message: "Successfully Data Feteched", data: EmergencyData });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.put(
  "/update-one-EmergencyPatientsChecks/:Id",
  upload.none(),
  async (req, res) => {
    const Id = req.params.Id;
    const { Symptoms, Note, test, medicine } = req.body;
    try {
      const emergencyData = await EmergencyPatientsCheck.findByIdAndUpdate(
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
      if (!emergencyData) {
        res.status(403).json({ message: "Faild To Update EmergencyData " });
      }

      return res.status(200).json({
        message: "EmergencyData  Updated Successfully",
        data: emergencyData,
      });
    } catch (error) {
      res.status(500).json("Something Went Wrong", error);
    }
  }
);
Router.post("/update-EmergencyPatientsChecked/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const emergencyPatientChecked = await EmergencyPatientsCheck.findById({
      _id: Id,
    });
    if (!emergencyPatientChecked) {
      return res
        .status(403)
        .json("Failed While Fetching Patients Emergency Data");
    }
    emergencyPatientChecked.isPatientsChecked =
      !emergencyPatientChecked.isPatientsChecked;
    await emergencyPatientChecked.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ message: "Successfully EmergencyPatientsCheck Value Updated" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = Router;
