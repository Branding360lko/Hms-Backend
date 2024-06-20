const express = require("express");

const Router = express.Router();

const mongoose = require("mongoose");

require("../../DB/connection");

const EmergencyPatientModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");

const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");

const EmergencyPatientBalanceModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientBalanceSchema");

const EmergencyNurseDischargeDetailsModel = require("../../Models/EmergencyPatientSchema/EmergencyNurseDischargeDetailsSchema");

const EmergencyDoctorDischargeDetailsModel = require("../../Models/EmergencyPatientSchema/EmergencyDoctorDischargeDetailsSchema");

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
  const {
    patientId,
    doctorId,
    nurseId,
    notes,
    emergencyDepositAmount,

    emergencyPaymentMode,
    // ipdWardNo,
    emergencyFloorNo,
    balanceNote,
    // ipdRoomNo,
    bedId,
  } = req.body;
  try {
    if (!patientId && !doctorId) {
      return res
        .status(422)
        .json({ error: "Please fill the field completely!" });
    }
    const newEmergencyPatientData = new EmergencyPatientModel({
      mainId: "P-EM-" + generateUniqueId(),
      patientId: patientId,
      doctorId: doctorId,
      nurseId: nurseId,
      emergencyDepositAmount: emergencyDepositAmount,
      emergencyFloorNo: emergencyFloorNo,
      bedId: bedId,
      notes: notes,
    });

    if (newEmergencyPatientData) {
      const newEmergencyPatientBalanceData = new EmergencyPatientBalanceModel({
        balanceID: "EMBal" + generateUniqueId(),
        uhid: newEmergencyPatientData.patientId,
        emergencyPatientRegId: newEmergencyPatientData.mainId,
        balance: {
          _id: new mongoose.Types.ObjectId(),
          patientType: "Emergency",
          totalBalance: newEmergencyPatientData.emergencyDepositAmount,
          addedBalance: newEmergencyPatientData.emergencyDepositAmount,
          paymentMethod: emergencyPaymentMode,
          balanceNote: balanceNote,
        },
      });

      await newEmergencyPatientBalanceData.save();

      const newEmergencyPatientNurseDischargeDetailsData =
        new EmergencyNurseDischargeDetailsModel({
          mainId: "EM-ND-" + generateUniqueId(),
          emergencyPatientRegId: newEmergencyPatientData.mainId,
          nurseId: newEmergencyPatientData.nurseId,
        });

      await newEmergencyPatientNurseDischargeDetailsData.save();

      const newEmergencyPatientDoctorDischargeDetailsData =
        new EmergencyDoctorDischargeDetailsModel({
          mainId: "EM-DD-" + generateUniqueId(),
          emergencyPatientRegId: newEmergencyPatientData.mainId,
          doctorId: newEmergencyPatientData.doctorId,
        });

      await newEmergencyPatientDoctorDischargeDetailsData.save();

      await ManageBedsModel.findOneAndUpdate(
        {
          bedId: newEmergencyPatientData.bedId,
        },
        { bedAvailableOrNot: false }
      );

      return await newEmergencyPatientData.save().then((data) =>
        res.status(200).json({
          message: "Emergency Patient Added Successfully",
          data: data,
        })
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/EmergencyPatient-PUT/:ID", async (req, res) => {
  const id = req.params.ID;

  const {
    patientId,
    doctorId,
    nurseId,
    notes,
    emergencyDepositAmount,
    // ipdWardNo,
    emergencyFloorNo,
    // ipdRoomNo,
    bedId,
  } = req.body;
  try {
    const emergencyPatientUpdatedData =
      await EmergencyPatientModel.findOneAndUpdate(
        {
          mainId: id,
        },
        {
          patientId: patientId ? patientId : EmergencyPatientModel.patientId,
          doctorId: doctorId ? doctorId : EmergencyPatientModel.doctorId,
          nurseId: nurseId ? nurseId : EmergencyPatientModel.nurseId,
          bedId: bedId ? bedId : EmergencyPatientModel.bedId,
          emergencyFloorNo: emergencyFloorNo
            ? emergencyFloorNo
            : EmergencyPatientModel.emergencyFloorNo,
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

Router.put(
  "/EmergencyPatient-PUT-UpdateDepositAmount/:ID",
  async (req, res) => {
    const id = req.params.ID;

    const { emergencyAddedAmount, emergencyPaymentMode, balanceNote } =
      req.body;
    try {
      const patient = await EmergencyPatientModel.findOne({ mainId: id });

      if (patient) {
        const emergencyPatientData =
          await EmergencyPatientModel.findOneAndUpdate(
            { mainId: id },
            {
              emergencyDepositAmount: emergencyAddedAmount
                ? patient.emergencyDepositAmount + emergencyAddedAmount
                : EmergencyPatientModel.emergencyDepositAmount,
              emergencyAddedAmount: emergencyAddedAmount
                ? emergencyAddedAmount
                : EmergencyPatientModel.emergencyAddedAmount,
            }
          );

        if (!emergencyPatientData) {
          return res.status(404).json("Emergency Patient Data Not Found");
        }

        if (emergencyPatientData) {
          await EmergencyPatientBalanceModel.findOneAndUpdate(
            { emergencyPatientRegId: emergencyPatientData.mainId },
            {
              $push: {
                balance: {
                  _id: new mongoose.Types.ObjectId(),
                  patientType: "Emergency",
                  totalBalance:
                    emergencyPatientData.emergencyDepositAmount +
                    emergencyAddedAmount,
                  addedBalance: emergencyAddedAmount,
                  paymentMethod: emergencyPaymentMode,
                  balanceNote: balanceNote,
                },
              },
            }
          );
        }

        return res.status(200).json({
          message: "Emergency Patient Deposit Amount Updated Successfully",
        });
      }
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

module.exports = Router;
