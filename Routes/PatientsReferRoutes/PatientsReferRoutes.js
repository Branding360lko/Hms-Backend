const express = require("express");
const Router = express.Router();
const PatientsRefer = require("../../Models/PatientsReferSchema/PatientsReferSchema");
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
Router.get("/get-all-refered-patients", async (req, res) => {
  try {
    const referedPatients = await PatientsRefer.aggregate([
      {
        $lookup: {
          from: "ipdpatients",
          localField: "ipdPatient",
          foreignField: "_id",
          as: "ipdPatientsDetails",
        },
      },
      {
        $unwind: "$ipdPatientsDetails",
      },
      {
        $lookup: {
          from: "patients",
          localField: "ipdPatientsDetails.ipdPatientId",
          foreignField: "patientId",
          as: "PatientsDetails",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "referringDoctor",
          foreignField: "_id",
          as: "ReferringDoctorDetails",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "ReferredDoctor",
          foreignField: "_id",
          as: "ReferredDoctorDetails",
        },
      },
      {
        $project: {
          _id: 1,
          ipdPatient: 1,
          referringDoctor: 1,
          ReferredDoctor: 1,
          ReferedDateAndTime: 1,
          ReasonForReferal: 1,
          Note: 1,
          createdAt: 1,
          updatedAt: 1,
          ipdPatientsDetails: 1,
          PatientsDetails: 1,
          ReferringDoctorDetails: 1,
          ReferredDoctorDetails: 1,
          IpdPatietnBed: "$ipdPatientsDetails.ipdBedNo",
        },
      },
    ]);
    if (!referedPatients) {
      return res.status(403).json({ message: "No data Found" });
    }
    return res
      .status(200)
      .json({ message: "Successfully Fetch Data", data: referedPatients });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.get(
  "/get-all-refered-patients-by-nurseId/:nurseId",
  async (req, res) => {
    const Id = req.params.nurseId;
    try {
      const referedPatients = await PatientsRefer.aggregate([
        {
          $lookup: {
            from: "ipdpatients",
            localField: "ipdPatient",
            foreignField: "_id",
            as: "ipdPatientsDetails",
          },
        },
        {
          $unwind: "$ipdPatientsDetails",
        },
        {
          $lookup: {
            from: "patients",
            localField: "ipdPatientsDetails.ipdPatientId",
            foreignField: "patientId",
            as: "PatientsDetails",
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "referringDoctor",
            foreignField: "_id",
            as: "ReferringDoctorDetails",
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "ReferredDoctor",
            foreignField: "_id",
            as: "ReferredDoctorDetails",
          },
        },
        {
          $match: {
            $and: [
              { "ipdPatientsDetails.ipdNurseId": Id },
              { "ipdPatientsDetails.ipdPatientDischarged": false },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            ipdPatient: 1,
            referringDoctor: 1,
            ReferredDoctor: 1,
            ReferedDateAndTime: 1,
            ReasonForReferal: 1,
            Note: 1,
            createdAt: 1,
            updatedAt: 1,
            ipdPatientsDetails: 1,
            PatientsDetails: 1,
            ReferringDoctorDetails: 1,
            ReferredDoctorDetails: 1,
            IpdPatietnBed: "$ipdPatientsDetails.ipdBedNo",
          },
        },
      ]);
      if (!referedPatients) {
        return res.status(403).json({ message: "No data Found" });
      }
      return res
        .status(200)
        .json({ message: "Successfully Fetch Data", data: referedPatients });
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);
Router.get(
  "/get-all-refered-patients-by-doctorId/:doctorId",
  async (req, res) => {
    const Id = req.params.doctorId;
    try {
      const referedPatients = await PatientsRefer.aggregate([
        {
          $lookup: {
            from: "ipdpatients",
            localField: "ipdPatient",
            foreignField: "_id",
            as: "ipdPatientsDetails",
          },
        },
        {
          $unwind: "$ipdPatientsDetails",
        },
        {
          $lookup: {
            from: "patients",
            localField: "ipdPatientsDetails.ipdPatientId",
            foreignField: "patientId",
            as: "PatientsDetails",
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "referringDoctor",
            foreignField: "_id",
            as: "ReferringDoctorDetails",
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "ReferredDoctor",
            foreignField: "_id",
            as: "ReferredDoctorDetails",
          },
        },
        {
          $match: {
            $and: [
              { "ReferredDoctorDetails.doctorId": Id },
              { "ipdPatientsDetails.ipdPatientDischarged": false },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            ipdPatient: 1,
            referringDoctor: 1,
            ReferredDoctor: 1,
            ReferedDateAndTime: 1,
            ReasonForReferal: 1,
            Note: 1,
            createdAt: 1,
            updatedAt: 1,
            ipdPatientsDetails: 1,
            PatientsDetails: 1,
            ReferringDoctorDetails: 1,
            ReferredDoctorDetails: 1,
          },
        },
      ]);
      if (!referedPatients) {
        return res.status(403).json({ message: "No data Found" });
      }
      return res
        .status(200)
        .json({ message: "Successfully Fetch Data", data: referedPatients });
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);
Router.get("/get-one-refered-patients/:Id", async (req, res) => {
  const Id = req.params.Id;

  try {
    const referedPatient = await PatientsRefer.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(Id),
        },
      },
      {
        $lookup: {
          from: "ipdpatients",
          localField: "ipdPatient",
          foreignField: "_id",
          as: "IpdPatientDetails",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "referringDoctor",
          foreignField: "_id",
          as: "referringDoctor",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "ReferredDoctor",
          foreignField: "_id",
          as: "ReferredDoctor",
        },
      },
    ]);
    if (!referedPatient) {
      return res.status(403).json({ message: "No Data Found By This Id" });
    }
    return res
      .status(200)
      .json({ message: "Successfully Fetch The Data", data: referedPatient });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.post("/refer-a-patients", upload.none(), async (req, res) => {
  const {
    ipdPatient,
    referringDoctor,
    ReferredDoctor,
    ReferedDateAndTime,
    ReasonForReferal,
    Note,
  } = req.body;
  try {
    if (
      !(
        ipdPatient &&
        referringDoctor &&
        ReferredDoctor &&
        ReferedDateAndTime &&
        ReasonForReferal
      )
    ) {
      return res
        .status(403)
        .json({ message: "Please Filed All Required Fields" });
    }
    const referedpatient = await PatientsRefer.create({
      ipdPatient,
      referringDoctor,
      ReferredDoctor,
      ReferedDateAndTime,
      ReasonForReferal,
      Note,
    });

    const patient = await PatientsRefer.findById({ _id: referedpatient._id });

    if (!patient) {
      return res.status(403).json({
        message: "Something Went Wrong While Saving Data,Try Again Later",
      });
    }
    return res
      .status(201)
      .json({ message: "Successfully Patient Referred", data: patient });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
Router.put("/update-refered-patient/:Id", async (req, res) => {
  const Id = req.params.Id;
  const { ReasonForReferal, Note } = req.body;
  try {
    const updatePatient = await PatientsRefer.findByIdAndUpdate(
      { _id: Id },
      {
        ReasonForReferal: ReasonForReferal
          ? ReasonForReferal
          : PatientsRefer.ReasonForReferal,
        Note: Note ? Note : PatientsRefer.Note,
      },
      { new: true }
    );
    if (!updatePatient) {
      return res
        .status(403)
        .json({ message: "Failed To Update Refer Patients" });
    }
    return res
      .status(200)
      .json({ message: "Successfully Updated Data", data: updatePatient });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
