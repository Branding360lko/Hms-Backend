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
  const {
    emergencyPatientId = "",
    patientName = "",
    page = 1,
    limit = 10,
  } = req.query;
  try {
    const skip = (Number(page) - 1) * Number(limit);

    // const EmergencyPatientData = await EmergencyPatientModel.find();

    const EmergencyPatientData = await EmergencyPatientModel.aggregate([
      {
        $sort: { _id: -1 },
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
        $lookup: {
          from: "doctor",
          localField: "doctorId",
          foreignField: "doctorId",
          as: "doctorData",
        },
      },
      {
        $unwind: { path: "$patientData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$doctorData", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          patientName: "$patientData.patientName",
        },
      },
      {
        $match: { patientId: { $regex: emergencyPatientId, $options: "i" } },
      },
      {
        $match: { patientName: { $regex: patientName, $options: "i" } },
      },
      {
        $skip: skip,
      },
      {
        $limit: Number(limit),
      },
    ]);

    let totalEmergencyPatient = 0;
    if (emergencyPatientId !== "") {
      totalEmergencyPatient = await EmergencyPatientModel.countDocuments({
        patientId: { $regex: emergencyPatientId, $options: "i" },
      });
    } else if (patientName !== "") {
      const totalEmergencyPatientCounts = await EmergencyPatientModel.aggregate(
        [
          {
            $lookup: {
              from: "patients",
              localField: "patientId",
              foreignField: "patientId",
              as: "patientData",
            },
          },
          {
            $unwind: { path: "$patientData", preserveNullAndEmptyArrays: true },
          },
          {
            $addFields: {
              patientName: "$patientData.patientName",
            },
          },
          {
            $match: { patientName: { $regex: patientName, $options: "i" } },
          },
          {
            $count: "patientName",
          },
        ]
      );
      totalEmergencyPatient = totalEmergencyPatientCounts[0].patientName;
    }

    res.status(200).json({
      EmergencyPatientData,
      totalEmergencyPatient,
      totalPages: Math.ceil(Number(totalEmergencyPatient) / Number(limit)),
      currentPage: Number(page),
    });
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

Router.get("/EmergencyPatient-Balance-GET-ALL", async (req, res) => {
  const {
    ipdPatientId = "",
    patientName = "",
    page = 1,
    limit = 10,
  } = req.query;
  try {
    const skip = (Number(page) - 1) * Number(limit);

    const remainingBalanceCalc = await EmergencyPatientModel.aggregate([
      {
        $lookup: {
          from: "emergencypatientschecks",
          localField: "mainId",
          foreignField: "mainId",
          as: "EmergencyPatientMEDDOCLABData",
        },
      },
      {
        $unwind: {
          path: "$EmergencyPatientMEDDOCLABData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "managebeds",
          localField:
            "EmergencyPatientMEDDOCLABData.emergencyPatientCurrentBed",
          foreignField: "bedId",
          as: "bedDetails",
        },
      },
      {
        $unwind: {
          path: "$bedDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "EmergencyPatientMEDDOCLABData.doctorId",
          foreignField: "_id",
          as: "doctorData",
        },
      },
      // {
      //   $lookup: {
      //     from: "doctors",
      //     localField: "EmergencyPatientMEDDOCLABData.ReferedDoctorId",
      //     foreignField: "_id",
      //     as: "ReferedDoctor",
      //   },
      // },
      {
        $lookup: {
          from: "doctorprofessionaldetails",
          localField: "doctorData.doctorId",
          foreignField: "doctorId",
          as: "doctorFeesDatails",
        },
      },
      // {
      //   $lookup: {
      //     from: "doctorprofessionaldetails",
      //     localField: "ReferedDoctor.doctorId",
      //     foreignField: "doctorId",
      //     as: "RefereddoctorFeesDatails",
      //   },
      // },
      // {
      //   $addFields: {
      //     doctorFees: {
      //       $cond: {
      //         if: { $eq: [{ $size: "$doctorFeesDatails" }, 0] },
      //         then: 0,
      //         else: { $arrayElemAt: ["$doctorFeesDatails.doctorFee", 0] },
      //       },
      //     },
      //     // RefereddoctorFees: {
      //     //   $cond: {
      //     //     if: { $eq: [{ $size: "$RefereddoctorFeesDatails" }, 0] },
      //     //     then: 0,
      //     //     else: {
      //     //       $arrayElemAt: ["$RefereddoctorFeesDatails.doctorFee", 0],
      //     //     },
      //     //   },
      //     // },
      //   },
      // },
      {
        $project: {
          _id: "$mainId",
          bedId: 1,
          emergencyPatientDischarged: 1,
          createdAt: 1,
          emergencyPatientId:
            "$EmergencyPatientMEDDOCLABData.emergencyPatientData",
          VisitDateTime: "$EmergencyPatientMEDDOCLABData.VisitDateTime",
          submittedBy: "$IPDPatientMEDDOCLABData.submittedBy",
          doctorData: 1,
          // ReferedDoctor: 1,
          // doctorFees: "$doctorFees",
          // RefereddoctorFees: "$RefereddoctorFees",
          DailyMedicinePriceTotal: {
            $sum: "$EmergencyPatientMEDDOCLABData.medicine.Price",
          },
          DailyTestPriceTotal: {
            $sum: "$EmergencyPatientMEDDOCLABData.test.Price",
          },
          DailyDoctorVisitChargeBasedOnBed: {
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
        },
      },
      {
        $group: {
          _id: "$_id",
          emergencyBedNo: { $first: "$bedId" },
          emergencyPatientDischarged: { $first: "$emergencyPatientDischarged" },
          creationDate: { $first: "$createdAt" },
          visitDate: { $first: "$VisitDateTime" },
          submittedBy: { $first: "$submittedBy" },
          totalDoctorFees: { $sum: "$doctorFees" },
          // totalRefereddoctorFees: { $sum: "$RefereddoctorFees" },
          totalDailyMedicinePriceTotal: { $sum: "$DailyMedicinePriceTotal" },
          totalDailyTestPriceTotal: { $sum: "$DailyTestPriceTotal" },
          DailyDoctorVisitChargeBasedOnBed: {
            $first: "$DailyDoctorVisitChargeBasedOnBed",
          },
        },
      },
      {
        $project: {
          _id: 1,
          emergencyBedNo: 1,
          emergencyPatientDischarged: 1,
          creationDate: 1,
          totalDailyMedicinePriceTotal: 1,
          totalDailyTestPriceTotal: 1,
          visitDate: 1,
          // totalDoctorFees: 1,
          // totalRefereddoctorFees: 1,
          DailyDoctorVisitChargeBasedOnBed: 1,
          doctorVisitCharge: {
            $cond: {
              if: {
                $or: {
                  $eq: ["$DailyDoctorVisitChargeBasedOnBed", 0],
                  // $eq: ["$DailyReferDoctorVisitChargeBasedOnBed", 0],
                  // $eq: ["$DailyAdditionalDoctorVisitChargeBasedOnBed", 0],
                },
              },
              then: 0,
              else: { $arrayElemAt: ["$DailyDoctorVisitChargeBasedOnBed", 0] },
            },
          },
        },
      },
      {
        $addFields: {
          overallDoctorVisitCharge: { $sum: "$doctorVisitCharge" },
        },
      },
      {
        $lookup: {
          from: "emergencypatientbalances",
          localField: "_id",
          foreignField: "emergencyPatientRegId",
          as: "emergencyPatientBalanceData",
        },
      },
      {
        $unwind: {
          path: "$emergencyPatientBalanceData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          emergencyBedNo: { $first: "$emergencyBedNo" },
          emergencyPatientDischarged: { $first: "$emergencyPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$emergencyPatientBalanceData.balanceID" },
          uhid: { $first: "$emergencyPatientBalanceData.uhid" },
          emergencyPatientRegId: {
            $first: "$emergencyPatientBalanceData.emergencyPatientRegId",
          },
          // totalBalance: { $sum: "$balance.totalBalance" },
          balance: { $first: "$emergencyPatientBalanceData.balance" },
          // totalAddedBalance: { $first: "$balance.addedBalance" },
          charges: { $first: "$emergencyPatientBalanceData.charges" },
          labTestCharges: {
            $first: "$emergencyPatientBalanceData.labTestCharges",
          },
          overallTotalMedicinePrice: {
            $first: "$totalDailyMedicinePriceTotal",
          },
          overallTotalTestPrice: { $first: "$totalDailyTestPriceTotal" },
          overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
        },
      },
      { $unwind: { path: "$balance", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          emergencyBedNo: { $first: "$emergencyBedNo" },
          emergencyPatientDischarged: { $first: "$emergencyPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          emergencyPatientRegId: { $first: "$emergencyPatientRegId" },
          // totalBalance: { $sum: "$balance.totalBalance" },
          totalAddedBalance: { $sum: "$balance.addedBalance" },
          charges: { $first: "$charges" },
          labTestCharges: { $first: "$labTestCharges" },
          overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
          overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
          overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
        },
      },
      {
        $unwind: {
          path: "$charges",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$charges.items",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          emergencyBedNo: { $first: "$emergencyBedNo" },
          emergencyPatientDischarged: { $first: "$emergencyPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
          overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
          overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
          emergencyPatientRegId: { $first: "$emergencyPatientRegId" },
          labTestCharges: { $first: "$labTestCharges" },
          // totalBalance: { $first: "$totalBalance" },
          totalAddedBalance: { $first: "$totalAddedBalance" },
          totalCharges: {
            $sum: {
              $multiply: ["$charges.items.quantity", "$charges.items.price"],
            },
          },
        },
      },
      {
        $unwind: {
          path: "$labTestCharges",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$labTestCharges.items",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          emergencyBedNo: { $first: "$emergencyBedNo" },
          emergencyPatientDischarged: { $first: "$emergencyPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          emergencyPatientRegId: { $first: "$emergencyPatientRegId" },
          // labTestCharges: { $first: "$labTestCharges" },
          // totalBalance: { $first: "$totalBalance" },
          overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
          overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
          overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
          totalAddedBalance: { $first: "$totalAddedBalance" },
          totalCharges: { $first: "$totalCharges" },
          totalLabTestCharges: {
            $sum: {
              $multiply: [
                "$labTestCharges.items.quantity",
                "$labTestCharges.items.price",
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "managebeds",
          localField: "emergencyBedNo", // Adjust this field as needed
          foreignField: "bedId", // Adjust this field as needed
          as: "BedData",
        },
      },
      {
        $unwind: { path: "$BedData", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id",
          emergencyBedNo: { $first: "$emergencyBedNo" },
          emergencyPatientDischarged: { $first: "$emergencyPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          emergencyPatientObjectId: { $first: "$_id" },
          emergencyPatientRegId: { $first: "$emergencyPatientRegId" },
          totalAddedBalance: { $first: "$totalAddedBalance" },
          totalCharges: { $first: "$totalCharges" },
          totalLabTestCharges: { $first: "$totalLabTestCharges" },
          overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
          overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
          overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
          creationDate: { $first: "$creationDate" },
          beddata: { $first: "$BedData" },
        },
      },
      {
        $lookup: {
          from: "emergencypatientdischargereciepts",
          localField: "_id", // Adjust this field as needed
          foreignField: "emergencyPatientRegId", // Adjust this field as needed
          as: "dischargeData",
        },
      },
      {
        $unwind: { path: "$dischargeData", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          days: {
            $cond: {
              if: { $eq: ["$emergencyPatientDischarged", true] },
              then: {
                // days: "$dischargeData.dateAndTimeOfDischarge",
                $dateDiff: {
                  startDate: "$creationDate",
                  endDate: "$dischargeData.dateAndTimeOfDischarge",
                  unit: "day",
                },
              },
              else: {
                $dateDiff: {
                  startDate: "$creationDate",
                  endDate: "$$NOW",
                  unit: "day",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          balanceID: 1,
          uhid: 1,
          emergencyPatientObjectId: 1,
          emergencyPatientRegId: 1,
          totalAddedBalance: 1,
          totalCharges: 1,
          totalLabTestCharges: 1,
          overallTotalMedicinePrice: 1,
          overallTotalTestPrice: 1,
          overallDoctorVisitCharge: 1,
          creationDate: 1,
          beddata: 1,
          days: { $add: ["$days", 1] },
        },
      },
      {
        $project: {
          balanceID: 1,
          uhid: 1,
          emergencyPatientObjectId: 1,
          emergencyPatientRegId: 1,
          totalAddedBalance: 1,
          totalCharges: 1,
          totalLabTestCharges: 1,
          overallTotalMedicinePrice: 1,
          overallTotalTestPrice: 1,
          overallDoctorVisitCharge: 1,
          creationDate: 1,
          // beddata: 1,
          days: 1,
          bedCharges: { $multiply: ["$days", "$beddata.bedCharges"] },
          nursingCharges: { $multiply: ["$days", "$beddata.nursingCharges"] },
          EMOCharges: { $multiply: ["$days", "$beddata.EMOCharges"] },
          bioWasteCharges: { $multiply: ["$days", "$beddata.bioWasteCharges"] },
          sanitizationCharges: {
            $multiply: ["$days", "$beddata.sanitizationCharges"],
          },
        },
      },
      {
        $addFields: {
          autoChargesTotal: {
            $add: [
              "$bedCharges",
              "$nursingCharges",
              "$EMOCharges",
              "$bioWasteCharges",
              "$sanitizationCharges",
            ],
          },
          finalTotal: {
            $add: [
              "$totalCharges",
              "$totalLabTestCharges",
              "$bedCharges",
              "$nursingCharges",
              "$EMOCharges",
              "$bioWasteCharges",
              "$sanitizationCharges",
              "$overallTotalMedicinePrice",
              "$overallTotalTestPrice",
              "$overallDoctorVisitCharge",
            ],
          },
          remainingBalance: {
            $subtract: [
              "$totalAddedBalance",
              {
                $add: [
                  "$totalCharges",
                  "$totalLabTestCharges",
                  "$bedCharges",
                  "$nursingCharges",
                  "$EMOCharges",
                  "$bioWasteCharges",
                  "$sanitizationCharges",
                  "$overallTotalMedicinePrice",
                  "$overallTotalTestPrice",
                  "$overallDoctorVisitCharge",
                ],
              },
            ],
          },
        },
      },
    ]);

    return res.status(200).json({
      balanceCalculation: remainingBalanceCalc,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/EmergencyPatient-Balance-GET/:Id", async (req, res) => {
  const id = req.params.Id;
  try {
    const EmergencyPatientBalance = await EmergencyPatientBalanceModel.findOne({
      emergencyPatientRegId: id,
    });

    if (!EmergencyPatientBalance) {
      return res.status(404).json("Emergency Patient Balance Data Not Found");
    }

    let totalMedicalCharges = 0;
    let totalLabTestCharges = 0;

    if (EmergencyPatientBalance) {
      await EmergencyPatientBalanceModel.aggregate([
        {
          $match: {
            emergencyPatientRegId:
              EmergencyPatientBalance.emergencyPatientRegId,
          },
        },
        { $unwind: "$charges" },
        {
          $group: {
            _id: "$charges._id",
            totalItems: { $push: "$charges.items" },
          },
        },

        { $unwind: "$totalItems" },
        { $unwind: "$totalItems" },
        {
          $group: {
            _id: "$_id",
            totalItemsPrice: {
              $sum: {
                $multiply: ["$totalItems.price", "$totalItems.quantity"],
              },
            },
          },
        },
      ])
        .then((res) => {
          // console.log(res);
          const newRes = res?.reduce((acc, currentValue) => {
            return currentValue.totalItemsPrice + acc;
          }, 0);
          totalMedicalCharges = newRes;
        })
        .catch((err) => {
          console.log(err);
        });

      await EmergencyPatientBalanceModel.aggregate([
        {
          $match: {
            emergencyPatientRegId:
              EmergencyPatientBalance.emergencyPatientRegId,
          },
        },
        { $unwind: "$labTestCharges" },
        {
          $group: {
            _id: "$labTestCharges._id",
            totalItems: { $push: "$labTestCharges.items" },
          },
        },

        { $unwind: "$totalItems" },
        { $unwind: "$totalItems" },
        {
          $group: {
            _id: "$_id",
            totalItemsPrice: {
              $sum: {
                $multiply: ["$totalItems.price", "$totalItems.quantity"],
              },
            },
          },
        },
      ])
        .then((res) => {
          const newRes = res?.reduce((acc, currentValue) => {
            return currentValue.totalItemsPrice + acc;
          }, 0);
          totalLabTestCharges = newRes;
        })
        .catch((err) => {
          console.log(err);
        });

      // const autoChargeCalculation = await EmergencyPatientModel.aggregate([
      //   {
      //     $match: { mainId: EmergencyPatientBalance.emergencyPatientRegId },
      //   },
      //   {
      //     $lookup: {
      //       from: "managebeds",
      //       localField: "bedId",
      //       foreignField: "bedId",
      //       as: "bedData",
      //     },
      //   },
      //   {
      //     $unwind: { path: "$bedData", preserveNullAndEmptyArrays: true },
      //   },
      //   {
      //     $lookup: {
      //       from: "emergencypatientdischargereciepts",
      //       localField: "mainId",
      //       foreignField: "emergencyPatientRegId",
      //       as: "dischargeData",
      //     },
      //   },
      //   {
      //     $unwind: { path: "$dischargeData", preserveNullAndEmptyArrays: true },
      //   },
      //   {
      //     $addFields: {
      //       days: {
      //         $cond: {
      //           if: { $eq: ["$emergencyPatientDischarged", true] },
      //           then: {
      //             $dateDiff: {
      //               startDate: "$createdAt",
      //               endDate: "$dischargeData.dateAndTimeOfDischarge",
      //               unit: "day",
      //             },
      //           },
      //           else: {
      //             $dateDiff: {
      //               startDate: "$createdAt",
      //               endDate: "$$NOW",
      //               unit: "day",
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $project: {
      //       bedData: 1,
      //       days: { $add: ["$days", 1] },
      //     },
      //   },
      //   {
      //     $project: {
      //       bedData: 1,
      //       days: 1,
      //       bedTotalCharges: { $multiply: ["$days", "$bedData.bedCharges"] },
      //       nursingTotalCharges: {
      //         $multiply: ["$days", "$bedData.nursingCharges"],
      //       },
      //       EMOTotalCharges: { $multiply: ["$days", "$bedData.EMOCharges"] },
      //       bioWasteTotalCharges: {
      //         $multiply: ["$days", "$bedData.bioWasteCharges"],
      //       },
      //       sanitizationTotalCharges: {
      //         $multiply: ["$days", "$bedData.sanitizationCharges"],
      //       },
      //     },
      //   },
      // ]);

      const autoChargeCalculation = await EmergencyPatientModel.aggregate([
        {
          $match: { mainId: EmergencyPatientBalance.emergencyPatientRegId },
        },
        {
          $lookup: {
            from: "managebeds",
            localField: "bedId",
            foreignField: "bedId",
            as: "bedData",
          },
        },
        {
          $unwind: { path: "$bedData", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "emergencypatientbalances",
            localField: "bedId",
            foreignField: "currentBed",
            as: "emergencyPatientBalancesData",
          },
        },
        {
          $unwind: {
            path: "$emergencyPatientBalancesData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            allBeds: "$emergencyPatientBalancesData.beds",
          },
        },
        {
          $addFields: {
            singleBedData: { $last: "$allBeds" },
          },
        },
        {
          $addFields: {
            bedCharges: "$emergencyPatientBalancesData.bedCharges",
          },
        },
        {
          $lookup: {
            from: "emergencypatientdischargereciepts",
            localField: "mainId",
            foreignField: "emergencyPatientRegId",
            as: "dischargeData",
          },
        },
        {
          $unwind: { path: "$dischargeData", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            days: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $cond: {
                        if: { $eq: ["$emergencyPatientDischarged", true] },
                        then: {
                          // days: "$dischargeData.dateAndTimeOfDischarge",
                          $dateDiff: {
                            startDate: "$createdAt",
                            endDate: "$dischargeData.dateAndTimeOfDischarge",
                            unit: "day",
                          },
                        },
                        else: {
                          $dateDiff: {
                            startDate: "$createdAt",
                            endDate: "$$NOW",
                            unit: "day",
                          },
                        },
                      },
                    },
                  },
                  {
                    case: { $gt: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $cond: {
                        if: { $eq: ["$emergencyPatientDischarged", true] },
                        then: {
                          // days: "$dischargeData.dateAndTimeOfDischarge",
                          $dateDiff: {
                            startDate: "$singleBedData.createdAt",
                            endDate: "$dischargeData.dateAndTimeOfDischarge",
                            unit: "day",
                          },
                        },
                        else: {
                          $dateDiff: {
                            startDate: "$singleBedData.createdAt",
                            endDate: "$$NOW",
                            unit: "day",
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        {
          $project: {
            bedData: 1,
            // beddata: 1,
            bedCharges: 1,
            allBeds: 1,
            singleBedData: 1,
            emergencyPatientDischarged: 1,
            createdAt: 1,
            dischargeData: 1,
            days: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $size: "$allBeds" }, 1] },
                    then: { $add: ["$days", 1] },
                  },
                  {
                    case: { $gt: [{ $size: "$allBeds" }, 1] },
                    then: "$days",
                  },
                ],
              },
            },
            // bedTotalCharges: { $multiply: ["$days", "$bedData.bedCharges"] },
            // nursingTotalCharges: {
            //   $multiply: ["$days", "$bedData.nursingCharges"],
            // },
            // EMOTotalCharges: { $multiply: ["$days", "$bedData.EMOCharges"] },
            // bioWasteTotalCharges: {
            //   $multiply: ["$days", "$bedData.bioWasteCharges"],
            // },
            // sanitizationTotalCharges: {
            //   $multiply: ["$days", "$bedData.sanitizationCharges"],
            // },
          },
        },
        {
          $project: {
            bedData: 1,
            // beddata: 1,
            bedCharges: 1,
            singleBedData: 1,
            days: 1,
            totalDays: {
              $add: [
                {
                  $cond: {
                    if: { $eq: ["$emergencyPatientDischarged", true] },
                    then: {
                      // days: "$dischargeData.dateAndTimeOfDischarge",
                      $dateDiff: {
                        startDate: "$createdAt",
                        endDate: "$dischargeData.dateAndTimeOfDischarge",
                        unit: "day",
                      },
                    },
                    else: {
                      $dateDiff: {
                        startDate: "$createdAt",
                        endDate: "$$NOW",
                        unit: "day",
                      },
                    },
                  },
                },
                1,
              ],
            },
            bedTotalCharges: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $multiply: ["$days", "$bedData.bedCharges"],
                    },
                  },
                  {
                    case: { $gt: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $sum: "$bedCharges.totalBedCharges",
                    },
                  },
                ],
              },
            },
            nursingTotalCharges: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $multiply: ["$days", "$bedData.nursingCharges"],
                    },
                  },
                  {
                    case: { $gt: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $sum: "$bedCharges.totalNursingCharges",
                    },
                  },
                ],
              },
            },
            EMOTotalCharges: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $multiply: ["$days", "$bedData.EMOCharges"],
                    },
                  },
                  {
                    case: { $gt: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $sum: "$bedCharges.totalEMOCharges",
                    },
                  },
                ],
              },
            },
            bioWasteTotalCharges: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $multiply: ["$days", "$bedData.bioWasteCharges"],
                    },
                  },
                  {
                    case: { $gt: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $sum: "$bedCharges.totalBioWasteCharges",
                    },
                  },
                ],
              },
            },
            sanitizationTotalCharges: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $multiply: ["$days", "$bedData.sanitizationCharges"],
                    },
                  },
                  {
                    case: { $gt: [{ $size: "$allBeds" }, 1] },
                    then: {
                      $sum: "$bedCharges.totalSanitizationCharges",
                    },
                  },
                ],
              },
            },
            // bedTotalCharges: { $multiply: ["$days", "$bedData.bedCharges"] },
            // nursingTotalCharges: {
            //   $multiply: ["$days", "$bedData.nursingCharges"],
            // },
            // EMOTotalCharges: { $multiply: ["$days", "$bedData.EMOCharges"] },
            // bioWasteTotalCharges: {
            //   $multiply: ["$days", "$bedData.bioWasteCharges"],
            // },
            // sanitizationTotalCharges: {
            //   $multiply: ["$days", "$bedData.sanitizationCharges"],
            // },
          },
        },
      ]);
      return res.status(200).json({
        data: EmergencyPatientBalance,
        totalMedicalCharges: totalMedicalCharges,
        totalLabTestCharges: totalLabTestCharges,
        autoCharges: autoChargeCalculation,
      });
      // }
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
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
    emergencyFloorNo,
    balanceNote,
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
    emergencyFloorNo,
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
          // bedId: bedId ? bedId : EmergencyPatientModel.bedId,
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

Router.put(
  "/EmergencyPatient-PUT-ChangeBed/:emergencyPatientRegId",
  async (req, res) => {
    const id = req.params.emergencyPatientRegId;

    const { emergencyBedNo } = req.body;
    try {
      const emergencyPatient = await EmergencyPatientModel.findOne({
        mainId: id,
      });

      if (emergencyPatient) {
        if (emergencyPatient.bedId === emergencyBedNo) {
          return res.status(400).json({ error: "Bed Id Already Used" });
        }
        if (emergencyPatient.bedId !== emergencyBedNo) {
          const balanceCalculation = await ManageBedsModel.aggregate([
            {
              $match: { bedId: emergencyPatient.bedId },
            },
            {
              $lookup: {
                from: "emergencypatientbalances",
                localField: "bedId",
                foreignField: "currentBed",
                as: "emergencyPatientBalancesData",
              },
            },
            {
              $unwind: {
                path: "$emergencyPatientBalancesData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                bedId: 1,
                bedCharges: 1,
                nursingCharges: 1,
                EMOCharges: 1,
                bioWasteCharges: 1,
                sanitizationCharges: 1,
                beds: "$emergencyPatientBalancesData.beds",
              },
            },
            {
              $addFields: {
                bedData: { $last: "$beds" },
              },
            },
            {
              $addFields: {
                days: {
                  $dateDiff: {
                    startDate: "$bedData.createdAt",
                    endDate: "$$NOW",
                    unit: "day",
                  },
                },
              },
            },
            {
              $project: {
                bedId: 1,
                days: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $size: "$beds" }, 1] },
                        then: { $add: ["$days", 1] },
                      },
                      {
                        case: { $gt: [{ $size: "$beds" }, 1] },
                        then: "$days",
                      },
                    ],
                  },
                },
                totalBedCharges: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: ["$bedCharges", { $add: ["$days", 1] }],
                        },
                      },
                      {
                        case: { $gt: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: ["$bedCharges", "$days"],
                        },
                      },
                    ],
                  },
                },
                totalNursingCharges: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: [
                            "$nursingCharges",
                            { $add: ["$days", 1] },
                          ],
                        },
                      },
                      {
                        case: { $gt: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: ["$nursingCharges", "$days"],
                        },
                      },
                    ],
                  },
                },
                totalEMOCharges: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: ["$EMOCharges", { $add: ["$days", 1] }],
                        },
                      },
                      {
                        case: { $gt: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: ["$EMOCharges", "$days"],
                        },
                      },
                    ],
                  },
                },
                totalBioWasteCharges: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: [
                            "$bioWasteCharges",
                            { $add: ["$days", 1] },
                          ],
                        },
                      },
                      {
                        case: { $gt: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: ["$bioWasteCharges", "$days"],
                        },
                      },
                    ],
                  },
                },
                totalSanitizationCharges: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: [
                            "$sanitizationCharges",
                            { $add: ["$days", 1] },
                          ],
                        },
                      },
                      {
                        case: { $gt: [{ $size: "$beds" }, 1] },
                        then: {
                          $multiply: ["$sanitizationCharges", "$days"],
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              $addFields: {
                subTotal: {
                  $add: [
                    "$totalBedCharges",
                    "$totalNursingCharges",
                    "$totalEMOCharges",
                    "$totalBioWasteCharges",
                    "$totalSanitizationCharges",
                  ],
                },
              },
            },
          ]);
          if (balanceCalculation) {
            const bedChargesUpdate =
              await EmergencyPatientBalanceModel.findOneAndUpdate(
                {
                  emergencyPatientRegId: emergencyPatient.mainId,
                },
                {
                  $push: {
                    bedCharges: balanceCalculation[0],
                    beds: {
                      bedId: emergencyBedNo,
                    },
                  },
                  currentBed: emergencyBedNo,
                }
              );

            if (bedChargesUpdate) {
              const emergencyPatientData =
                await EmergencyPatientModel.findOneAndUpdate(
                  {
                    mainId: id,
                  },
                  {
                    bedId: emergencyBedNo,
                  }
                );

              if (emergencyPatientData) {
                const bedAvailabilityUpdateForOldBed =
                  await ManageBedsModel.findOneAndUpdate(
                    {
                      bedId: emergencyPatient.bedId,
                    },
                    { bedAvailableOrNot: true }
                  );
                if (bedAvailabilityUpdateForOldBed) {
                  const bedAvailabilityUpdateForNewBed =
                    await ManageBedsModel.findOneAndUpdate(
                      {
                        bedId: emergencyBedNo,
                      },
                      { bedAvailableOrNot: false }
                    );
                  if (bedAvailabilityUpdateForNewBed) {
                    return res
                      .status(200)
                      .json({ message: "Bed Changed Successfully" });
                  }
                }
              }
            }
          }
          // console.log(balanceCalculation);
        }
      }
    } catch (error) {
      // console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);

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

Router.put("/EmergencyPatient-PUT-AddItemCharges/:Id", async (req, res) => {
  const id = req.params.Id;

  const { items } = req.body;

  try {
    const EmergencyPatient = await EmergencyPatientModel.findOne({
      mainId: id,
    });

    if (!EmergencyPatient) {
      return res.status(404).json("Emergency Patient Data Not Found");
    }

    let total = 0;
    let newTotal = 0;

    await EmergencyPatientBalanceModel.aggregate([
      {
        $match: { emergencyPatientRegId: EmergencyPatient.mainId },
      },
      { $unwind: "$charges" },
      {
        $group: {
          _id: "$charges._id",
          totalItems: { $push: "$charges.items" },
        },
      },

      { $unwind: "$totalItems" },
      { $unwind: "$totalItems" },
      {
        $group: {
          _id: "$_id",
          totalItemsPrice: {
            $sum: {
              $multiply: ["$totalItems.price", "$totalItems.quantity"],
            },
          },
        },
      },
    ])
      .then((res) => {
        // console.log(res);
        const newRes = res?.reduce((acc, currentValue) => {
          return currentValue.totalItemsPrice + acc;
        }, 0);
        total = newRes;
      })
      .catch((err) => {
        console.log(err);
      });

    if (items) {
      const newTotalValue = items?.reduce((acc, currentValue) => {
        const itemPrice = currentValue.price * currentValue.quantity;
        return itemPrice + acc;
      }, 0);
      newTotal = newTotalValue;
    }

    // console.log(total, newTotal);

    if (EmergencyPatient) {
      const EmergencyPatientChargesData =
        await EmergencyPatientBalanceModel.findOneAndUpdate(
          { emergencyPatientRegId: EmergencyPatient.mainId },
          {
            $push: {
              charges: {
                _id: new mongoose.Types.ObjectId(),
                items: items,
                total: total + newTotal,
              },
            },
          }
        );

      if (!EmergencyPatientChargesData) {
        return res.status(400).json("Emergency Patient Data Not Found!");
      }

      return res
        .status(200)
        .json({ message: "Emergency Patient Charges Updated Successfully" });
    }
  } catch (error) {
    // console.log(error);

    res.status(500).json("Internal Server Error");
  }
});

Router.put("/EmergencyPatient-PUT-AddLabTestCharges/:Id", async (req, res) => {
  const id = req.params.Id;

  const { items } = req.body;

  try {
    const EmergencyPatient = await EmergencyPatientModel.findOne({
      mainId: id,
    });

    if (!EmergencyPatient) {
      return res.status(404).json("Emergency Patient Data Not Found");
    }

    let total = 0;
    let newTotal = 0;

    await EmergencyPatientBalanceModel.aggregate([
      {
        $match: { emergencyPatientRegId: EmergencyPatient.mainId },
      },
      { $unwind: "$labTestCharges" },
      {
        $group: {
          _id: "$labTestCharges._id",
          totalItems: { $push: "$labTestCharges.items" },
        },
      },

      { $unwind: "$totalItems" },
      { $unwind: "$totalItems" },
      {
        $group: {
          _id: "$_id",
          totalItemsPrice: {
            $sum: {
              $multiply: ["$totalItems.price", "$totalItems.quantity"],
            },
          },
        },
      },
    ])
      .then((res) => {
        // console.log(res);
        const newRes = res?.reduce((acc, currentValue) => {
          return currentValue.totalItemsPrice + acc;
        }, 0);
        total = newRes;
      })
      .catch((err) => {
        console.log(err);
      });

    if (items) {
      const newTotalValue = items?.reduce((acc, currentValue) => {
        const itemPrice = currentValue.price * currentValue.quantity;
        return itemPrice + acc;
      }, 0);
      newTotal = newTotalValue;
    }

    if (EmergencyPatient) {
      const EmergencyPatientChargesData =
        await EmergencyPatientBalanceModel.findOneAndUpdate(
          { emergencyPatientRegId: EmergencyPatientModel.mainId },
          {
            $push: {
              labTestCharges: {
                _id: new mongoose.Types.ObjectId(),
                items: items,
                total: total + newTotal,
              },
            },
          }
        );

      if (!EmergencyPatientChargesData) {
        return res.status(400).json("Emergency Patient Data Not Found!");
      }

      return res.status(200).json({
        message: "Emergency Patient Lab Test Charges Updated Successfully",
      });
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/EmergencyPatient-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const emergencyPatientData = await EmergencyPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!emergencyPatientData) {
      return res.status(404).json("Emergency Patient Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "Emergency Patient Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
