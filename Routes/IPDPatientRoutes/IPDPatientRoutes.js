const express = require("express");

const Router = express.Router();

const mongoose = require("mongoose");

require("../../DB/connection");

const IPDPatientModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");
const IPDPatientDischargeRecieptModel = require("../../Models/IPDPatientSchema/IPDPatientDischargeRecieptSchema");
const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");
const IPDPatientBalanceModel = require("../../Models/IPDPatientSchema/IPDPatientBalanceSchema");

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

const dateTime = new Date();

Router.get("/IPDPatient-GET-ALL", async (req, res) => {
  try {
    const ipdPatientData = await IPDPatientModel.find();

    res.status(200).json(ipdPatientData);
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

Router.get("/IPDPatientDischargeReciept-GET-ALL", async (req, res) => {
  try {
    const ipdPatientDischargeRecieptData =
      await IPDPatientDischargeRecieptModel.find();

    res.status(200).json(ipdPatientDischargeRecieptData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/IPDPatientDischargeReciept-GET-ONE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    const ipdPatientDischargeRecieptData =
      await IPDPatientDischargeRecieptModel.findOne({ recieptId: id });

    if (!ipdPatientDischargeRecieptData) {
      return res
        .status(404)
        .json("IPD Patient Discharge Reciept Data Not Found");
    }
    return res.status(200).json(ipdPatientDischargeRecieptData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/IPDPatient-POST", async (req, res) => {
  const {
    ipdPatientId,
    ipdDoctorId,
    ipdPatientNotes,
    ipdDepositAmount,

    ipdPaymentMode,
    // ipdWardNo,
    ipdFloorNo,
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
        },
      });

      await newIPDPatientBalanceData.save();

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
    ipdPatientNotes,
    ipdDepositAmount,
    // ipdWardNo,
    ipdFloorNo,
    // ipdRoomNo,
    ipdBedNo,
  } = req.body;
  try {
    const ipdPatientData = await IPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        ipdPatientId: ipdPatientId
          ? ipdPatientId
          : IPDPatientModel.ipdPatientId,
        ipdDoctorId: ipdDoctorId ? ipdDoctorId : IPDPatientModel.ipdDoctorId,
        ipdDepositAmount: ipdDepositAmount
          ? ipdDepositAmount
          : IPDPatientModel.ipdDepositAmount,

        // ipdWardNo: ipdWardNo ? ipdWardNo : IPDPatientModel.ipdWardNo,
        ipdFloorNo: ipdFloorNo ? ipdFloorNo : IPDPatientModel.ipdFloorNo,
        // ipdRoomNo: ipdRoomNo ? ipdRoomNo : IPDPatientModel.ipdRoomNo,
        ipdBedNo: ipdBedNo ? ipdBedNo : IPDPatientModel.ipdBedNo,
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

Router.put("/IPDPatient-PUT-UpdateDepositAmount/:ID", async (req, res) => {
  const id = req.params.ID;

  const { ipdAddedAmount, ipdPaymentMode } = req.body;
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

Router.put("/IPDPatient-PUT-DISCHARGE/:Id", async (req, res) => {
  try {
    const id = req.params.Id;
    const ipdPatientUpdatedData = await IPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        ipdPatientDischarged: true,
      }
    );

    if (!ipdPatientUpdatedData) {
      return res.status(404).json("IPD Patient Data Not Found");
    }

    const totalTime = (time) => {
      let pastDate = new Date(time);
      let presentDate = new Date();

      let differenceInTime = presentDate.getTime() - pastDate.getTime();

      let differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));

      return differenceInDays + 1;
    };

    const totalCharges = (creationTime, charges) => {
      let time = totalTime(creationTime);

      let totalCharge = time * charges;

      return totalCharge;
    };

    if (ipdPatientUpdatedData) {
      // console.log(ipdPatientUpdatedData.createdAt);
      // console.log(totalCharges(ipdPatientUpdatedData.createdAt));

      const ManageBedsUpdatedData = await ManageBedsModel.findOneAndUpdate(
        {
          bedId: ipdPatientUpdatedData.ipdBedNo,
        },
        { bedAvailableOrNot: true }
      );

      if (ManageBedsUpdatedData) {
        // console.log(totalCharges("2024-05-07T11:52:28.952+00:00", 500));
        // console.log(totalTime("2024-05-07T11:52:28.952+00:00"));
        // console.log(ManageBedsUpdatedData);
        const ipdPatientDischargeRecieptCreation =
          new IPDPatientDischargeRecieptModel({
            recieptId: "IPD-R-" + generateUniqueId(),
            uhid: ipdPatientUpdatedData?.ipdPatientId,
            numberOfDays: totalTime(ipdPatientUpdatedData.createdAt),
            totalbedCharges: totalCharges(
              ipdPatientUpdatedData.createdAt,
              ManageBedsUpdatedData.bedCharges
            ),
            totalNurseCharges: totalCharges(
              ipdPatientUpdatedData.createdAt,
              ManageBedsUpdatedData.nursingCharges
            ),
            totalEMOCharges: totalCharges(
              ipdPatientUpdatedData.createdAt,
              ManageBedsUpdatedData.EMOCharges
            ),
            totalBioWasteCharges: totalCharges(
              ipdPatientUpdatedData.createdAt,
              ManageBedsUpdatedData.bioWasteCharges
            ),
            totalSanitizationCharges: totalCharges(
              ipdPatientUpdatedData.createdAt,
              ManageBedsUpdatedData.sanitizationCharges
            ),
            subTotal:
              totalCharges(
                ipdPatientUpdatedData.createdAt,
                ManageBedsUpdatedData.bedCharges
              ) +
              totalCharges(
                ipdPatientUpdatedData.createdAt,
                ManageBedsUpdatedData.nursingCharges
              ) +
              totalCharges(
                ipdPatientUpdatedData.createdAt,
                ManageBedsUpdatedData.EMOCharges
              ) +
              totalCharges(
                ipdPatientUpdatedData.createdAt,
                ManageBedsUpdatedData.bioWasteCharges
              ) +
              totalCharges(
                ipdPatientUpdatedData.createdAt,
                ManageBedsUpdatedData.sanitizationCharges
              ),
          });

        await ipdPatientDischargeRecieptCreation.save();

        await IPDPatientDischargeRecieptModel.aggregate([
          {
            $group: {
              _id: "$uhid", // group by a constant to calculate the sum across all documents
              total: {
                $sum: {
                  $add: [
                    "$totalbedCharges",
                    "$totalNurseCharges",
                    "$totalEMOCharges",
                    "$totalBioWasteCharges",
                    "$totalSanitizationCharges",
                  ],
                },
              }, // calculate the sum of totalAmount
            },
          },
          {
            $project: {
              _id: 1, // exclude the _id field from the output
              total: 1, // include the total field in the output
            },
          },
          {
            $out: "FinalBill", // store the result in a new collection called "totals"
          },
        ])
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          });

        return res
          .status(200)
          .json({ message: "IPD Patient Discharged Successfully" });
      }
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
