const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const EmergencyPatientDischargeRecieptModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientDischargeRecieptSchema");

const EmergencyDoctorDischargeDetailsModel = require("../../Models/EmergencyPatientSchema/EmergencyDoctorDischargeDetailsSchema");

const EmergencyNurseDischargeDetailsModel = require("../../Models/EmergencyPatientSchema/EmergencyNurseDischargeDetailsSchema");

const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");

const EmergencyPatientModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");
const EmergencyPatientsCheck = require("../../Models/EmergencyPatientsCheckSchema/EmergencyPatientsCheckSchema");

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

Router.get("/EmergencyPatientDischargeReciept-GET-ALL", async (req, res) => {
  try {
    const EmergencyPatientDischargeRecieptData =
      await EmergencyPatientDischargeRecieptModel.find();

    res.status(200).json(EmergencyPatientDischargeRecieptData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get(
  "/EmergencyPatientDischargeReciept-GET-ONE/:Id",
  async (req, res) => {
    const id = req.params.Id;

    try {
      const emergencyPatientDischargeRecieptData =
        await EmergencyPatientDischargeRecieptModel.findOne({
          emergencyPatientRegId: id,
        });

      if (!emergencyPatientDischargeRecieptData) {
        return res
          .status(404)
          .json("Emergency Patient Discharge Reciept Data Not Found");
      }

      const EmergencyPatientData = await EmergencyPatientModel.aggregate([
        {
          $match: {
            mainId: emergencyPatientDischargeRecieptData.emergencyPatientRegId,
          },
        },
        {
          $lookup: {
            from: "managebeds",
            localField: "bedId",
            foreignField: "bedId",
            as: "bedData",
          },
        },
        { $unwind: "$bedData" },
        {
          $lookup: {
            from: "emergencynursedischargedetails",
            localField: "mainId",
            foreignField: "emergencyPatientRegId",
            as: "NurseDischargeData",
          },
        },
        { $unwind: "$NurseDischargeData" },
        {
          $lookup: {
            from: "emergencydoctordischargedetails",
            localField: "mainId",
            foreignField: "emergencyPatientRegId",
            as: "DoctorDischargeData",
          },
        },
        { $unwind: "$DoctorDischargeData" },
      ]);
      return res.status(200).json({
        emergencyPatientDischargeRecieptData:
          emergencyPatientDischargeRecieptData,
        EmergencyPatientData: EmergencyPatientData,
      });
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.put("/EmergencyPatient-PUT-DISCHARGE/:Id", async (req, res) => {
  try {
    const id = req.params.Id;

    const { BHT, surgery, result } = req.body;

    const emergencyPatientCheck = await EmergencyPatientModel.findOne({
      mainId: id,
    });

    if (emergencyPatientCheck) {
      if (
        emergencyPatientCheck.emergencyPatientNurseConfirmation === true &&
        emergencyPatientCheck.emergencyPatientDoctorConfirmation === true
      ) {
        const emergencyPatientUpdatedData =
          await EmergencyPatientModel.findOneAndUpdate(
            { mainId: id },
            {
              emergencyPatientDischarged: true,
            }
          );

        if (!emergencyPatientUpdatedData) {
          return res.status(404).json("Emergency Patient Data Not Found");
        }

        if (emergencyPatientUpdatedData) {
          const ManageBedsUpdatedData = await ManageBedsModel.findOneAndUpdate(
            {
              bedId: emergencyPatientUpdatedData.bedId,
            },
            { bedAvailableOrNot: true }
          );
          const emergencycheckroute = await EmergencyPatientsCheck.updateMany(
            {
              mainId: emergencyPatientUpdatedData.mainId,
            },
            {
              discharge: true,
            }
          );
          if (ManageBedsUpdatedData) {
            const newDischargeReciept =
              new EmergencyPatientDischargeRecieptModel({
                recieptId: "EM-R-" + generateUniqueId(),
                emergencyPatientRegId: emergencyPatientUpdatedData.mainId,
                patientUHID: emergencyPatientUpdatedData.patientId,
                BHT: BHT,
                surgery: surgery,
                bedId: emergencyPatientUpdatedData.bedId,
                dateAndTimeOfDischarge: new Date(),
                result: result,
              });

            return await newDischargeReciept.save().then((data) =>
              res.status(200).json({
                message: "Emergency Patient Discharged Successfully",
                data: data,
              })
            );
          }
        }
      } else {
        res.status(500).json({ error: "Something went wrong" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.put("/EmergencyPatientDischargeRequest-PUT/:id", async (req, res) => {
  try {
    const updatedValue = await EmergencyPatientModel.findOneAndUpdate(
      {
        mainId: req.params.id,
      },
      {
        emergencyPatientNurseRequestForDischarge: true,
        emergencyPatientDoctorRequestForDischarge: true,
      }
    );
    if (!updatedValue) {
      return res
        .status(404)
        .json({ error: "Emergency Patient data Not found" });
    }
    return res
      .status(200)
      .json({ message: "Request to discharge sent successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put(
  "/EmergencyPatientDischarge-NurseDischargeDetails-PUT/:Id",
  async (req, res) => {
    const emergencyPatientId = req.params.Id;

    const {
      nurseId,
      admittedFor,
      investigationORProcedure,
      conditionDuringDischarge,
      date,
      operations,
      indications,
      surgeon,
      assistants,
      nurse,
      anaesthetist,
      anaesthesia,
      implantDetails,
    } = req.body;
    try {
      const updatedNurseDischargeDetailsUpdated =
        await EmergencyNurseDischargeDetailsModel.findOneAndUpdate(
          {
            emergencyPatientRegId: emergencyPatientId,
          },
          {
            nurseId: nurseId
              ? nurseId
              : EmergencyNurseDischargeDetailsModel.nurseId,
            admittedFor: admittedFor
              ? admittedFor
              : EmergencyNurseDischargeDetailsModel.admittedFor,
            investigationORProcedure: investigationORProcedure
              ? investigationORProcedure
              : EmergencyNurseDischargeDetailsModel.investigationORProcedure,
            conditionDuringDischarge: conditionDuringDischarge
              ? conditionDuringDischarge
              : EmergencyNurseDischargeDetailsModel.conditionDuringDischarge,
            date: date ? date : EmergencyNurseDischargeDetailsModel.date,
            operations: operations
              ? operations
              : EmergencyNurseDischargeDetailsModel.operations,
            indications: indications
              ? indications
              : EmergencyNurseDischargeDetailsModel.indications,
            surgeon: surgeon
              ? surgeon
              : EmergencyNurseDischargeDetailsModel.surgeon,
            assistants: assistants
              ? assistants
              : EmergencyNurseDischargeDetailsModel.assistants,
            nurse: nurse ? nurse : EmergencyNurseDischargeDetailsModel.nurse,
            anaesthetist: anaesthetist
              ? anaesthetist
              : EmergencyNurseDischargeDetailsModel.anaesthetist,
            anaesthesia: anaesthesia
              ? anaesthesia
              : EmergencyNurseDischargeDetailsModel.anaesthesia,
            implantDetails: implantDetails
              ? implantDetails
              : EmergencyNurseDischargeDetailsModel.implantDetails,
          }
        );

      if (!updatedNurseDischargeDetailsUpdated) {
        return res
          .status(404)
          .json("Emergency Patient Discharge Details Not Found");
      }

      if (updatedNurseDischargeDetailsUpdated) {
        const updatedEmergencyPatient =
          await EmergencyPatientModel.findOneAndUpdate(
            {
              mainId: updatedNurseDischargeDetailsUpdated.emergencyPatientRegId,
            },
            {
              emergencyPatientNurseConfirmation: true,
            }
          );

        if (updatedEmergencyPatient) {
          return res.status(200).json({
            message:
              "Emergency Patient Nurse Discharge Details has been updated",
          });
        }
      }
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.put(
  "/EmergencyPatientDischarge-DoctorDischargeDetails-PUT/:ID",
  async (req, res) => {
    const id = req.params.ID;

    const {
      doctorId,
      provisionalDiagnosis,
      finalDiagnosis,
      physicianInCharge,
      name,
      ICD,
      result,
      disease_Diagnose,
      adviseDuringDischarge,
    } = req.body;
    try {
      const updatedEmergencyDoctorDischargeDetails =
        await EmergencyDoctorDischargeDetailsModel.findOneAndUpdate(
          { emergencyPatientRegId: id },
          {
            doctorId: doctorId
              ? doctorId
              : EmergencyDoctorDischargeDetailsModel.doctorId,
            provisionalDiagnosis: provisionalDiagnosis
              ? provisionalDiagnosis
              : EmergencyDoctorDischargeDetailsModel.provisionalDiagnosis,
            finalDiagnosis: finalDiagnosis
              ? finalDiagnosis
              : EmergencyDoctorDischargeDetailsModel.finalDiagnosis,
            physicianInCharge: physicianInCharge
              ? physicianInCharge
              : EmergencyDoctorDischargeDetailsModel.physicianInCharge,
            name: name ? name : EmergencyDoctorDischargeDetailsModel.name,
            ICD: ICD ? ICD : EmergencyDoctorDischargeDetailsModel.ICD,
            result: result
              ? result
              : EmergencyDoctorDischargeDetailsModel.result,
            disease_Diagnose: disease_Diagnose
              ? disease_Diagnose
              : EmergencyDoctorDischargeDetailsModel.disease_Diagnose,
            adviseDuringDischarge: adviseDuringDischarge
              ? adviseDuringDischarge
              : EmergencyDoctorDischargeDetailsModel.adviseDuringDischarge,
          }
        );

      if (!updatedEmergencyDoctorDischargeDetails) {
        return res
          .status(404)
          .json("Emergency Patient Discharge Details Not Found");
      }

      if (updatedEmergencyDoctorDischargeDetails) {
        const updateEmergencyPatient =
          await EmergencyPatientModel.findOneAndUpdate(
            {
              mainId:
                updatedEmergencyDoctorDischargeDetails.emergencyPatientRegId,
            },
            {
              emergencyPatientDoctorConfirmation: true,
            }
          );

        if (updateEmergencyPatient) {
          return res.status(200).json({
            message:
              "Emergency Patient Doctor Discharge Details has been updated",
          });
        }
      }
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);
module.exports = Router;
