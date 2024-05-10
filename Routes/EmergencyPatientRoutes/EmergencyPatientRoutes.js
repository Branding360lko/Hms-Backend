const express = require("express");

const Router = express.Router;

const EmergencyPatientModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");

const generateUniqueId = async () => {
  try {
    // Get current date
    const date = new Date();
    const year = date.getFullYear().toString();
    // const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // const day = date.getDate().toString().padStart(2, "0");

    // Find the latest patient ID
    const latestPatient = await PatientModel.findOne(
      {},
      {},
      { sort: { patientId: -1 } }
    );
    // console.log(latestPatient)

    // Extract the sequence part from the latest patient ID and increment it
    let sequence = 1;
    if (latestPatient) {
      const latestPatientId = latestPatient.patientId;
      // const sequencePart = latestPatientId.substr(9, 4); // Assuming the sequence part starts from the 9th character
      const sequencePart = latestPatientId.substr(4);
      sequence = parseInt(sequencePart) + 1;
    }

    // Construct the new patient ID
    // const paddedSequence = sequence.toString().padStart(6, "0");
    const paddedSequence = sequence.toString().padStart(4, "0");
    const uniqueId = `${year}${paddedSequence}`;

    return uniqueId;
  } catch (error) {
    throw error;
  }
};

Router.get("/EmergencyPatient-GET-ALL", async (req, res) => {
  try {
    const EmergencyPatientData = await EmergencyPatientModel.find();
    if (EmergencyPatientData) {
      return res.status(200).json(EmergencyPatientData);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.get("/EmergencyPatient-GET-ONE/:ID", async (req, res) => {
  const id = req.params.ID;
  try {
    const EmergencyPatientData = await EmergencyPatientModel.findOne({
      mainId: id,
    });
    if (!EmergencyPatientData) {
      return res.status(404).json("Emergency Patient Not Found");
    }
    return res.status(200).json(EmergencyPatientData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.get("/EmergencyPatient-POST", async (req, res) => {
  const { patientId, doctorId, bedId, admittingDateTime } = req.body;
  try {
  } catch (error) {}
});
