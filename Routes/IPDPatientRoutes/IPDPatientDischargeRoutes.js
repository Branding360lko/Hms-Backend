const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const IPDPatientDischargeRecieptModel = require("../../Models/IPDPatientSchema/IPDPatientDischargeRecieptSchema");

const IPDDoctorDischargeDetailsModel = require("../../Models/IPDPatientSchema/IPDDoctorDischargeDetailsSchema");

const IPDNurseDischargeDetailsModel = require("../../Models/IPDPatientSchema/IPDNurseDischargeDetailsSchema");

const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");

const IPDPatientModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");
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
      await IPDPatientDischargeRecieptModel.findOne({ IPDPatientRegId: id });

    if (!ipdPatientDischargeRecieptData) {
      return res
        .status(404)
        .json("IPD Patient Discharge Reciept Data Not Found");
    }

    const IPDPatientData = await IPDPatientModel.aggregate([
      {
        $match: { mainId: ipdPatientDischargeRecieptData.IPDPatientRegId },
      },
      {
        $lookup: {
          from: "managebeds",
          localField: "ipdBedNo", // Adjust this field as needed
          foreignField: "bedId", // Adjust this field as needed
          as: "bedData",
        },
      },
      { $unwind: "$bedData" },
      {
        $lookup: {
          from: "ipdnursedischargedetails",
          localField: "mainId",
          foreignField: "ipdPatientRegId",
          as: "NurseDischargeData",
        },
      },
      { $unwind: "$NurseDischargeData" },
      {
        $lookup: {
          from: "ipddoctordischargedetails",
          localField: "mainId",
          foreignField: "ipdPatientRegId",
          as: "DoctorDischargeData",
        },
      },
      { $unwind: "$DoctorDischargeData" },
    ]);
    return res.status(200).json({
      ipdPatientDischargeRecieptData: ipdPatientDischargeRecieptData,
      IPDPatientData: IPDPatientData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/IPDPatient-PUT-DISCHARGE/:Id", async (req, res) => {
  try {
    const id = req.params.Id;

    const { BHT, surgery, result } = req.body;

    const ipdPatientCheck = await IPDPatientModel.findOne({
      mainId: id,
    });

    if (ipdPatientCheck) {
      if (
        ipdPatientCheck.ipdPatientNurseConfirmation === true &&
        ipdPatientCheck.ipdPatientDoctorConfirmation === true
      ) {
        const ipdPatientUpdatedData = await IPDPatientModel.findOneAndUpdate(
          { mainId: id },
          {
            ipdPatientDischarged: true,
          }
        );

        if (!ipdPatientUpdatedData) {
          return res.status(404).json("IPD Patient Data Not Found");
        }

        // const totalTime = (time) => {
        //   let pastDate = new Date(time);
        //   let presentDate = new Date();

        //   let differenceInTime = presentDate.getTime() - pastDate.getTime();

        //   let differenceInDays = Math.round(
        //     differenceInTime / (1000 * 3600 * 24)
        //   );

        //   return differenceInDays + 1;
        // };

        // const totalCharges = (creationTime, charges) => {
        //   let time = totalTime(creationTime);

        //   let totalCharge = time * charges;

        //   return totalCharge;
        // };

        if (ipdPatientUpdatedData) {
          // console.log(ipdPatientUpdatedData.createdAt);
          // console.log(totalCharges(ipdPatientUpdatedData.createdAt));
          const ManageBedsUpdatedData = await ManageBedsModel.findOneAndUpdate(
            {
              bedId: ipdPatientUpdatedData.ipdBedNo,
            },
            { bedAvailableOrNot: true }
          );
          const ipdDischarge = await IPD.updateMany(
            {
              ipdPatientMainId: ipdPatientUpdatedData.mainId,
            },
            { discharge: true }
          );
          if (ManageBedsUpdatedData) {
            //   // console.log(totalCharges("2024-05-07T11:52:28.952+00:00", 500));
            //   // console.log(totalTime("2024-05-07T11:52:28.952+00:00"));
            //   // console.log(ManageBedsUpdatedData);
            //   const ipdPatientDischargeRecieptCreation =
            //     new IPDPatientDischargeRecieptModel({
            //       recieptId: "IPD-R-" + generateUniqueId(),
            //       uhid: ipdPatientUpdatedData?.ipdPatientId,
            //       numberOfDays: totalTime(ipdPatientUpdatedData.createdAt),
            //       totalbedCharges: totalCharges(
            //         ipdPatientUpdatedData.createdAt,
            //         ManageBedsUpdatedData.bedCharges
            //       ),
            //       totalNurseCharges: totalCharges(
            //         ipdPatientUpdatedData.createdAt,
            //         ManageBedsUpdatedData.nursingCharges
            //       ),
            //       totalEMOCharges: totalCharges(
            //         ipdPatientUpdatedData.createdAt,
            //         ManageBedsUpdatedData.EMOCharges
            //       ),
            //       totalBioWasteCharges: totalCharges(
            //         ipdPatientUpdatedData.createdAt,
            //         ManageBedsUpdatedData.bioWasteCharges
            //       ),
            //       totalSanitizationCharges: totalCharges(
            //         ipdPatientUpdatedData.createdAt,
            //         ManageBedsUpdatedData.sanitizationCharges
            //       ),
            //       subTotal:
            //         totalCharges(
            //           ipdPatientUpdatedData.createdAt,
            //           ManageBedsUpdatedData.bedCharges
            //         ) +
            //         totalCharges(
            //           ipdPatientUpdatedData.createdAt,
            //           ManageBedsUpdatedData.nursingCharges
            //         ) +
            //         totalCharges(
            //           ipdPatientUpdatedData.createdAt,
            //           ManageBedsUpdatedData.EMOCharges
            //         ) +
            //         totalCharges(
            //           ipdPatientUpdatedData.createdAt,
            //           ManageBedsUpdatedData.bioWasteCharges
            //         ) +
            //         totalCharges(
            //           ipdPatientUpdatedData.createdAt,
            //           ManageBedsUpdatedData.sanitizationCharges
            //         ),
            //     });
            //   await ipdPatientDischargeRecieptCreation.save();
            //   await IPDPatientDischargeRecieptModel.aggregate([
            //     {
            //       $group: {
            //         _id: "$uhid", // group by a constant to calculate the sum across all documents
            //         total: {
            //           $sum: {
            //             $add: [
            //               "$totalbedCharges",
            //               "$totalNurseCharges",
            //               "$totalEMOCharges",
            //               "$totalBioWasteCharges",
            //               "$totalSanitizationCharges",
            //             ],
            //           },
            //         }, // calculate the sum of totalAmount
            //       },
            //     },
            //     {
            //       $project: {
            //         _id: 1, // exclude the _id field from the output
            //         total: 1, // include the total field in the output
            //       },
            //     },
            //     {
            //       $out: "FinalBill", // store the result in a new collection called "totals"
            //     },
            //   ])
            //     .then((res) => {
            //       console.log(res);
            //     })
            //     .catch((err) => {
            //       console.log(err);
            //     });
            // return res
            //   .status(200)
            //   .json({ message: "IPD Patient Discharged Successfully" });

            // ---------------
            const newDischargeReciept = new IPDPatientDischargeRecieptModel({
              recieptId: "IPD-R-" + generateUniqueId(),
              IPDPatientRegId: ipdPatientUpdatedData.mainId,
              patientUHID: ipdPatientUpdatedData.ipdPatientId,
              BHT: BHT,
              surgery: surgery,
              bedId: ipdPatientUpdatedData.ipdBedNo,
              dateAndTimeOfDischarge: new Date(),
              result: result,
            });

            return await newDischargeReciept.save().then((data) =>
              res.status(200).json({
                message: "IPD Patient Discharged Successfully",
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

Router.put("/IPDPatientDischargeRequest-PUT/:id", async (req, res) => {
  try {
    const updatedValue = await IPDPatientModel.findOneAndUpdate(
      {
        mainId: req.params.id,
      },
      {
        ipdPatientNurseRequestForDischarge: true,
        ipdPatientDoctorRequestForDischarge: true,
      }
    );
    if (!updatedValue) {
      return res.status(404).json({ error: "IPD Patient data Not found" });
    }
    return res
      .status(200)
      .json({ message: "Resquest to discharge send successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put(
  "/IPDPatientDischarge-NurseDischargeDetails-PUT/:Id",
  async (req, res) => {
    const idPatientId = req.params.Id;

    const {
      nurseId,
      admittedFor,
      investigationORProcedure,
      conditionDuringDischarge,
      date,
      TreatmentGivenInBrief,
    } = req.body;
    try {
      const parsedTreatmentGivenInBrief = JSON.parse(TreatmentGivenInBrief);

      const updatedNurseDischargeDetailsUpdated =
        await IPDNurseDischargeDetailsModel.findOneAndUpdate(
          {
            ipdPatientRegId: idPatientId,
          },
          {
            nurseId: nurseId ? nurseId : IPDNurseDischargeDetailsModel.nurseId,
            admittedFor: admittedFor
              ? admittedFor
              : IPDNurseDischargeDetailsModel.admittedFor,
            investigationORProcedure: investigationORProcedure
              ? investigationORProcedure
              : IPDNurseDischargeDetailsModel.investigationORProcedure,
            conditionDuringDischarge: conditionDuringDischarge
              ? conditionDuringDischarge
              : IPDNurseDischargeDetailsModel.conditionDuringDischarge,
            date: date ? date : IPDNurseDischargeDetailsModel.date,
            TreatmentGivenInBrief: parsedTreatmentGivenInBrief
              ? parsedTreatmentGivenInBrief
              : IPDNurseDischargeDetailsModel.TreatmentGivenInBrief,
          }
        );

      if (!updatedNurseDischargeDetailsUpdated) {
        return res.status(404).json("IPD Patient Discharge Details Not Found");
      }

      // console.log(updatedNurseDischargeDetailsUpdated);

      if (updatedNurseDischargeDetailsUpdated) {
        const updatedIPDPatient = await IPDPatientModel.findOneAndUpdate(
          {
            mainId: updatedNurseDischargeDetailsUpdated.ipdPatientRegId,
          },
          {
            // ipdPatientNurseRequestForDischarge: true,
            ipdPatientNurseConfirmation: true,
          }
        );

        if (updatedIPDPatient) {
          return res.status(200).json({
            message: "IPD Patient Nurse Discharge Details has been updated",
          });
        }
      }
    } catch (error) {
      console.log(error);

      res.status(500).json("Internal Server Error");
    }
  }
);

Router.put(
  "/IPDPatientDischarge-DoctorDischargeDetails-PUT/:IpdPatientRegID",
  async (req, res) => {
    const id = req.params.IpdPatientRegID;

    const {
      doctorId,
      provisionalDiagnosis,
      finalDiagnosis,
      physicianInCharge,
      name,
      ICD,
      result,
      disease_Diagnose,
    } = req.body;
    try {
      const medicineAdviseDuringDischarge = req.body
        .medicineAdviseDuringDischarge
        ? JSON.parse(req.body.medicineAdviseDuringDischarge)
        : [];
      const adviseDuringDischarge = req.body.adviseDuringDischarge
        ? JSON.parse(req.body.adviseDuringDischarge)
        : [];
      const updatedIPDDoctorDischargeDetails =
        await IPDDoctorDischargeDetailsModel.findOneAndUpdate(
          { ipdPatientRegId: id },
          {
            doctorId: doctorId
              ? doctorId
              : IPDDoctorDischargeDetailsModel.doctorId,
            provisionalDiagnosis: provisionalDiagnosis
              ? provisionalDiagnosis
              : IPDDoctorDischargeDetailsModel.provisionalDiagnosis,
            finalDiagnosis: finalDiagnosis
              ? finalDiagnosis
              : IPDDoctorDischargeDetailsModel.finalDiagnosis,
            physicianInCharge: physicianInCharge
              ? physicianInCharge
              : IPDDoctorDischargeDetailsModel.physicianInCharge,
            name: name ? name : IPDDoctorDischargeDetailsModel.name,
            ICD: ICD ? ICD : IPDDoctorDischargeDetailsModel.ICD,
            result: result ? result : IPDDoctorDischargeDetailsModel.result,
            disease_Diagnose: disease_Diagnose
              ? disease_Diagnose
              : IPDDoctorDischargeDetailsModel.disease_Diagnose,
            adviseDuringDischarge: adviseDuringDischarge
              ? adviseDuringDischarge
              : IPDDoctorDischargeDetailsModel.adviseDuringDischarge,
            medicineAdviseDuringDischarge: medicineAdviseDuringDischarge
              ? medicineAdviseDuringDischarge
              : IPDDoctorDischargeDetailsModel.medicineAdviseDuringDischarge,
          }
        );

      if (!updatedIPDDoctorDischargeDetails) {
        return res.status(404).json("IPD Patient Discharge Details Not Found");
      }

      if (updatedIPDDoctorDischargeDetails) {
        const updateIPDPatient = await IPDPatientModel.findOneAndUpdate(
          {
            mainId: updatedIPDDoctorDischargeDetails.ipdPatientRegId,
          },
          {
            // ipdPatientDoctorRequestForDischarge: true,
            ipdPatientDoctorConfirmation: true,
          }
        );

        if (updateIPDPatient) {
          return res.status(200).json({
            message: "IPD Patient Doctor Discharge Details has been updated",
          });
        }
      }
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

module.exports = Router;
