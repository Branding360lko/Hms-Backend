const express = require("express");

const router = express.Router();

const PatientModel = require("../../Models/PatientSchema/PatientSchema");
const DoctorModel = require("../../Models/DoctorSchema/DoctorSchema");
const NursesModel = require("../../Models/NurseSchema/NurseSchema");
const BedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");
const AdminsModel = require("../../Models/AdminSchema/AdminSchema");
const OPDPatientsModel = require("../../Models/OPDPatientSchema/OPDPatientSchema");
const IPDPatientsModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");
const EmergencyPatientsModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");

router.get("/DashboardData", async (req, res) => {
  try {
    const totalPatient = await PatientModel.aggregate([{ $count: "patients" }]);
    const totalDoctors = await DoctorModel.aggregate([{ $count: "doctors" }]);
    const totalNurses = await NursesModel.aggregate([{ $count: "nurses" }]);
    const totalBeds = await BedsModel.aggregate([{ $count: "beds" }]);
    const totalAdmins = await AdminsModel.aggregate([{ $count: "admins" }]);
    const totalOPDPatients = await OPDPatientsModel.aggregate([
      { $count: "opdPatients" },
    ]);
    const totalIPDPatients = await IPDPatientsModel.aggregate([
      { $count: "ipdPatients" },
    ]);
    const totalEmergencyPatients = await EmergencyPatientsModel.aggregate([
      { $count: "emergencyPatients" },
    ]);
    const totalDischargedIPDPatients = await IPDPatientsModel.aggregate([
      {
        $match: { ipdPatientDischarged: true },
      },
      {
        $count: "dischargedIPDPatients",
      },
    ]);
    const totalDischargedEmergencyPatients = await IPDPatientsModel.aggregate([
      {
        $match: { emergencyPatientDischarged: true },
      },
      {
        $count: "dischargedEmergencyPatients",
      },
    ]);

    return res.status(200).json({
      Patient: totalPatient.length === 0 ? 0 : totalPatient[0].patients,
      Doctors: totalDoctors.length === 0 ? 0 : totalDoctors[0].doctors,
      Nurses: totalNurses.length === 0 ? 0 : totalNurses[0].nurses,
      Beds: totalBeds.length === 0 ? 0 : totalBeds[0].beds,
      Admins: totalAdmins.length === 0 ? 0 : totalAdmins[0].admins,
      OPDPatients:
        totalOPDPatients.length === 0 ? 0 : totalOPDPatients[0].opdPatients,
      IPDPatients:
        totalIPDPatients.length === 0 ? 0 : totalIPDPatients[0].ipdPatients,
      EmergencyPatients:
        totalEmergencyPatients.length === 0
          ? 0
          : totalEmergencyPatients[0].emergencyPatients,
      DischargedIPDPatients:
        totalDischargedIPDPatients.length === 0
          ? 0
          : totalDischargedIPDPatients[0].dischargedIPDPatients,
      DischargedEmergencyPatients:
        totalDischargedEmergencyPatients.length === 0
          ? 0
          : totalDischargedEmergencyPatients[0].dischargedEmergencyPatients,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
