const express = require("express");

const Router = express.Router();

const IPD = require("../../Models/IPDSchema/IPDSchema");
const multer = require("multer");
const mongoose = require("mongoose");

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

Router.get("/All-Ipd-Routes", async (req, res) => {
  try {
    const ipdData = await IPD.find({});
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
  } = req.body;
  console.log(
    medicine,
    test,
    Symptoms,
    Note,
    ipdPatientData,
    isPatientsChecked,
    doctorId,
    VisitDateTime
  );
  try {
    const medicine = req.body.medicine ? JSON.parse(req.body.medicine) : [];
    const test = req.body.test ? JSON.parse(req.body.test) : [];

    const ipd = await IPD.create({
      Note,
      Symptoms,
      medicine: medicine.map((med) => ({
        Name: med.name,
        Quantity: med.quantity,
        Price: med.price,
      })),
      test: test.map((tst) => ({
        Name: tst.name,
        Quantity: tst.quantity,
        Price: tst.price,
      })),
      ipdPatientData,
      isPatientsChecked,
      doctorId,
      VisitDateTime,
      ReferedDoctorId,
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
      { $unwind: { path: "$doctorData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$ReferedDoctor", preserveNullAndEmptyArrays: true } },
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
          doctorFeesDatails: 1,
          RefereddoctorFeesDatails: 1,
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
          doctorFeesDatails: { $first: "$doctorFeesDatails.doctorFee" },
          RefereddoctorFeesDatails: {
            $first: "$RefereddoctorFeesDatails.doctorFee",
          },
        },
      },
      {
        $group: {
          _id: null,
          overAllData: { $push: "$$ROOT" },
          overallTotalMedicinePrice: { $sum: "$DailyMedicinePriceTotal" },
          overallTotalTestPrice: { $sum: "$DailyTestPriceTotal" },
          overallDoctorVisitCharge: {
            $sum: {
              $cond: {
                if: { $ne: ["$RefereddoctorFeesDatails", []] },
                then: { $arrayElemAt: ["$RefereddoctorFeesDatails", 0] },
                else: { $arrayElemAt: ["$doctorFeesDatails", 0] },
              },
            },
          },
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

    if (!IpdData.length) {
      return res.status(403).json({ message: "No Data Found" });
    }

    res.status(200).json(IpdData[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error");
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
      { $unwind: { path: "$doctorData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$ReferedDoctor", preserveNullAndEmptyArrays: true } },
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
          doctorFeesDatails: 1,
          RefereddoctorFeesDatails: 1,
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
          doctorFeesDatails: { $first: "$doctorFeesDatails.doctorFee" },
          RefereddoctorFeesDatails: {
            $first: "$RefereddoctorFeesDatails.doctorFee",
          },
        },
      },
      {
        $group: {
          _id: null,
          overAllData: { $push: "$$ROOT" },
          overallTotalMedicinePrice: { $sum: "$DailyMedicinePriceTotal" },
          overallTotalTestPrice: { $sum: "$DailyTestPriceTotal" },
          overallDoctorVisitCharge: {
            $sum: {
              $cond: {
                if: { $ne: ["$RefereddoctorFeesDatails", []] },
                then: { $arrayElemAt: ["$RefereddoctorFeesDatails", 0] },
                else: { $arrayElemAt: ["$doctorFeesDatails", 0] },
              },
            },
          },
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

    if (!IpdData.length) {
      return res.status(403).json({ message: "No Data Found" });
    }

    res.status(200).json(IpdData[0]);
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

module.exports = Router;
