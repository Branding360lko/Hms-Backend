const express = require("express");

const Router = express.Router();

const IPD = require("../../Models/IPDSchema/IPDSchema");
const multer = require("multer");
const mongoose = require("mongoose");
const IPDPatientModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");

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

Router.get(
  "/get-patients-details-with-ipdId/:Id",
  upload.none(),
  async (req, res) => {
    const Id = req.params.Id;
    try {
      const patientsData = await IPDPatientModel.aggregate([
        {
          $match: {
            ipdPatientId: Id,
          },
        },
        {
          $lookup: {
            from: "patients",
            localField: "ipdPatientId",
            foreignField: "patientId",
            as: "PatientData",
          },
        },
      ]);
      if (!patientsData) {
        return res.status(403).json({ message: "No Data Found" });
      }
      return res
        .status(200)
        .json({ message: "Data Fetch Successfully", data: patientsData });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);
Router.get("/ipd-patients/:DoctorId", async (req, res) => {
  const DoctorId = req.params.DoctorId;
  try {
    const ipdPatients = await IPDPatientModel.aggregate([
      {
        $match: {
          $and: [{ ipdDoctorId: DoctorId }, { ipdPatientDischarged: false }],
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "ipdPatientId",
          foreignField: "patientId",
          as: "patientData",
        },
      },
      { $unwind: "$patientData" },
      {
        $lookup: {
          from: "doctors",
          localField: "ipdDoctorId",
          foreignField: "doctorId",
          as: "doctorData",
        },
      },
      { $unwind: "$doctorData" },
      {
        $project: {
          _id: 1,
          mainId: 1,
          ipdPatientId: 1,
          ipdDoctorId: 1,
          ipdNurseId: 1,
          ipdDepositAmount: 1,
          ipdFloorNo: 1,
          ipdBedNo: 1,
          ipdPatientNotes: 1,
          ipdPatientNurseRequestForDischarge: 1,
          ipdPatientDoctorRequestForDischarge: 1,
          ipdPatientNurseConfirmation: 1,
          ipdPatientDoctorConfirmation: 1,
          ipdPatientDischarged: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          patientName: "$patientData.patientName",
          doctorName: "$doctorData.doctorName",
        },
      },
    ]);
    if (!ipdPatients) {
      return res.status(403).json({ message: "No Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: ipdPatients });
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error");
  }
});
Router.get("/All-Ipd-Routes", async (req, res) => {
  try {
    const ipdData = await IPD.find({ discharge: false });
    if (!ipdData) {
      res.status(404).json("No Ipd Data Found");
    }
    return res
      .status(200)
      .json({ message: "Ipd Data Feteched Successfully", data: ipdData });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/IPD-Create", upload.none(), async (req, res) => {
  const {
    medicine,
    test,
    Symptoms,
    Note,
    ipdPatientData,
    isPatientsChecked,
    doctorId,
    VisitDateTime,
    ReferedDoctorId,
    ipdPatientMainId,
    submittedBy,
  } = req.body;

  try {
    const medicine = req.body.medicine ? JSON.parse(req.body.medicine) : [];
    const test = req.body.test ? JSON.parse(req.body.test) : [];

    const ipd = await IPD.create({
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
      ipdPatientData,
      isPatientsChecked,
      doctorId,
      VisitDateTime,
      ReferedDoctorId,
      ipdPatientMainId,
      submittedBy,
    });
    const ipdData = await IPD.findById(ipd?._id);

    if (!ipdData) {
      res.status(500).json("Something went wrong while Saving the IPD Data");
    }

    return res
      .status(201)
      .json({ message: "Data Created Successfully", data: ipdData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal Server Error" });
  }
});
Router.get("/get-one-ipd-data/:Id", async (req, res) => {
  const Id = req.params.Id;

  try {
    const IpdData = await IPD.aggregate([
      {
        $match: {
          ipdPatientMainId: Id,
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
          from: "ipdpatients",
          localField: "ipdPatientData",
          foreignField: "_id",
          as: "IpdPatientData",
        },
      },
      {
        $unwind: "$IpdPatientData",
      },

      {
        $lookup: {
          from: "patients",
          localField: "IpdPatientData.ipdPatientId",
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
        $lookup: {
          from: "doctors",
          localField: "ReferedDoctorId",
          foreignField: "_id",
          as: "ReferedDoctor",
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
          IpdPatientData: 1,
          patientsData: 1,
          doctorData: 1,
          ReferedDoctor: 1,
          submittedBy: 1,
        },
      },
    ]);

    if (IpdData.length === 0) {
      return res
        .status(404)
        .json({ message: "No IPD record found with the provided ID" });
    }

    return res.status(200).json(IpdData);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
Router.get("/get-one-ipd-data-total/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const IpdData = await IPD.aggregate([
      {
        $match: {
          ipdPatientMainId: Id,
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
        $lookup: {
          from: "doctors",
          localField: "ReferedDoctorId",
          foreignField: "_id",
          as: "ReferedDoctor",
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
        $project: {
          _id: 1,
          VisitDateTime: 1,
          doctorData: 1,
          ReferedDoctor: 1,
          doctorFeesDatails: "$doctorFeesDatails.doctorFee",
          RefereddoctorFeesDatails: "$RefereddoctorFeesDatails.doctorFee",
          DailyMedicinePriceTotal: { $sum: "$medicine.Price" },
          DailyTestPriceTotal: { $sum: "$test.Price" },
        },
      },
      {
        $group: {
          _id: "$_id",
          DailyMedicinePriceTotal: { $first: "$DailyMedicinePriceTotal" },
          DailyTestPriceTotal: { $first: "$DailyTestPriceTotal" },
          visitDate: { $first: "$VisitDateTime" },
          doctorFeesDatails: { $first: "$doctorFeesDatails" },
          RefereddoctorFeesDatails: { $first: "$RefereddoctorFeesDatails" },
        },
      },
      {
        $project: {
          _id: 0,
          DailyMedicinePriceTotal: 1,
          DailyTestPriceTotal: 1,
          visitDate: 1,
          doctorFeesDatails: 1,
          RefereddoctorFeesDatails: 1,
          doctorVisitCharge: {
            $cond: {
              if: { $ne: ["$RefereddoctorFeesDatails", []] },
              then: { $arrayElemAt: ["$RefereddoctorFeesDatails", 0] },
              else: { $arrayElemAt: ["$doctorFeesDatails", 0] },
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
          overallDoctorVisitCharge: { $sum: "$doctorVisitCharge" },
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

    if (IpdData.length === 0) {
      return res.status(403).json({ message: "No Data Found" });
    }

    res.status(200).json(IpdData);
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error");
  }
});

Router.put("/update-one-Ipd/:Id", upload.none(), async (req, res) => {
  const Id = req.params.Id;
  const { Symptoms, Note, test, medicine } = req.body;
  try {
    const ipdData = await IPD.findByIdAndUpdate(
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
    if (!ipdData) {
      res.status(403).json({ message: "Faild To Update Ipd Data" });
    }

    return res
      .status(200)
      .json({ message: "Ipd Data Updated Successfully", data: ipdData });
  } catch (error) {
    res.status(500).json("Something Went Wrong", error);
  }
});
Router.post("/update-ipdPatient-checked/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const ipdPatientChecked = await IPD.findById({ _id: Id });
    if (!ipdPatientChecked) {
      res.status(403).json("Failed While Fetching Patients Ipd Data");
    }
    ipdPatientChecked.isPatientsChecked = !ipdPatientChecked.isPatientsChecked;
    await ipdPatientChecked.save({ validateBeforeSave: false });

    return res.status(201).json({ message: "Successfully Ipd Value Updated" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
Router.get(
  "/get-all-ipd-patients-discharge-nurse/:nurseId",
  async (req, res) => {
    const Id = req.params.nurseId;
    try {
      const ipdPatientDischargeNurse = await IPDPatientModel.find({
        $and: [
          { ipdNurseId: Id },
          { ipdPatientNurseRequestForDischarge: true },
          { ipdPatientDoctorRequestForDischarge: true },
          { ipdPatientDischarged: false },
        ],
      });
      if (!ipdPatientDischargeNurse) {
        return res.status(403).json({ message: "No Data Found" });
      }
      return res.status(200).json({
        message: "Successfully Data Fetch",
        data: ipdPatientDischargeNurse,
      });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);
Router.get(
  "/get-all-ipd-patients-discharge-doctor/:doctorId",
  async (req, res) => {
    const Id = req.params.doctorId;
    try {
      const ipdPatientDischargeNurse = await IPDPatientModel.find({
        $and: [
          { ipdDoctorId: Id },
          { ipdPatientNurseRequestForDischarge: true },
          { ipdPatientDoctorRequestForDischarge: true },
          { ipdPatientDischarged: false },
        ],
      });
      if (!ipdPatientDischargeNurse) {
        return res.status(403).json({ message: "No Data Found" });
      }
      return res.status(200).json({
        message: "Successfully Data Fetch",
        data: ipdPatientDischargeNurse,
      });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);
Router.get("/IPDPatient-GET-ALL-Nurse/:nurseId", async (req, res) => {
  const Id = req.params.nurseId;
  try {
    const ipdPatientDischargeNurse = await IPDPatientModel.find({
      $and: [{ ipdNurseId: Id }, { ipdPatientDischarged: false }],
    }).sort({ createdAt: -1 });
    if (!ipdPatientDischargeNurse) {
      return res.status(403).json({ message: "No Data Found" });
    }
    return res.status(200).json({
      message: "Successfully Data Found",
      data: ipdPatientDischargeNurse,
    });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
Router.get("/IPDPatient-GET-ALL-doctor/:doctorId", async (req, res) => {
  const Id = req.params.doctorId;
  try {
    const ipdPatientDischargeNurse = await IPDPatientModel.find({
      $and: [{ ipdDoctorId: Id }, { ipdPatientDischarged: false }],
    });
    if (!ipdPatientDischargeNurse) {
      return res.status(403).json({ message: "No Data Found" });
    }
    return res.status(200).json({
      message: "Successfully Data Found",
      data: ipdPatientDischargeNurse,
    });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});

module.exports = Router;
