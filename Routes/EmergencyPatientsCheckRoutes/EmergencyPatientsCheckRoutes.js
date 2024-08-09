const express = require("express");
const Router = express.Router();
const EmergencyPatientsCheck = require("../../Models/EmergencyPatientsCheckSchema/EmergencyPatientsCheckSchema");
const multer = require("multer");
const mongoose = require("mongoose");
const EmergencyPatientModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");
const path = require("path");
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
    const emergencyData = await EmergencyPatientsCheck.find({
      discharge: false,
    });
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
      emergencyPatientCurrentBed,
      submittedBy,
      additionalDoctorId,
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
          Price: med.total,
        })),
        test: test.map((tst) => ({
          Name: tst.name,
          Quantity: tst.quantity,
          Price: tst.total,
        })),
        EmergencyPatientData,
        isPatientsChecked,
        doctorId,
        VisitDateTime,
        mainId,
        emergencyPatientCurrentBed,
        submittedBy,
        additionalDoctorId,
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
Router.get("/get-one-emergency-patients-data/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const EmergencyPatientData = await EmergencyPatientsCheck.aggregate([
      {
        $match: {
          mainId: Id,
        },
      },
      {
        $lookup: {
          from: "emergencypatients",
          localField: "mainId",
          foreignField: "mainId",
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
        $unwind: "$patientsData",
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
        $lookup: {
          from: "doctors",
          localField: "additionalDoctorId",
          foreignField: "_id",
          as: "additionalDoctorData",
        },
      },

      {
        $project: {
          _id: 1,
          Symptoms: 1,
          Note: 1,
          VisitDateTime: 1,
          isPatientsChecked: 1,
          medicine: 1,
          test: 1,
          EmergencyPatientData: 1,
          patientsData: 1,
          doctorData: 1,
          additionalDoctorData: 1,
          ReferedDoctor: 1,
          submittedBy: 1,
        },
      },
    ]);
    if (!EmergencyPatientData) {
      return res.status(403).json({ message: "No Patients Data Find " });
    }
    return res
      .status(200)
      .json({ message: "Successfully Data Fetch", data: EmergencyPatientData });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
Router.get("/get-one-emergency-patients-data-total/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const EmergencyPatientData = await EmergencyPatientsCheck.aggregate([
      {
        $match: {
          mainId: Id,
        },
      },
      {
        $lookup: {
          from: "managebeds",
          localField: "emergencyPatientCurrentBed",
          foreignField: "bedId",
          as: "bedDetails",
        },
      },
      {
        $unwind: {
          path: "$bedDetails",
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
        $unwind: "$doctorData",
      },
      {
        $lookup: {
          from: "doctors",
          localField: "additionalDoctorId",
          foreignField: "_id",
          as: "additionalDoctorData",
        },
      },

      {
        $lookup: {
          from: "doctorprofessionaldetails",
          localField: "doctorData.doctorId",
          foreignField: "doctorId",
          as: "doctorFeesDatails",
        },
      },

      {
        $lookup: {
          from: "doctorprofessionaldetails",
          localField: "additionalDoctorData.doctorId",
          foreignField: "doctorId",
          as: "additionaldoctorFeesDatails",
        },
      },

      {
        $project: {
          _id: 1,
          VisitDateTime: 1,
          doctorData: 1,
          submittedBy: 1,
          DailyMedicinePriceTotal: { $sum: "$medicine.Price" },
          DailyTestPriceTotal: { $sum: "$test.Price" },
          doctorFeesDatail: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "SEMI-PRIVATE",
                    ],
                  },
                  then: "$doctorFeesDatails.doctorSemiPrivateFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "EMERGENCY",
                    ],
                  },
                  then: "$doctorFeesDatails.doctorEmergencyFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "GENERAL HIGH",
                    ],
                  },
                  then: "$doctorFeesDatails.doctorGereralHighFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "GENERAL JANATA",
                    ],
                  },
                  then: "$doctorFeesDatails.doctorGereralJanataFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "PRIVATE SUITE",
                    ],
                  },
                  then: "$doctorFeesDatails.doctorPrivateSuiteFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "PRIVATE SINGLE-AC-DLX",
                    ],
                  },
                  then: "$doctorFeesDatails.doctorPrivateSingleAcDlxFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "PRIVATE SINGLE-AC",
                    ],
                  },
                  then: "$doctorFeesDatails.doctorPrivateSingleAcFee",
                },
              ],
              default: 0,
            },
          },
          additionalDoctorFees: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "SEMI-PRIVATE",
                    ],
                  },
                  then: "$additionaldoctorFeesDatails.doctorSemiPrivateFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "EMERGENCY",
                    ],
                  },
                  then: "$additionaldoctorFeesDatails.doctorEmergencyFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "GENERAL HIGH",
                    ],
                  },
                  then: "$additionaldoctorFeesDatails.doctorGereralHighFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "GENERAL JANATA",
                    ],
                  },
                  then: "$additionaldoctorFeesDatails.doctorGereralJanataFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "PRIVATE SUITE",
                    ],
                  },
                  then: "$additionaldoctorFeesDatails.doctorPrivateSuiteFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "PRIVATE SINGLE-AC-DLX",
                    ],
                  },
                  then: "$additionaldoctorFeesDatails.doctorPrivateSingleAcDlxFee",
                },
                {
                  case: {
                    $eq: [
                      {
                        $concat: [
                          "$bedDetails.bedType",
                          "",
                          "$bedDetails.bedSubType",
                        ],
                      },
                      "PRIVATE SINGLE-AC",
                    ],
                  },
                  then: "$additionaldoctorFeesDatails.doctorPrivateSingleAcFee",
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          DailyMedicinePriceTotal: { $first: "$DailyMedicinePriceTotal" },
          DailyTestPriceTotal: { $first: "$DailyTestPriceTotal" },
          visitDate: { $first: "$VisitDateTime" },
          submittedBy: { $first: "$submittedBy" },
          doctorFeesDatail: { $first: "$doctorFeesDatail" },
          additionalDoctorFeesDatail: {
            $first: "$additionalDoctorFees",
          },
        },
      },
      {
        $project: {
          _id: 0,
          DailyMedicinePriceTotal: 1,
          DailyTestPriceTotal: 1,
          visitDate: 1,
          submittedBy: 1,
          doctorFeesDatails: {
            $cond: {
              if: { $eq: ["$submittedBy", "Additional Doctor"] },
              then: {
                $arrayElemAt: ["$additionalDoctorFeesDatail", 0],
              },
              else: {
                $arrayElemAt: ["$doctorFeesDatail", 0],
              },
            },
          },
        },
      },

      {
        $group: {
          _id: null,
          overAllData: { $push: "$$ROOT" },
          overallTotalMedicinePrice: { $sum: "$DailyMedicinePriceTotal" },
          overallTotalTestPrice: { $sum: "$DailyTestPriceTotal" },
          overallDoctorVisitCharge: { $sum: "$doctorFeesDatails" },
        },
      },
      {
        $project: {
          _id: 0,
          overAllData: 1,
          overallTotalMedicinePrice: 1,
          overallTotalTestPrice: 1,
          overallDoctorVisitCharge: 1,
        },
      },
    ]);
    if (!EmergencyPatientData) {
      return res.status(403).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Successfully Data Fetch", data: EmergencyPatientData });
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error");
  }
});
Router.get(
  "/get-emergency-discharge-patients-request-list",
  async (req, res) => {
    try {
      const EmergencyPatientDischargeList = await EmergencyPatientModel.find({
        $and: [
          { emergencyPatientNurseRequestForDischarge: true },
          { emergencyPatientDoctorRequestForDischarge: true },
          { emergencyPatientDischarged: false },
        ],
      });
      if (!EmergencyPatientDischargeList) {
        return res.status(403).json({ message: "No Data Found" });
      }
      return res.status(200).json({
        message: "Successfully Data Fetch",
        data: EmergencyPatientDischargeList,
      });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);
Router.get(
  "/get-emergency-discharge-patients-request-list-nurse/:nurseId",
  async (req, res) => {
    const Id = req.params.nurseId;
    try {
      const EmergencyPatientDischargeList =
        await EmergencyPatientModel.aggregate([
          {
            $match: {
              $and: [
                { nurseId: Id },
                { emergencyPatientNurseRequestForDischarge: true },
                { emergencyPatientDoctorRequestForDischarge: true },
                { emergencyPatientDischarged: false },
              ],
            },
          },
          {
            $lookup: {
              from: "patients",
              localField: "patientId",
              foreignField: "patientId",
              as: "patientData",
            },
          },
          {
            $unwind: {
              path: "$patientData",
            },
          },
          {
            $project: {
              _id: 1,
              mainId: 1,
              patientId: 1,
              doctorId: 1,
              nurseId: 1,
              bedId: 1,
              notes: 1,
              emergencyDepositAmount: 1,
              emergencyFloorNo: 1,
              emergencyPatientNurseRequestForDischarge: 1,
              emergencyPatientDoctorRequestForDischarge: 1,
              emergencyPatientNurseConfirmation: 1,
              emergencyPatientDoctorConfirmation: 1,
              emergencyPatientDischarged: 1,
              isDeleted: 1,
              createdAt: 1,
              updatedAt: 1,
              patientName: "$patientData.patientName",
              patientPhone: "$patientData.patientPhone",
              patientPhone2: "$patientData.patientPhone2",
              patientUhid: "$patientData.patientId",
            },
          },
        ]);
      if (!EmergencyPatientDischargeList) {
        return res.status(403).json({ message: "No Data Found" });
      }
      return res.status(200).json({
        message: "Successfully Data Fetch",
        data: EmergencyPatientDischargeList,
      });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);
Router.get(
  "/get-emergency-discharge-patients-request-list-doctor/:doctorId",
  async (req, res) => {
    const Id = req.params.doctorId;
    try {
      const EmergencyPatientDischargeList =
        await EmergencyPatientModel.aggregate([
          {
            $match: {
              $and: [
                { doctorId: Id },
                { emergencyPatientNurseRequestForDischarge: true },
                { emergencyPatientDoctorRequestForDischarge: true },
                { emergencyPatientDischarged: false },
              ],
            },
          },
          {
            $lookup: {
              from: "patients",
              localField: "patientId",
              foreignField: "patientId",
              as: "patientData",
            },
          },
          {
            $unwind: {
              path: "$patientData",
            },
          },
          {
            $project: {
              _id: 1,
              mainId: 1,
              patientId: 1,
              doctorId: 1,
              nurseId: 1,
              bedId: 1,
              notes: 1,
              emergencyDepositAmount: 1,
              emergencyFloorNo: 1,
              emergencyPatientNurseRequestForDischarge: 1,
              emergencyPatientDoctorRequestForDischarge: 1,
              emergencyPatientNurseConfirmation: 1,
              emergencyPatientDoctorConfirmation: 1,
              emergencyPatientDischarged: 1,
              isDeleted: 1,
              createdAt: 1,
              updatedAt: 1,
              PatientName: "$patientData.patientName",
              patientPhone: "$patientData.patientPhone",
              patientPhone2: "$patientData.patientPhone2",
              patientUhid: "$patientData.patientId",
            },
          },
        ]);
      if (!EmergencyPatientDischargeList) {
        return res.status(403).json({ message: "No Data Found" });
      }
      return res.status(200).json({
        message: "Successfully Data Fetch",
        data: EmergencyPatientDischargeList,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("internal server error");
    }
  }
);
Router.get(
  "/check-emergency-patients-doctor-visit-data/:patientMainId",
  async (req, res) => {
    const Id = req.params.patientMainId;
    try {
      const emergencyPatientsData = await EmergencyPatientsCheck.aggregate([
        {
          $match: {
            mainId: Id,
          },
        },
        {
          $project: {
            _id: 1,
            medicine: 1,
            test: 1,
            Symptoms: 1,
            Note: 1,
            EmergencyPatientData: 1,
            isPatientsChecked: 1,
            mainId: 1,
            doctorId: 1,
            additionalDoctorId: 1,
            emergencyPatientCurrentBed: 1,
            VisitDateTime: 1,
            discharge: 1,
            submittedBy: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      const patientDetails = await EmergencyPatientModel.aggregate([
        {
          $match: {
            mainId: Id,
          },
        },

        {
          $lookup: {
            from: "patients",
            localField: "patientId",
            foreignField: "patientId",
            as: "patientData",
          },
        },
        {
          $unwind: "$patientData",
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "doctorId",
            as: "doctorData",
          },
        },
        {
          $unwind: "$doctorData",
        },
      ]);
      if (!emergencyPatientsData) {
        return res.status(403).json({ message: "No Data Found" });
      }
      if (emergencyPatientsData?.length === 0) {
        return res.status(201).json({
          message: "No Doctor Visit done Yet",
          patientPersonalData: patientDetails,
        });
      }
      return res.status(200).json({
        message: "Data Fetch Successfully",
        data: emergencyPatientsData,
        patientPersonalData: patientDetails,
      });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);
Router.get(
  "/get-Emergency-patient-lab-test-record/:emergencyPatientId",
  async (req, res) => {
    const Id = req.params.emergencyPatientId;
    try {
      const labTestData = await EmergencyPatientsCheck.aggregate([
        {
          $match: {
            mainId: Id,
          },
        },
        {
          $unwind: "$test",
        },
        {
          $match: {
            test: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            tests: { $push: "$test.Name" },
          },
        },
        {
          $project: {
            _id: 0,
            tests: 1,
          },
        },
      ]);
      const nurseName = await EmergencyPatientsCheck.aggregate([
        {
          $match: {
            mainId: Id,
          },
        },
        {
          $lookup: {
            from: "emergencypatients",
            localField: "mainId",
            foreignField: "mainId",
            as: "emgPatientDetails",
          },
        },
        {
          $unwind: {
            path: "$emgPatientDetails",
          },
        },
        {
          $lookup: {
            from: "nurses",
            localField: "emgPatientDetails.nurseId",
            foreignField: "nurseId",
            as: "nurseData",
          },
        },
        {
          $unwind: {
            path: "$nurseData",
          },
        },
        {
          $project: {
            nurseData: "$nurseData.nurseName",
          },
        },
      ]);
      if (!labTestData) {
        return res
          .status(404)
          .json({ message: "No Data Found", data: [], nurse: nurseName?.[0] });
      }
      return res.status(200).json({
        message: "Data Fetch Successfully",
        data: labTestData,
        nurse: nurseName?.[0],
      });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);

module.exports = Router;
