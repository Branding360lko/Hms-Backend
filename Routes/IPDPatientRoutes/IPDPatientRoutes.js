const express = require("express");

const Router = express.Router();

const mongoose = require("mongoose");

require("../../DB/connection");

const IPDPatientModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");
// const IPDPatientDischargeRecieptModel = require("../../Models/IPDPatientSchema/IPDPatientDischargeRecieptSchema");
// const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");
const IPDPatientBalanceModel = require("../../Models/IPDPatientSchema/IPDPatientBalanceSchema");

const IPDDoctorDischargeDetailsModel = require("../../Models/IPDPatientSchema/IPDDoctorDischargeDetailsSchema");

const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");

const IPDNurseDischargeDetailsModel = require("../../Models/IPDPatientSchema/IPDNurseDischargeDetailsSchema");

const IPD = require("../../Models/IPDSchema/IPDSchema");

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

Router.get("/IPDPatient-GET-ALL", async (req, res) => {
  const {
    ipdPatientId = "",
    patientName = "",
    page = 1,
    limit = 10,
  } = req.query;
  try {
    const skip = (Number(page) - 1) * Number(limit);

    const ipdPatientData = await IPDPatientModel.aggregate([
      {
        $sort: { _id: -1 },
      },
      {
        $lookup: {
          from: "patients",
          localField: "ipdPatientId",
          foreignField: "patientId",
          as: "patientData",
        },
      },
      {
        $lookup: {
          from: "doctor",
          localField: "ipdDoctorId",
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
        $match: { ipdPatientId: { $regex: ipdPatientId, $options: "i" } },
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
    // const ipdPatientData = await IPDPatientModel.find();

    let totalIPDPatient = 0;
    if (ipdPatientId !== "") {
      totalIPDPatient = await IPDPatientModel.countDocuments({
        ipdPatientId: { $regex: ipdPatientId, $options: "i" },
      });
    } else if (patientName !== "") {
      const totalIPDPatientCounts = await IPDPatientModel.aggregate([
        {
          $lookup: {
            from: "patients",
            localField: "ipdPatientId",
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
      ]);
      totalIPDPatient = totalIPDPatientCounts[0].patientName;
    }

    res.status(200).json({
      ipdPatientData,
      totalIPDPatient,
      totalPages: Math.ceil(Number(totalIPDPatient) / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/IPDPatient-GET-ONE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    const ipdPatientData = await IPDPatientModel.findOne({ mainId: id });

    if (!ipdPatientData) {
      return res.status(404).json("IPD Patient Data Not Found");
    }
    return res.status(200).json(ipdPatientData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/IPDPatient-Balance-GET-ALL", async (req, res) => {
  const {
    ipdPatientId = "",
    patientName = "",
    page = 1,
    limit = 10,
  } = req.query;
  try {
    // const allBalances = await IPDPatientBalanceModel.find();

    // console.log(allBalances);

    // const remainingBalances = await IPDPatientBalanceModel.aggregate([
    //   // {
    //   //   $lookup: {
    //   //     from: "$ipdpatients",
    //   //     localField: "$ipdPatientRegId", // Adjust this field as needed
    //   //     foreignField: "$mainId", // Adjust this field as needed
    //   //     as: "filterData",
    //   //   },
    //   // },
    //   {
    //     $unwind: "$balance",
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       // totalBalance: { $sum: "$balance.totalBalance" },
    //       totalAddedBalance: { $sum: "$balance.addedBalance" },
    //       charges: { $first: "$charges" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$charges",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$charges.items",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //       // totalBalance: { $first: "$totalBalance" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: {
    //         $sum: {
    //           $multiply: ["$charges.items.quantity", "$charges.items.price"],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$labTestCharges",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$labTestCharges.items",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       // labTestCharges: { $first: "$labTestCharges" },
    //       // totalBalance: { $first: "$totalBalance" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: { $first: "$totalCharges" },
    //       totalLabTestCharges: {
    //         $sum: {
    //           $multiply: [
    //             "$labTestCharges.items.quantity",
    //             "$labTestCharges.items.price",
    //           ],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       remainingBalance: {
    //         $subtract: [
    //           "$totalAddedBalance",
    //           { $add: ["$totalCharges", "$totalLabTestCharges"] },
    //         ],
    //       },
    //     },
    //   },
    // ]);

    // const balanceCalculation = await IPDPatientBalanceModel.aggregate([
    //   {
    //     $unwind: "$balance",
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       // totalBalance: { $sum: "$balance.totalBalance" },
    //       totalAddedBalance: { $sum: "$balance.addedBalance" },
    //       charges: { $first: "$charges" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$charges",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$charges.items",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //       // totalBalance: { $first: "$totalBalance" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: {
    //         $sum: {
    //           $multiply: ["$charges.items.quantity", "$charges.items.price"],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$labTestCharges",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$labTestCharges.items",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       // labTestCharges: { $first: "$labTestCharges" },
    //       // totalBalance: { $first: "$totalBalance" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: { $first: "$totalCharges" },
    //       totalLabTestCharges: {
    //         $sum: {
    //           $multiply: [
    //             "$labTestCharges.items.quantity",
    //             "$labTestCharges.items.price",
    //           ],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "ipdpatients",
    //       localField: "ipdPatientRegId", // Adjust this field as needed
    //       foreignField: "mainId", // Adjust this field as needed
    //       as: "IPDPatientData",
    //     },
    //   },
    //   {
    //     $unwind: "$IPDPatientData",
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientObjectId: { $first: "$_id" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: { $first: "$totalCharges" },
    //       totalLabTestCharges: { $first: "$totalLabTestCharges" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //       creationDate: { $first: "$IPDPatientData.createdAt" },
    //       bedId: { $first: "$IPDPatientData.ipdBedNo" },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "managebeds",
    //       localField: "bedId", // Adjust this field as needed
    //       foreignField: "bedId", // Adjust this field as needed
    //       as: "BedData",
    //     },
    //   },
    //   {
    //     $unwind: "$BedData",
    //   },

    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientObjectId: { $first: "$_id" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: { $first: "$totalCharges" },
    //       totalLabTestCharges: { $first: "$totalLabTestCharges" },
    //       creationDate: { $first: "$creationDate" },
    //       beddata: { $first: "$BedData" },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       days: {
    //         $dateDiff: {
    //           startDate: "$creationDate",
    //           endDate: "$$NOW",
    //           unit: "day",
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       balanceID: 1,
    //       uhid: 1,
    //       ipdPatientObjectId: 1,
    //       ipdPatientRegId: 1,
    //       totalAddedBalance: 1,
    //       totalCharges: 1,
    //       totalLabTestCharges: 1,
    //       creationDate: 1,
    //       // beddata: 1,
    //       days: 1,
    //       bedCharges: { $multiply: ["$days", "$beddata.bedCharges"] },
    //       nursingCharges: { $multiply: ["$days", "$beddata.nursingCharges"] },
    //       EMOCharges: { $multiply: ["$days", "$beddata.EMOCharges"] },
    //       bioWasteCharges: { $multiply: ["$days", "$beddata.bioWasteCharges"] },
    //       sanitizationCharges: {
    //         $multiply: ["$days", "$beddata.sanitizationCharges"],
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       remainingBalance: {
    //         $subtract: [
    //           "$totalAddedBalance",
    //           {
    //             $add: [
    //               "$totalCharges",
    //               "$totalLabTestCharges",
    //               "$bedCharges",
    //               "$nursingCharges",
    //               "$EMOCharges",
    //               "$bioWasteCharges",
    //               "$sanitizationCharges",
    //             ],
    //           },
    //         ],
    //       },
    //     },
    //   },
    // ]);

    const skip = (Number(page) - 1) * Number(limit);

    const remainingBalanceCalc = await IPDPatientModel.aggregate([
      // {
      //   $lookup: {
      //     from: "ipdpatientbalances",
      //     localField: "mainId",
      //     foreignField: "ipdPatientRegId",
      //     as: "IPDPatientBalanceData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$IPDPatientBalanceData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "ipds",
          localField: "mainId",
          foreignField: "ipdPatientMainId",
          as: "IPDPatientMEDDOCLABData",
        },
      },
      {
        $unwind: {
          path: "$IPDPatientMEDDOCLABData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "managebeds",
          localField: "IPDPatientMEDDOCLABData.ipdPatientCurrentBed",
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
          localField: "IPDPatientMEDDOCLABData.doctorId",
          foreignField: "_id",
          as: "doctorData",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "IPDPatientMEDDOCLABData.ReferedDoctorId",
          foreignField: "_id",
          as: "ReferedDoctor",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "IPDPatientMEDDOCLABData.AdditionalDoctorId",
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
          localField: "ReferedDoctor.doctorId",
          foreignField: "doctorId",
          as: "RefereddoctorFeesDatails",
        },
      },
      {
        $lookup: {
          from: "doctorprofessionaldetails",
          localField: "additionalDoctorData.doctorId",
          foreignField: "doctorId",
          as: "additionalDoctorFeesDatails",
        },
      },
      // {
      //   $addFields: {
      //     doctorFees: {
      //       $cond: {
      //         if: { $eq: [{ $size: "$doctorFeesDatails" }, 0] },
      //         then: 0,
      //         else: { $arrayElemAt: ["$doctorFeesDatails.doctorFee", 0] },
      //       },
      //     },
      //     RefereddoctorFees: {
      //       $cond: {
      //         if: { $eq: [{ $size: "$RefereddoctorFeesDatails" }, 0] },
      //         then: 0,
      //         else: {
      //           $arrayElemAt: ["$RefereddoctorFeesDatails.doctorFee", 0],
      //         },
      //       },
      //     },
      //     AdditionalDoctorFees: {
      //       $cond: {
      //         if: { $eq: [{ $size: "$additionalDoctorFeesDatails" }, 0] },
      //         then: 0,
      //         else: {
      //           $arrayElemAt: ["$additionalDoctorFeesDatails.doctorFee", 0],
      //         },
      //       },
      //     },
      //   },
      // },
      {
        $project: {
          _id: "$mainId",
          ipdBedNo: 1,
          ipdPatientDischarged: 1,
          createdAt: 1,
          ipdPatientId: "$IPDPatientMEDDOCLABData.ipdPatientData",
          VisitDateTime: "$IPDPatientMEDDOCLABData.VisitDateTime",
          submittedBy: "$IPDPatientMEDDOCLABData.submittedBy",
          doctorData: 1,
          ReferedDoctor: 1,
          additionalDoctorData: 1,
          // doctorFees: "$doctorFees",
          // RefereddoctorFees: "$RefereddoctorFees",
          // AdditionalDoctorFees: "$AdditionalDoctorFees",
          DailyMedicinePriceTotal: {
            $sum: "$IPDPatientMEDDOCLABData.medicine.Price",
          },
          DailyTestPriceTotal: { $sum: "$IPDPatientMEDDOCLABData.test.Price" },
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
          DailyReferDoctorVisitChargeBasedOnBed: {
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
                  then: "$RefereddoctorFeesDatails.doctorSemiPrivateFee",
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
                  then: "$RefereddoctorFeesDatails.doctorEmergencyFee",
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
                  then: "$RefereddoctorFeesDatails.doctorGereralHighFee",
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
                  then: "$RefereddoctorFeesDatails.doctorGereralJanataFee",
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
                  then: "$RefereddoctorFeesDatails.doctorPrivateSuiteFee",
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
                  then: "$RefereddoctorFeesDatails.doctorPrivateSingleAcDlxFee",
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
                  then: "$RefereddoctorFeesDatails.doctorPrivateSingleAcFee",
                },
              ],
              default: 0,
            },
          },
          DailyAdditionalDoctorVisitChargeBasedOnBed: {
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
                  then: "$additionalDoctorFeesDatails.doctorSemiPrivateFee",
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
                  then: "$additionalDoctorFeesDatails.doctorEmergencyFee",
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
                  then: "$additionalDoctorFeesDatails.doctorGereralHighFee",
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
                  then: "$additionalDoctorFeesDatails.doctorGereralJanataFee",
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
                  then: "$additionalDoctorFeesDatails.doctorPrivateSuiteFee",
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
                  then: "$additionalDoctorFeesDatails.doctorPrivateSingleAcDlxFee",
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
                  then: "$additionalDoctorFeesDatails.doctorPrivateSingleAcFee",
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
          ipdBedNo: { $first: "$ipdBedNo" },
          ipdPatientDischarged: { $first: "$ipdPatientDischarged" },
          creationDate: { $first: "$createdAt" },
          visitDate: { $first: "$VisitDateTime" },
          submittedBy: { $first: "$submittedBy" },
          DailyDoctorVisitChargeBasedOnBed: {
            $first: "$DailyDoctorVisitChargeBasedOnBed",
          },
          DailyReferDoctorVisitChargeBasedOnBed: {
            $first: "$DailyReferDoctorVisitChargeBasedOnBed",
          },
          DailyAdditionalDoctorVisitChargeBasedOnBed: {
            $first: "$DailyAdditionalDoctorVisitChargeBasedOnBed",
          },
          totalDailyMedicinePriceTotal: { $sum: "$DailyMedicinePriceTotal" },
          totalDailyTestPriceTotal: { $sum: "$DailyTestPriceTotal" },
        },
      },

      {
        $project: {
          _id: 1,
          ipdBedNo: 1,
          ipdPatientDischarged: 1,
          creationDate: 1,
          totalDailyMedicinePriceTotal: 1,
          totalDailyTestPriceTotal: 1,
          visitDate: 1,
          submittedBy: 1,
          DailyDoctorVisitChargeBasedOnBed: 1,
          DailyReferDoctorVisitChargeBasedOnBed: 1,
          DailyAdditionalDoctorVisitChargeBasedOnBed: 1,
          doctorVisitCharge: {
            $cond: {
              if: {
                $or: {
                  $eq: ["$DailyDoctorVisitChargeBasedOnBed", 0],
                  $eq: ["$DailyReferDoctorVisitChargeBasedOnBed", 0],
                  $eq: ["$DailyAdditionalDoctorVisitChargeBasedOnBed", 0],
                },
              },
              then: 0,
              else: {
                $cond: {
                  if: { $ne: ["$DailyReferDoctorVisitChargeBasedOnBed", []] },
                  then: {
                    $arrayElemAt: ["$DailyReferDoctorVisitChargeBasedOnBed", 0],
                  },
                  else: {
                    $cond: {
                      if: { $eq: ["$submittedBy", "Additional Doctor"] },
                      then: {
                        $arrayElemAt: [
                          "$DailyAdditionalDoctorVisitChargeBasedOnBed",
                          0,
                        ],
                      },
                      else: {
                        $arrayElemAt: ["$DailyDoctorVisitChargeBasedOnBed", 0],
                      },
                    },
                    // $arrayElemAt: ["$DailyDoctorVisitChargeBasedOnBed", 0]
                  },
                },
              },
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
          from: "ipdpatientbalances",
          localField: "_id",
          foreignField: "ipdPatientRegId",
          as: "IPDPatientBalanceData",
        },
      },
      {
        $unwind: {
          path: "$IPDPatientBalanceData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          ipdBedNo: { $first: "$ipdBedNo" },
          ipdPatientDischarged: { $first: "$ipdPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$IPDPatientBalanceData.balanceID" },
          uhid: { $first: "$IPDPatientBalanceData.uhid" },
          ipdPatientRegId: { $first: "$IPDPatientBalanceData.ipdPatientRegId" },
          // totalBalance: { $sum: "$balance.totalBalance" },
          balance: { $first: "$IPDPatientBalanceData.balance" },
          // totalAddedBalance: { $first: "$balance.addedBalance" },
          charges: { $first: "$IPDPatientBalanceData.charges" },
          labTestCharges: { $first: "$IPDPatientBalanceData.labTestCharges" },
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
          ipdBedNo: { $first: "$ipdBedNo" },
          ipdPatientDischarged: { $first: "$ipdPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          ipdPatientRegId: { $first: "$ipdPatientRegId" },
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
          ipdBedNo: { $first: "$ipdBedNo" },
          ipdPatientDischarged: { $first: "$ipdPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
          overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
          overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
          ipdPatientRegId: { $first: "$ipdPatientRegId" },
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
          ipdBedNo: { $first: "$ipdBedNo" },
          ipdPatientDischarged: { $first: "$ipdPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          ipdPatientRegId: { $first: "$ipdPatientRegId" },
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
          localField: "ipdBedNo", // Adjust this field as needed
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
          ipdBedNo: { $first: "$ipdBedNo" },
          ipdPatientDischarged: { $first: "$ipdPatientDischarged" },
          creationDate: { $first: "$creationDate" },
          balanceID: { $first: "$balanceID" },
          uhid: { $first: "$uhid" },
          ipdPatientObjectId: { $first: "$_id" },
          ipdPatientRegId: { $first: "$ipdPatientRegId" },
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
          from: "ipdpatientdischargereciepts",
          localField: "_id", // Adjust this field as needed
          foreignField: "IPDPatientRegId", // Adjust this field as needed
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
              if: { $eq: ["$ipdPatientDischarged", true] },
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
          ipdPatientObjectId: 1,
          ipdPatientRegId: 1,
          totalAddedBalance: 1,
          totalCharges: 1,
          totalLabTestCharges: 1,
          overallTotalMedicinePrice: 1,
          overallTotalTestPrice: 1,
          overallDoctorVisitCharge: 1,
          creationDate: 1,
          beddata: 1,
          days: { $add: ["$days", 1] },
          // bedCharges: { $multiply: ["$days", "$beddata.bedCharges"] },
          // nursingCharges: { $multiply: ["$days", "$beddata.nursingCharges"] },
          // EMOCharges: { $multiply: ["$days", "$beddata.EMOCharges"] },
          // bioWasteCharges: { $multiply: ["$days", "$beddata.bioWasteCharges"] },
          // sanitizationCharges: {
          //   $multiply: ["$days", "$beddata.sanitizationCharges"],
          // },
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "uhid",
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
        $project: {
          balanceID: 1,
          uhid: 1,
          patientName: 1,
          ipdPatientObjectId: 1,
          ipdPatientRegId: 1,
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
      {
        $match: { uhid: { $regex: ipdPatientId, $options: "i" } },
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

    // const medicineDoctorTestBalanceCalculation = await IPD.aggregate([
    //   {
    //     $lookup: {
    //       from: "ipdpatientbalances",
    //       localField: "ipdPatientData",
    //       foreignField: "ipdPatientRegId",
    //       as: "IPDPatientBalanceData",
    //     },
    //   },
    //   // {
    //   //   $lookup: {
    //   //     from: "ipdpatientbalances",
    //   //     localField: "ipdPatientMainId",
    //   //     foreignField: "ipdPatientRegId",
    //   //     as: "IPDPatientBalanceData",
    //   //   },
    //   // },
    //   {
    //     $unwind: {
    //       path: "$IPDPatientBalanceData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   { $unwind: { path: "$medicine", preserveNullAndEmptyArrays: true } },
    //   { $unwind: { path: "$test", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "doctors",
    //       localField: "doctorId",
    //       foreignField: "_id",
    //       as: "doctorData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "doctors",
    //       localField: "ReferedDoctorId",
    //       foreignField: "_id",
    //       as: "ReferedDoctor",
    //     },
    //   },

    //   { $unwind: { path: "$doctorData", preserveNullAndEmptyArrays: true } },
    //   { $unwind: { path: "$ReferedDoctor", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "doctorprofessionaldetails",
    //       localField: "doctorData.doctorId",
    //       foreignField: "doctorId",
    //       as: "doctorFeesDatails",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "doctorprofessionaldetails",
    //       localField: "ReferedDoctor.doctorId",
    //       foreignField: "doctorId",
    //       as: "RefereddoctorFeesDatails",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       DailyMedicinePriceTotal: { $sum: "$medicine.Price" },
    //       DailyTestPriceTotal: { $sum: "$test.Price" },
    //       visitDate: { $first: "$VisitDateTime" },
    //       IPDPatientRegId: { $first: "$IPDPatientBalanceData.ipdPatientRegId" },
    //       // doctorData: { $first: "$doctorData" },
    //       // referedDoctorData: { $first: "$ReferedDoctor" },
    //       doctorFeesDatails: { $first: "$doctorFeesDatails.doctorFee" },
    //       RefereddoctorFeesDatails: {
    //         $first: "$RefereddoctorFeesDatails.doctorFee",
    //       },
    //       // doctorVisitTotalCharge:{$sum:{$cond:if:{"ReferedDoctor":}}},
    //       // $sum: { $cond: { if: { "status": "present" }, then: 1, else: 0}}
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       overAllData: { $push: "$$ROOT" },
    //       ipdPatientRegId: { $first: "$IPDPatientRegId" },
    //       overallTotalMedicinePrice: { $sum: "$DailyMedicinePriceTotal" },
    //       overallTotalTestPrice: { $sum: "$DailyTestPriceTotal" },
    //       overallDoctorVisitCharge: {
    //         $sum: {
    //           $cond: {
    //             if: { $ne: ["$RefereddoctorFeesDatails", []] }, // Checks if RefereddoctorFeesDatails is not an empty array
    //             then: { $arrayElemAt: ["$RefereddoctorFeesDatails", 0] }, // Use the fee from RefereddoctorFeesDatails if present
    //             else: { $arrayElemAt: ["$doctorFeesDatails", 0] }, // Otherwise, use the fee from doctorFeesDatails
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       ipdPatientRegId: 1,
    //       overAllData: 1,
    //       overallTotalMedicinePrice: 1,
    //       overallTotalTestPrice: 1,
    //       overallDoctorVisitCharge: 1,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "ipdpatientbalances",
    //       localField: "ipdPatientRegId",
    //       foreignField: "ipdPatientRegId",
    //       as: "IPDPatientBalanceData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$IPDPatientBalanceData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$IPDPatientBalanceData._id",
    //       balanceID: { $first: "$IPDPatientBalanceData.balanceID" },
    //       uhid: { $first: "$IPDPatientBalanceData.uhid" },
    //       ipdPatientRegId: { $first: "$IPDPatientBalanceData.ipdPatientRegId" },
    //       // totalBalance: { $sum: "$balance.totalBalance" },
    //       balance: { $first: "$IPDPatientBalanceData.balance" },
    //       // totalAddedBalance: { $first: "$balance.addedBalance" },
    //       charges: { $first: "$IPDPatientBalanceData.charges" },
    //       labTestCharges: { $first: "$IPDPatientBalanceData.labTestCharges" },
    //       overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
    //       overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
    //       overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
    //     },
    //   },
    //   { $unwind: { path: "$balance", preserveNullAndEmptyArrays: true } },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       // totalBalance: { $sum: "$balance.totalBalance" },
    //       totalAddedBalance: { $sum: "$balance.addedBalance" },
    //       charges: { $first: "$charges" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //       overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
    //       overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
    //       overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$charges",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$charges.items",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
    //       overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
    //       overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //       // totalBalance: { $first: "$totalBalance" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: {
    //         $sum: {
    //           $multiply: ["$charges.items.quantity", "$charges.items.price"],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$labTestCharges",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$labTestCharges.items",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       // labTestCharges: { $first: "$labTestCharges" },
    //       // totalBalance: { $first: "$totalBalance" },
    //       overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
    //       overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
    //       overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: { $first: "$totalCharges" },
    //       totalLabTestCharges: {
    //         $sum: {
    //           $multiply: [
    //             "$labTestCharges.items.quantity",
    //             "$labTestCharges.items.price",
    //           ],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "ipdpatients",
    //       localField: "ipdPatientRegId", // Adjust this field as needed
    //       foreignField: "mainId", // Adjust this field as needed
    //       as: "IPDPatientData",
    //     },
    //   },
    //   {
    //     $unwind: { path: "$IPDPatientData", preserveNullAndEmptyArrays: true },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientObjectId: { $first: "$_id" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: { $first: "$totalCharges" },
    //       totalLabTestCharges: { $first: "$totalLabTestCharges" },
    //       overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
    //       overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
    //       overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
    //       labTestCharges: { $first: "$labTestCharges" },
    //       creationDate: { $first: "$IPDPatientData.createdAt" },
    //       bedId: { $first: "$IPDPatientData.ipdBedNo" },
    //       ipdPatientDischarged: {
    //         $first: "$IPDPatientData.ipdPatientDischarged",
    //       },
    //     },
    //   },

    //   {
    //     $lookup: {
    //       from: "managebeds",
    //       localField: "bedId", // Adjust this field as needed
    //       foreignField: "bedId", // Adjust this field as needed
    //       as: "BedData",
    //     },
    //   },
    //   {
    //     $unwind: { path: "$BedData", preserveNullAndEmptyArrays: true },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       balanceID: { $first: "$balanceID" },
    //       uhid: { $first: "$uhid" },
    //       ipdPatientObjectId: { $first: "$_id" },
    //       ipdPatientRegId: { $first: "$ipdPatientRegId" },
    //       totalAddedBalance: { $first: "$totalAddedBalance" },
    //       totalCharges: { $first: "$totalCharges" },
    //       totalLabTestCharges: { $first: "$totalLabTestCharges" },
    //       overallTotalMedicinePrice: { $first: "$overallTotalMedicinePrice" },
    //       overallTotalTestPrice: { $first: "$overallTotalTestPrice" },
    //       overallDoctorVisitCharge: { $first: "$overallDoctorVisitCharge" },
    //       creationDate: { $first: "$creationDate" },
    //       beddata: { $first: "$BedData" },
    //       ipdPatientDischarged: {
    //         $first: "$ipdPatientDischarged",
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "ipdpatientdischargereciepts",
    //       localField: "ipdPatientRegId", // Adjust this field as needed
    //       foreignField: "IPDPatientRegId", // Adjust this field as needed
    //       as: "dischargeData",
    //     },
    //   },
    //   {
    //     $unwind: { path: "$dischargeData", preserveNullAndEmptyArrays: true },
    //   },

    //   // {
    //   //   $addFields: {
    //   //     days: {
    //   //       $cond: {
    //   //         if: { $eq: ["$ipdPatientDischarged", true] },
    //   //         then: {
    //   //           // days: "$dischargeData.dateAndTimeOfDischarge",
    //   //           $dateDiff: {
    //   //             startDate: "$creationDate",
    //   //             endDate: "$dischargeData.dateAndTimeOfDischarge",
    //   //             unit: "day",
    //   //           },
    //   //         },
    //   //         else: {
    //   //           $dateDiff: {
    //   //             startDate: "$creationDate",
    //   //             endDate: "$$NOW",
    //   //             unit: "day",
    //   //           },
    //   //         },
    //   //       },
    //   //     },
    //   //   },
    //   // },
    //   // {
    //   //   $project: {
    //   //     balanceID: 1,
    //   //     uhid: 1,
    //   //     ipdPatientObjectId: 1,
    //   //     ipdPatientRegId: 1,
    //   //     totalAddedBalance: 1,
    //   //     totalCharges: 1,
    //   //     totalLabTestCharges: 1,
    //   //     overallTotalMedicinePrice: 1,
    //   //     overallTotalTestPrice: 1,
    //   //     overallDoctorVisitCharge: 1,
    //   //     creationDate: 1,
    //   //     // beddata: 1,
    //   //     days: 1,
    //   //     bedCharges: { $multiply: ["$days", "$beddata.bedCharges"] },
    //   //     nursingCharges: { $multiply: ["$days", "$beddata.nursingCharges"] },
    //   //     EMOCharges: { $multiply: ["$days", "$beddata.EMOCharges"] },
    //   //     bioWasteCharges: { $multiply: ["$days", "$beddata.bioWasteCharges"] },
    //   //     sanitizationCharges: {
    //   //       $multiply: ["$days", "$beddata.sanitizationCharges"],
    //   //     },
    //   //   },
    //   // },
    //   // {
    //   //   $addFields: {
    //   //     autoChargesTotal: {
    //   //       $add: [
    //   //         "$bedCharges",
    //   //         "$nursingCharges",
    //   //         "$EMOCharges",
    //   //         "$bioWasteCharges",
    //   //         "$sanitizationCharges",
    //   //       ],
    //   //     },
    //   //     finalTotal: {
    //   //       $add: [
    //   //         "$totalCharges",
    //   //         "$totalLabTestCharges",
    //   //         "$bedCharges",
    //   //         "$nursingCharges",
    //   //         "$EMOCharges",
    //   //         "$bioWasteCharges",
    //   //         "$sanitizationCharges",
    //   //         "$overallTotalMedicinePrice",
    //   //         "$overallTotalTestPrice",
    //   //         "$overallDoctorVisitCharge",
    //   //       ],
    //   //     },
    //   //     remainingBalance: {
    //   //       $subtract: [
    //   //         "$totalAddedBalance",
    //   //         {
    //   //           $add: [
    //   //             "$totalCharges",
    //   //             "$totalLabTestCharges",
    //   //             "$bedCharges",
    //   //             "$nursingCharges",
    //   //             "$EMOCharges",
    //   //             "$bioWasteCharges",
    //   //             "$sanitizationCharges",
    //   //             "$overallTotalMedicinePrice",
    //   //             "$overallTotalTestPrice",
    //   //             "$overallDoctorVisitCharge",
    //   //           ],
    //   //         },
    //   //       ],
    //   //     },
    //   //   },
    //   // },
    // ]);

    // console.log(fsdfd);

    return res.status(200).json({
      // data: allBalances,
      balanceCalculation: remainingBalanceCalc,
      // medicineDoctorTestBalanceCalculation:
      //   medicineDoctorTestBalanceCalculation,
      // mainRemainingBalance:
      //   balanceCalculation.remainingBalance -
      //   (medicineDoctorTestBalanceCalculation.overallTotalMedicinePrice +
      //     medicineDoctorTestBalanceCalculation.overallTotalMedicinePrice +
      //     medicineDoctorTestBalanceCalculation.overallTotalMedicinePrice),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/IPDPatient-Balance-GET/:Id", async (req, res) => {
  const id = req.params.Id;
  try {
    const IPDPatientBalance = await IPDPatientBalanceModel.findOne({
      ipdPatientRegId: id,
    });

    // const IPDPatient = await IPDPatientModel.findOne({ mainId: id });

    if (!IPDPatientBalance) {
      return res.status(404).json("IPD Patient Balance Data Not Found");
    }

    let totalMedicalCharges = 0;
    let totalLabTestCharges = 0;

    if (IPDPatientBalance) {
      await IPDPatientBalanceModel.aggregate([
        {
          $match: { ipdPatientRegId: IPDPatientBalance.ipdPatientRegId },
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

      await IPDPatientBalanceModel.aggregate([
        {
          $match: { ipdPatientRegId: IPDPatientBalance.ipdPatientRegId },
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
          totalLabTestCharges = newRes;
        })
        .catch((err) => {
          console.log(err);
        });

      const autoChargeCalculation = await IPDPatientModel.aggregate([
        {
          $match: { mainId: IPDPatientBalance.ipdPatientRegId },
        },
        {
          $lookup: {
            from: "managebeds",
            localField: "ipdBedNo",
            foreignField: "bedId",
            as: "bedData",
          },
        },
        {
          $unwind: { path: "$bedData", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "ipdpatientbalances",
            localField: "ipdBedNo",
            foreignField: "currentBed",
            as: "IPDPatientBalancesData",
          },
        },
        {
          $unwind: {
            path: "$IPDPatientBalancesData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            allBeds: "$IPDPatientBalancesData.beds",
          },
        },
        {
          $addFields: {
            singleBedData: { $last: "$allBeds" },
          },
        },
        {
          $addFields: {
            bedCharges: "$IPDPatientBalancesData.bedCharges",
          },
        },
        {
          $lookup: {
            from: "ipdpatientdischargereciepts",
            localField: "mainId",
            foreignField: "IPDPatientRegId",
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
                        if: { $eq: ["$ipdPatientDischarged", true] },
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
                        if: { $eq: ["$ipdPatientDischarged", true] },
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
            ipdPatientDischarged: 1,
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
                    if: { $eq: ["$ipdPatientDischarged", true] },
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

      // console.log(autoChargeCalculation);

      // const totalTimeCalculation = (time) => {
      //   let pastDate = new Date(time);
      //   let presentDate = new Date();

      //   let differenceInTime = presentDate.getTime() - pastDate.getTime();

      //   let differenceInDays = Math.round(
      //     differenceInTime / (1000 * 3600 * 24)
      //   );

      //   return differenceInDays + 1;
      // };

      // const totalChargesCalculation = (creationTime, charges) => {
      //   let time = totalTimeCalculation(creationTime);

      //   let totalCharge = time * charges;

      //   return totalCharge;
      // };

      // const ManageBedsPriceData = await ManageBedsModel.findOne({
      //   bedId: IPDPatient.ipdBedNo,
      // });

      // if (!ManageBedsPriceData) {
      //   return res.status(404).json("IPD Patient Bed Not Found!");
      // }

      // if (ManageBedsPriceData) {
      //   const ipdPatientAutoCharges = {
      //     numberOfDays: totalTimeCalculation(IPDPatient.createdAt),
      //     totalbedCharges: totalChargesCalculation(
      //       IPDPatient.createdAt,
      //       ManageBedsPriceData.bedCharges
      //     ),
      //     totalNurseCharges: totalChargesCalculation(
      //       IPDPatient.createdAt,
      //       ManageBedsPriceData.nursingCharges
      //     ),
      //     totalEMOCharges: totalChargesCalculation(
      //       IPDPatient.createdAt,
      //       ManageBedsPriceData.EMOCharges
      //     ),
      //     totalBioWasteCharges: totalChargesCalculation(
      //       IPDPatient.createdAt,
      //       ManageBedsPriceData.bioWasteCharges
      //     ),
      //     totalSanitizationCharges: totalChargesCalculation(
      //       IPDPatient.createdAt,
      //       ManageBedsPriceData.sanitizationCharges
      //     ),
      //     subTotal:
      //       totalChargesCalculation(
      //         IPDPatient.createdAt,
      //         ManageBedsPriceData.bedCharges
      //       ) +
      //       totalChargesCalculation(
      //         IPDPatient.createdAt,
      //         ManageBedsPriceData.nursingCharges
      //       ) +
      //       totalChargesCalculation(
      //         IPDPatient.createdAt,
      //         ManageBedsPriceData.EMOCharges
      //       ) +
      //       totalChargesCalculation(
      //         IPDPatient.createdAt,
      //         ManageBedsPriceData.bioWasteCharges
      //       ) +
      //       totalChargesCalculation(
      //         IPDPatient.createdAt,
      //         ManageBedsPriceData.sanitizationCharges
      //       ),
      //   };

      return res.status(200).json({
        data: IPDPatientBalance,
        totalMedicalCharges: totalMedicalCharges,
        totalLabTestCharges: totalLabTestCharges,
        autoCharges: autoChargeCalculation,
      });
      // }
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/IPDPatient-POST", async (req, res) => {
  const {
    ipdPatientId,
    ipdDoctorId,
    ipdNurseId,
    ipdPatientNotes,
    ipdDepositAmount,

    ipdPaymentMode,
    // ipdWardNo,
    ipdFloorNo,
    balanceNote,
    // ipdRoomNo,
    ipdBedNo,
  } = req.body;

  try {
    if (!ipdPatientId && !ipdDoctorId) {
      return res
        .status(422)
        .json({ error: "Please fill the field completely!" });
    }
    const newIpdPatientData = new IPDPatientModel({
      mainId: "P-IPD-" + generateUniqueId(),
      ipdPatientId: ipdPatientId,
      ipdDoctorId: ipdDoctorId,
      ipdNurseId: ipdNurseId,
      ipdDepositAmount: ipdDepositAmount,

      // ipdWardNo: ipdWardNo,
      ipdFloorNo: ipdFloorNo,
      // ipdRoomNo: ipdRoomNo,
      ipdBedNo: ipdBedNo,
      ipdPatientNotes: ipdPatientNotes,
    });

    if (newIpdPatientData) {
      const newIPDPatientBalanceData = new IPDPatientBalanceModel({
        balanceID: "IPDBal" + generateUniqueId(),
        uhid: newIpdPatientData.ipdPatientId,
        ipdPatientRegId: newIpdPatientData.mainId,
        balance: {
          _id: new mongoose.Types.ObjectId(),
          patientType: "IPD",
          totalBalance: newIpdPatientData.ipdDepositAmount,
          addedBalance: newIpdPatientData.ipdDepositAmount,
          paymentMethod: ipdPaymentMode,
          balanceNote: balanceNote,
        },
        currentBed: newIpdPatientData.ipdBedNo,
        beds: {
          bedId: newIpdPatientData.ipdBedNo,
        },
      });

      await newIPDPatientBalanceData.save();

      const newIPDPatientNurseDischargeDetailsData =
        new IPDNurseDischargeDetailsModel({
          mainId: "IPD-ND-" + generateUniqueId(),
          ipdPatientRegId: newIpdPatientData.mainId,
          nurseId: newIpdPatientData.ipdNurseId,
        });

      await newIPDPatientNurseDischargeDetailsData.save();

      const newIPDPatientDoctorDischargeDetailsData =
        new IPDDoctorDischargeDetailsModel({
          mainId: "IPD-DD-" + generateUniqueId(),
          ipdPatientRegId: newIpdPatientData.mainId,
          doctorId: newIpdPatientData.ipdDoctorId,
        });

      await newIPDPatientDoctorDischargeDetailsData.save();

      return await newIpdPatientData.save().then((data) =>
        res.status(200).json({
          message: "IPD Patient Added Successfully",
          data: data,
        })
      );
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/IPDPatient-PUT/:Id", async (req, res) => {
  const id = req.params.Id;

  const {
    ipdPatientId,
    ipdDoctorId,
    ipdNurseId,
    ipdPatientNotes,
    ipdDepositAmount,
    // ipdWardNo,
    ipdFloorNo,
    // ipdRoomNo,
    // ipdBedNo,
  } = req.body;
  try {
    const ipdPatientData = await IPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        ipdPatientId: ipdPatientId
          ? ipdPatientId
          : IPDPatientModel.ipdPatientId,
        ipdDoctorId: ipdDoctorId ? ipdDoctorId : IPDPatientModel.ipdDoctorId,
        ipdNurseId: ipdNurseId ? ipdNurseId : IPDPatientModel.ipdNurseId,
        ipdDepositAmount: ipdDepositAmount
          ? ipdDepositAmount
          : IPDPatientModel.ipdDepositAmount,

        // ipdWardNo: ipdWardNo ? ipdWardNo : IPDPatientModel.ipdWardNo,
        ipdFloorNo: ipdFloorNo ? ipdFloorNo : IPDPatientModel.ipdFloorNo,
        // ipdRoomNo: ipdRoomNo ? ipdRoomNo : IPDPatientModel.ipdRoomNo,
        // ipdBedNo: ipdBedNo ? ipdBedNo : IPDPatientModel.ipdBedNo,
        ipdPatientNotes: ipdPatientNotes
          ? ipdPatientNotes
          : IPDPatientModel.ipdPatientNotes,
      }
    );

    if (!ipdPatientData) {
      return res.status(404).json("IPD Patient Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "IPD Patient Data Updated Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/IPDPatient-PUT-ChangeBed/:ipdPatientRegId", async (req, res) => {
  const id = req.params.ipdPatientRegId;

  const { ipdBedNo } = req.body;
  try {
    const ipdPatient = await IPDPatientModel.findOne({
      mainId: id,
    });

    if (ipdPatient) {
      if (ipdPatient.ipdBedNo === ipdBedNo) {
        return res.status(400).json({ error: "Bed Id Already Used" });
      }
      if (ipdPatient.ipdBedNo !== ipdBedNo) {
        const balanceCalculation = await ManageBedsModel.aggregate([
          {
            $match: { bedId: ipdPatient.ipdBedNo },
          },
          {
            $lookup: {
              from: "ipdpatientbalances",
              localField: "bedId",
              foreignField: "currentBed",
              as: "IPDPatientBalancesData",
            },
          },
          {
            $unwind: {
              path: "$IPDPatientBalancesData",
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
              beds: "$IPDPatientBalancesData.beds",
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
                        $multiply: ["$nursingCharges", { $add: ["$days", 1] }],
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
                        $multiply: ["$bioWasteCharges", { $add: ["$days", 1] }],
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
            await IPDPatientBalanceModel.findOneAndUpdate(
              {
                ipdPatientRegId: ipdPatient.mainId,
              },
              {
                $push: {
                  bedCharges: balanceCalculation[0],
                  beds: {
                    bedId: ipdBedNo,
                  },
                },
                currentBed: ipdBedNo,
              }
            );

          if (bedChargesUpdate) {
            const ipdPatientData = await IPDPatientModel.findOneAndUpdate(
              {
                mainId: id,
              },
              {
                ipdBedNo: ipdBedNo,
              }
            );

            if (ipdPatientData) {
              const bedAvailabilityUpdateForOldBed =
                await ManageBedsModel.findOneAndUpdate(
                  {
                    bedId: ipdPatient.ipdBedNo,
                  },
                  { bedAvailableOrNot: true }
                );
              if (bedAvailabilityUpdateForOldBed) {
                const bedAvailabilityUpdateForNewBed =
                  await ManageBedsModel.findOneAndUpdate(
                    {
                      bedId: ipdBedNo,
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
});

Router.put("/IPDPatient-PUT-UpdateDepositAmount/:ID", async (req, res) => {
  const id = req.params.ID;

  const { ipdAddedAmount, ipdPaymentMode, balanceNote } = req.body;
  try {
    const patient = await IPDPatientModel.findOne({ mainId: id });

    if (patient) {
      const ipdPatientData = await IPDPatientModel.findOneAndUpdate(
        { mainId: id },
        {
          ipdDepositAmount: ipdAddedAmount
            ? patient.ipdDepositAmount + ipdAddedAmount
            : IPDPatientModel.ipdDepositAmount,
          ipdAddedAmount: ipdAddedAmount
            ? ipdAddedAmount
            : IPDPatientModel.ipdAddedAmount,
        }
      );

      if (!ipdPatientData) {
        return res.status(404).json("IPD Patient Data Not Found");
      }

      if (ipdPatientData) {
        await IPDPatientBalanceModel.findOneAndUpdate(
          { ipdPatientRegId: ipdPatientData.mainId },
          {
            $push: {
              balance: {
                _id: new mongoose.Types.ObjectId(),
                patientType: "IPD",
                totalBalance: ipdPatientData.ipdDepositAmount + ipdAddedAmount,
                addedBalance: ipdAddedAmount,
                paymentMethod: ipdPaymentMode,
                balanceNote: balanceNote,
              },
            },
          }
        );
      }

      return res
        .status(200)
        .json({ message: "IPD Patient Deposit Amount Updated Successfully" });
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/IPDPatient-PUT-AddItemCharges/:Id", async (req, res) => {
  const id = req.params.Id;

  const { items } = req.body;

  try {
    const IPDPatient = await IPDPatientModel.findOne({ mainId: id });

    if (!IPDPatient) {
      return res.status(404).json("IPD Patient Data Not Found");
    }

    let total = 0;
    let newTotal = 0;

    await IPDPatientBalanceModel.aggregate([
      {
        $match: { ipdPatientRegId: IPDPatient.mainId },
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

    if (IPDPatient) {
      const IPDPatientChargesData =
        await IPDPatientBalanceModel.findOneAndUpdate(
          { ipdPatientRegId: IPDPatient.mainId },
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

      if (!IPDPatientChargesData) {
        return res.status(400).json("IPD Patient Data Not Found!");
      }

      return res
        .status(200)
        .json({ message: "IPD Patient Charges Updated Successfully" });
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/IPDPatient-PUT-AddLabTestCharges/:Id", async (req, res) => {
  const id = req.params.Id;

  const { items } = req.body;

  try {
    const IPDPatient = await IPDPatientModel.findOne({ mainId: id });

    if (!IPDPatient) {
      return res.status(404).json("IPD Patient Data Not Found");
    }

    let total = 0;
    let newTotal = 0;

    await IPDPatientBalanceModel.aggregate([
      {
        $match: { ipdPatientRegId: IPDPatient.mainId },
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

    if (IPDPatient) {
      const IPDPatientChargesData =
        await IPDPatientBalanceModel.findOneAndUpdate(
          { ipdPatientRegId: IPDPatient.mainId },
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

      if (!IPDPatientChargesData) {
        return res.status(400).json("IPD Patient Data Not Found!");
      }

      return res
        .status(200)
        .json({ message: "IPD Patient Lab Test Charges Updated Successfully" });
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/IPDPatient-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const ipdPatientData = await IPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!ipdPatientData) {
      return res.status(404).json("IPD Patient Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "IPD Patient Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
