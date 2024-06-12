const express = require("express");

const Router = express.Router();

const EmergencyPatientModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");

const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");

const generateUniqueId = () => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const uniqueId = `${year}${month}${day}${hours}${minutes}${seconds}`;

  return uniqueId;
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

Router.post("/EmergencyPatient-POST", async (req, res) => {
  const { patientId, doctorId, bedId, admittingDateTime, notes } = req.body;
  try {
    if (!bedId) {
      return res.status(422).json("Please select the available bed!");
    }

    if (bedId) {
      const newEmergencyPatient = new EmergencyPatientModel({
        mainId: "EM" + generateUniqueId(),
        patientId: patientId,
        doctorId: doctorId,
        bedId: bedId,
        admittingDateTime: admittingDateTime,
        notes: notes,
      });

      if (newEmergencyPatient) {
        const bedStatusUpdate = await ManageBedsModel.findOneAndUpdate(
          { bedId: bedId },
          {
            bedAvailableOrNot: false,
          }
        );

        if (bedStatusUpdate) {
          return await newEmergencyPatient.save().then((data) =>
            res.status(200).json({
              message: "Emergency Patient Created Successfully!",
              data: data,
            })
          );
        }
      }
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/EmergencyPatient-PUT/:ID", async (req, res) => {
  const id = req.params.ID;
  const { patientId, doctorId, bedId, admittingDateTime, notes } = req.body;
  try {
    const emergencyPatientUpdatedData =
      await EmergencyPatientModel.findOneAndUpdate(
        {
          mainId: id,
        },
        {
          patientId: patientId ? patientId : EmergencyPatientModel.patientId,
          doctorId: doctorId ? doctorId : EmergencyPatientModel.doctorId,
          bedId: bedId ? bedId : EmergencyPatientModel.bedId,
          admittingDateTime: admittingDateTime
            ? admittingDateTime
            : EmergencyPatientModel.admittingDateTime,
          notes: notes ? notes : EmergencyPatientModel.notes,
        }
      );

    if (!emergencyPatientUpdatedData) {
      return res.status(404).json("Emergency Patient not found");
    }

    return res.status(200).json({
      message: "Emergency Patient Updated successfully",
      data: emergencyPatientUpdatedData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/EmergencyPatient-DELETE/:ID", async (req, res) => {
  const id = req.params.ID;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();
    const EmergencyPatient = await EmergencyPatientModel.findOneAndUpdate(
      {
        mainId: id,
      },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!EmergencyPatient) {
      return res.status(404).json("Emergency Patient not found");
    }
    return res
      .status(200)
      .json({ message: "Emergency Patient Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = Router;
