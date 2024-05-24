const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const BillingModel = require("../../Models/BillingSchema/BillingSchema");

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

Router.get("/Billing-GET-ALL", async (req, res) => {
  try {
    const billingData = await BillingModel.find();

    if (billingData) {
      return res.status(200).json(billingData);
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/Billing-GET-ONE/:Id", async (req, res) => {
  const id = req.params.Id;
  try {
    const billingData = await BillingModel.findOne({ billingId: id });

    if (!billingData) {
      return res.status(404).json("Billing Details Not Found");
    }
    return res.status(200).json(billingData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/Billing-POST", async (req, res) => {
  const {
    billingPatientId,
    billingPatientName,
    billing_OPD_IPD_Emergency,
    billingAdmittingDoctorId,
    billing_MR_No,
    billing_IP_No,
    billingPatientAge,
    billingPatientGender,
    billingRoomNo,
    billingBedNo,
    billingBedCategory,
    billingOccBedCategory,
    billing_BillDateAndTime,
    billing_AdmissionDateAndTime,
    billing_DischargeDateAndTime,
    billingPatientCategory,
    billingTariffCategory,
    billingPaymentMode,
    billingPaidAmount,
    billingCreditNoteAmount,
    billingTAX,
    billingDiscount,
    allItems,
    allBasicHospitalCharges,
    allBedChargesItems,
    allBEDSideProcedures,
    allDoctorVisitCharges,
    allLaboratoryInvestigations,
    allMedicines,
    allOtherMiscCharges,
    allProcedures,
    allOtherServiceCharges,
    billAmount,
    billAmountInWords,
    billNetAmount,
  } = req.body;
  try {
    if (
      !billingPatientName &&
      !billing_OPD_IPD_Emergency &&
      !billingAdmittingDoctorId &&
      !billing_MR_No &&
      !billing_IP_No &&
      !billingPatientAge &&
      !billingPatientGender &&
      !billing_BillDateAndTime &&
      !billing_AdmissionDateAndTime &&
      !billing_DischargeDateAndTime &&
      !billingPatientCategory &&
      !billingTariffCategory &&
      !billingPaymentMode &&
      !billAmount &&
      !billAmountInWords &&
      !billNetAmount
    ) {
      return res.status(422).json("Please fill the required fields!");
    }
    const newBillingData = new BillingModel({
      billingId: "FB-" + generateUniqueId(),
      billingPatientId: billingPatientId,
      billingPatientName: billingPatientName,
      billing_OPD_IPD_Emergency: billing_OPD_IPD_Emergency,
      billingAdmittingDoctorId: billingAdmittingDoctorId,
      billing_MR_No: billing_MR_No,
      billing_IP_No: billing_IP_No,
      billingPatientAge: billingPatientAge,
      billingPatientGender: billingPatientGender,
      billingRoomNo: billingRoomNo,
      billingBedNo: billingBedNo,
      billingBedCategory: billingBedCategory,
      billingOccBedCategory: billingOccBedCategory,
      billing_BillDateAndTime: billing_BillDateAndTime,
      billing_AdmissionDateAndTime: billing_AdmissionDateAndTime,
      billing_DischargeDateAndTime: billing_DischargeDateAndTime,
      billingPatientCategory: billingPatientCategory,
      billingTariffCategory: billingTariffCategory,
      billingPaymentMode: billingPaymentMode,
      billingPaidAmount: billingPaidAmount,
      billingCreditNoteAmount: billingCreditNoteAmount,
      billingTAX: billingTAX,
      billingDiscount: billingDiscount,
      allItems: allItems,
      allBasicHospitalCharges: allBasicHospitalCharges,
      allBedChargesItems: allBedChargesItems,
      allBEDSideProcedures: allBEDSideProcedures,
      allDoctorVisitCharges: allDoctorVisitCharges,
      allLaboratoryInvestigations: allLaboratoryInvestigations,
      allMedicines: allMedicines,
      allOtherMiscCharges: allOtherMiscCharges,
      allProcedures: allProcedures,
      allOtherServiceCharges: allOtherServiceCharges,
      billAmount: billAmount,
      billAmountInWords: billAmountInWords,
      billNetAmount: billNetAmount,
    });

    return await newBillingData
      .save()
      .then((data) =>
        res
          .status(200)
          .json({ message: "Bill Created Successfully!", data: data })
      );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/Billing-PUT/:Id", async (req, res) => {
  const id = req.params.Id;

  const {
    billingPatientId,
    billingPatientName,
    billing_OPD_IPD_Emergency,
    billingAdmittingDoctorId,
    billing_MR_No,
    billing_IP_No,
    billingPatientAge,
    billingPatientGender,
    billingRoomNo,
    billingBedNo,
    billingBedCategory,
    billingOccBedCategory,
    billing_BillDateAndTime,
    billing_AdmissionDateAndTime,
    billing_DischargeDateAndTime,
    billingPatientCategory,
    billingTariffCategory,
    billingPaymentMode,
    billingPaidAmount,
    billingCreditNoteAmount,
    billingTAX,
    billingDiscount,
    allItems,
    allBasicHospitalCharges,
    allBedChargesItems,
    allBEDSideProcedures,
    allDoctorVisitCharges,
    allLaboratoryInvestigations,
    allMedicines,
    allOtherMiscCharges,
    allProcedures,
    allOtherServiceCharges,
    billAmount,
    billAmountInWords,
    billNetAmount,
  } = req.body;
  try {
    const billingData = await BillingModel.findOneAndUpdate(
      {
        billingId: id,
      },
      {
        billingPatientId: billingPatientId
          ? billingPatientId
          : BillingModel.billingPatientId,
        billingPatientName: billingPatientName
          ? billingPatientName
          : BillingModel.billingPatientName,
        billing_OPD_IPD_Emergency: billing_OPD_IPD_Emergency
          ? billing_OPD_IPD_Emergency
          : BillingModel.billing_OPD_IPD_Emergency,
        billingAdmittingDoctorId: billingAdmittingDoctorId
          ? billingAdmittingDoctorId
          : BillingModel.billingAdmittingDoctorId,
        billing_MR_No: billing_MR_No
          ? billing_MR_No
          : BillingModel.billing_MR_No,
        billing_IP_No: billing_IP_No
          ? billing_IP_No
          : BillingModel.billing_IP_No,
        billingPatientAge: billingPatientAge
          ? billingPatientAge
          : BillingModel.billingPatientAge,
        billingPatientGender: billingPatientGender
          ? billingPatientGender
          : BillingModel.billingPatientGender,
        billingRoomNo: billingRoomNo
          ? billingRoomNo
          : BillingModel.billingRoomNo,
        billingBedNo: billingBedNo ? billingBedNo : BillingModel.billingBedNo,
        billingBedCategory: billingBedCategory
          ? billingBedCategory
          : BillingModel.billingBedCategory,
        billingOccBedCategory: billingOccBedCategory
          ? billingOccBedCategory
          : BillingModel.billingOccBedCategory,
        billing_BillDateAndTime: billing_BillDateAndTime
          ? billing_BillDateAndTime
          : BillingModel.billing_BillDateAndTime,
        billing_AdmissionDateAndTime: billing_AdmissionDateAndTime
          ? billing_AdmissionDateAndTime
          : BillingModel.billing_AdmissionDateAndTime,
        billing_DischargeDateAndTime: billing_DischargeDateAndTime
          ? billing_DischargeDateAndTime
          : BillingModel.billing_DischargeDateAndTime,
        billingPatientCategory: billingPatientCategory
          ? billingPatientCategory
          : BillingModel.billingPatientCategory,
        billingTariffCategory: billingTariffCategory
          ? billingTariffCategory
          : BillingModel.billingTariffCategory,
        billingPaymentMode: billingPaymentMode
          ? billingPaymentMode
          : BillingModel.billingPaymentMode,
        billingPaidAmount: billingPaidAmount
          ? billingPaidAmount
          : BillingModel.billingPaidAmount,
        billingCreditNoteAmount: billingCreditNoteAmount
          ? billingCreditNoteAmount
          : BillingModel.billingCreditNoteAmount,
        billingTAX: billingTAX ? billingTAX : BillingModel.billingTAX,
        billingDiscount: billingDiscount
          ? billingDiscount
          : BillingModel.billingDiscount,
        allItems: allItems ? allItems : BillingModel.allItems,
        allBasicHospitalCharges: allBasicHospitalCharges
          ? allBasicHospitalCharges
          : BillingModel.allBasicHospitalCharges,
        allBedChargesItems: allBedChargesItems
          ? allBedChargesItems
          : BillingModel.allBedChargesItems,
        allBEDSideProcedures: allBEDSideProcedures
          ? allBEDSideProcedures
          : BillingModel.allBEDSideProcedures,
        allDoctorVisitCharges: allDoctorVisitCharges
          ? allDoctorVisitCharges
          : BillingModel.allDoctorVisitCharges,
        allLaboratoryInvestigations: allLaboratoryInvestigations
          ? allLaboratoryInvestigations
          : BillingModel.allLaboratoryInvestigations,
        allMedicines: allMedicines ? allMedicines : BillingModel.allMedicines,
        allOtherMiscCharges: allOtherMiscCharges
          ? allOtherMiscCharges
          : BillingModel.allOtherMiscCharges,
        allProcedures: allProcedures
          ? allProcedures
          : BillingModel.allProcedures,
        allOtherServiceCharges: allOtherServiceCharges
          ? allOtherServiceCharges
          : BillingModel.allOtherServiceCharges,
        billAmount: billAmount ? billAmount : BillingModel.billAmount,
        billAmountInWords: billAmountInWords
          ? billAmountInWords
          : BillingModel.billAmountInWords,
        billNetAmount: billNetAmount
          ? billNetAmount
          : BillingModel.billNetAmount,
      }
    );

    if (!billingData) {
      return res.status(404).json("Billing Details Not Found");
    }

    return res.status(200).json({
      message: "Billing Details Updated successfully",
      data: billingData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/Billing-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;
  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const billingData = await BillingModel.findOneAndUpdate(
      { billingId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!billingData) {
      return res.status(404).json("Billing Details Not Found!");
    }
    return res
      .status(200)
      .json({ message: "Billing Details Deleted Successfully!" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
