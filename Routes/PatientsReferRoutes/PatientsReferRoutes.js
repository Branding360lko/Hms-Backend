const express = require("express");
const Router = express.Router();
const PatientsRefer = require("../../Models/PatientsReferSchema/PatientsReferSchema");

Router.get("/get-all-refered-patients", async (req, res) => {
  try {
    const referedPatients = await PatientsRefer.find();
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
Router.get("/get-one-refered-patients/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const referedPatient = await PatientsRefer.findById({ _id: Id });
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
Router.post("/refer-a-patients", async (req, res) => {
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
