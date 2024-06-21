const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillingSchema = new Schema(
  {
    billingId: {
      type: String,
      required: true,
    },
    billingPatientId: {
      type: String,
    },
    billingPatientName: {
      type: String,
      required: true,
    },
    billing_OPD_IPD_Emergency: {
      type: String,
      required: true,
    },
    billingAdmittingDoctorId: {
      type: String,
      required: true,
    },
    billing_MR_No: {
      type: String,
      required: true,
    },
    billing_IP_No: {
      type: String,
      required: true,
    },
    billingPatientAge: {
      type: Number,
      required: true,
    },
    billingPatientGender: {
      type: String,
      required: true,
    },
    billingRoomNo: {
      type: String,
    },
    billingBedNo: {
      type: String,
    },
    billingBedCategory: {
      type: String,
    },
    billingOccBedCategory: {
      type: String,
    },
    billing_BillDateAndTime: {
      type: String,
      required: true,
    },
    billing_AdmissionDateAndTime: {
      type: String,
      required: true,
    },
    billing_DischargeDateAndTime: {
      type: String,
      required: true,
    },
    billingPatientCategory: {
      type: String,
      required: true,
    },
    billingTariffCategory: {
      type: String,
      required: true,
    },
    billingPaymentMode: {
      type: String,
      required: true,
    },
    billingPaidAmount: {
      type: Number,
    },
    billingCreditNoteAmount: {
      type: Number,
    },
    billingTAX: {
      type: Number,
    },
    billingDiscount: {
      type: Number,
    },
    allItems: {
      type: Array,
    },
    allBasicHospitalCharges: {
      type: Array,
    },
    allBedChargesItems: {
      type: Array,
    },
    allBEDSideProcedures: {
      type: Array,
    },
    allDoctorVisitCharges: {
      type: Array,
    },
    allLaboratoryInvestigations: {
      type: Array,
    },
    allMedicines: {
      type: Array,
    },
    allOtherMiscCharges: {
      type: Array,
    },
    allProcedures: {
      type: Array,
    },
    allOtherServiceCharges: {
      type: Array,
    },
    billAmount: {
      type: Number,
      required: true,
    },
    billAmountInWords: {
      type: String,
      required: true,
    },
    billNetAmount: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: String,
    },
  },
  { timestamps: true }
);

const BillingModel = mongoose.model("Billing", BillingSchema);

module.exports = BillingModel;
