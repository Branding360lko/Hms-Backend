const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const OPDPatientModel = require("../../Models/OPDPatientSchema/OPDPatientSchema");

//

const generateUniqueId = async () => {
  try {
    // Get current date
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // const day = date.getDate().toString().padStart(2, "0");

    // Find the latest patient ID
    const latestOPDPatient = await OPDPatientModel.findOne(
      {},
      {},
      { sort: { mainId: -1 } }
    );
    // console.log(latestOPDPatient);

    // Extract the sequence part from the latest patient ID and increment it
    let sequence = 1;
    if (latestOPDPatient) {
      const latestOPDPatientId = latestOPDPatient.mainId;
      const sequencePart = latestOPDPatientId.substr(6); // Assuming the sequence part starts from the 9th character
      sequence = parseInt(sequencePart) + 1;
    }

    // Construct the new patient ID
    const paddedSequence = sequence.toString().padStart(4, "0");
    const uniqueId = `${year}${month}${paddedSequence}`;

    return uniqueId;
  } catch (error) {
    throw error;
  }
};

Router.get("/OPDPatient-GET-ALL", async (req, res) => {
  try {
    const OPDPatientData = await OPDPatientModel.find();

    res.status(200).json(OPDPatientData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/OPDPatient-GET-ONE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    const OPDPatientData = await OPDPatientModel.findOne({
      mainId: id,
    });

    if (!OPDPatientData) {
      return res.status(404).json("Patient Not Found");
    }

    return res.status(200).json(OPDPatientData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/OPDPatient-POST", async (req, res) => {
  const {
    opdPatientId,
    opdCaseId,
    opdId,
    opdDoctorId,
    opdPatientBloodPressure,
    opdPatientStandardCharges,
    opdPatientPaymentMode,
    opdDoctorVisitDate,
    opdPatientNotes,
  } = req.body;
  try {
    if (!opdPatientId && !opdDoctorId) {
      return res
        .status(422)
        .json({ error: "Please fill the field completely!" });
    }

    const newOPDPatientData = new OPDPatientModel({
      mainId: await generateUniqueId(),
      opdPatientId: opdPatientId,
      opdCaseId: opdCaseId,
      opdId: opdId,
      opdDoctorId: opdDoctorId,
      opdPatientBloodPressure: opdPatientBloodPressure,
      opdPatientStandardCharges: opdPatientStandardCharges,
      opdPatientPaymentMode: opdPatientPaymentMode,
      opdDoctorVisitDate: opdDoctorVisitDate,
      opdPatientNotes: opdPatientNotes,
    });

    return await newOPDPatientData.save().then((data) =>
      res.status(200).json({
        message: "OPD Patient Added Successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/OPDPatient-PUT/:Id", async (req, res) => {
  const id = req.params.Id;

  const {
    opdPatientId,
    opdCaseId,
    opdId,
    opdDoctorId,
    opdPatientBloodPressure,
    opdPatientStandardCharges,
    opdPatientPaymentMode,
    opdDoctorVisitDate,
    opdPatientNotes,
  } = req.body;
  try {
    const OPDPatientData = await OPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        opdPatientId: opdPatientId
          ? opdPatientId
          : OPDPatientModel.opdPatientId,
        opdCaseId: opdCaseId ? opdCaseId : OPDPatientModel.opdCaseId,
        opdId: opdId ? opdId : OPDPatientModel.opdId,
        opdDoctorId: opdDoctorId ? opdDoctorId : OPDPatientModel.opdDoctorId,
        opdPatientBloodPressure: opdPatientBloodPressure
          ? opdPatientBloodPressure
          : OPDPatientModel.opdPatientBloodPressure,
        opdPatientStandardCharges: opdPatientStandardCharges
          ? opdPatientStandardCharges
          : OPDPatientModel.opdPatientStandardCharges,
        opdPatientPaymentMode: opdPatientPaymentMode
          ? opdPatientPaymentMode
          : OPDPatientModel.opdPatientPaymentMode,
        opdDoctorVisitDate: opdDoctorVisitDate
          ? opdDoctorVisitDate
          : OPDPatientModel.opdDoctorVisitDate,
        opdPatientNotes: opdPatientNotes
          ? opdPatientNotes
          : OPDPatientModel.opdPatientNotes,
      }
    );
    if (!OPDPatientData) {
      return res.status(404).json("OPD Patient data not found");
    }
    return res.status(200).json({
      message: "OPD Patient data Updated successfully",
      data: OPDPatientData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/OPDPatient-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const OPDPatientData = await OPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!OPDPatientData) {
      return res.status(404).json("OPD Patient data not found");
    }
    return res
      .status(200)
      .json({ message: "OPD Patient Data Deleted successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
