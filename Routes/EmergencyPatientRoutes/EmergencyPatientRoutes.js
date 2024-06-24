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

Router.get("/EmergencyPatient-Balance-GET-ALL", async (req, res) => {
  try {
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
      {
        $addFields: {
          doctorFees: {
            $cond: {
              if: { $eq: [{ $size: "$doctorFeesDatails" }, 0] },
              then: 0,
              else: { $arrayElemAt: ["$doctorFeesDatails.doctorFee", 0] },
            },
          },
          // RefereddoctorFees: {
          //   $cond: {
          //     if: { $eq: [{ $size: "$RefereddoctorFeesDatails" }, 0] },
          //     then: 0,
          //     else: {
          //       $arrayElemAt: ["$RefereddoctorFeesDatails.doctorFee", 0],
          //     },
          //   },
          // },
        },
      },
      {
        $project: {
          _id: "$mainId",
          bedId: 1,
          emergencyPatientDischarged: 1,
          createdAt: 1,
          emergencyPatientId:
            "$EmergencyPatientMEDDOCLABData.emergencyPatientData",
          VisitDateTime: "$EmergencyPatientMEDDOCLABData.VisitDateTime",
          doctorData: 1,
          // ReferedDoctor: 1,
          doctorFees: "$doctorFees",
          // RefereddoctorFees: "$RefereddoctorFees",
          DailyMedicinePriceTotal: {
            $sum: "$EmergencyPatientMEDDOCLABData.medicine.Price",
          },
          DailyTestPriceTotal: {
            $sum: "$EmergencyPatientMEDDOCLABData.test.Price",
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
          totalDoctorFees: { $sum: "$doctorFees" },
          // totalRefereddoctorFees: { $sum: "$RefereddoctorFees" },
          totalDailyMedicinePriceTotal: { $sum: "$DailyMedicinePriceTotal" },
          totalDailyTestPriceTotal: { $sum: "$DailyTestPriceTotal" },
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
          totalDoctorFees: 1,
          // totalRefereddoctorFees: 1,
        },
      },
      {
        $addFields: {
          overallDoctorVisitCharge: "$totalDoctorFees",
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
              $cond: {
                if: { $eq: ["$emergencyPatientDischarged", true] },
                then: {
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
        },
        {
          $project: {
            bedData: 1,
            days: { $add: ["$days", 1] },
          },
        },
        {
          $project: {
            bedData: 1,
            days: 1,
            bedTotalCharges: { $multiply: ["$days", "$bedData.bedCharges"] },
            nursingTotalCharges: {
              $multiply: ["$days", "$bedData.nursingCharges"],
            },
            EMOTotalCharges: { $multiply: ["$days", "$bedData.EMOCharges"] },
            bioWasteTotalCharges: {
              $multiply: ["$days", "$bedData.bioWasteCharges"],
            },
            sanitizationTotalCharges: {
              $multiply: ["$days", "$bedData.sanitizationCharges"],
            },
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
