const express = require("express");

const Router = express.Router();

const mongoose = require("mongoose");

require("../../DB/connection");

const TestPatientModel = require("../../Models/TestPatientSchema/TestPatientSchema");
const multer = require("multer");

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

Router.get("/TestOfPatient-GET-ALL", async (req, res) => {
  const Page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const searchTerm = req.query.search || "";
  try {
    const searchRegex = new RegExp(searchTerm, "i");
    const testPatients = await TestPatientModel.aggregate([
      {
        $lookup: {
          from: "patients",
          localField: "testPatientId",
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
        $lookup: {
          from: "doctors",
          localField: "prescribedByDoctor",
          foreignField: "doctorId",
          as: "DoctorData",
        },
      },
      {
        $unwind: {
          path: "$DoctorData",
        },
      },
      {
        $match: {
          $or: [
            { "patientData.patientName": { $regex: searchRegex } },
            { "patientData.patientPhone": { $regex: searchRegex } },
            { "patientData.patientPhone2": { $regex: searchRegex } },
            { "patientData.patientId": { $regex: searchRegex } },
          ],
        },
      },
    ])
      .sort({
        createdAt: -1,
      })
      .skip(Page * limit)
      .limit(limit);
    const totalDocuments = await TestPatientModel.aggregate([
      {
        $lookup: {
          from: "patients",
          localField: "testPatientId",
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
        $match: {
          $or: [
            { "patientData.patientName": { $regex: searchRegex } },
            { "patientData.patientPhone": { $regex: searchRegex } },
            { "patientData.patientPhone2": { $regex: searchRegex } },
            { "patientData.patientId": { $regex: searchRegex } },
          ],
        },
      },

      {
        $count: "totalDocument",
      },
    ]);
    return res.status(200).json({
      testPatients,
      totalDocuments: totalDocuments?.[0]?.totalDocument,
      totalPages: Math.ceil(totalDocuments?.[0]?.totalDocument / limit)
        ? Math.ceil(totalDocuments?.[0]?.totalDocument / limit)
        : 0,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/TestOfPatient-GET-ONE/:ID", async (req, res) => {
  const id = req.params.ID;
  try {
    const testPatient = await TestPatientModel.aggregate([
      { $match: { mainId: id } },
      {
        $lookup: {
          from: "patients",
          localField: "testPatientId",
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
        $lookup: {
          from: "doctors",
          localField: "prescribedByDoctor",
          foreignField: "doctorId",
          as: "DoctorData",
        },
      },
      {
        $unwind: {
          path: "$DoctorData",
        },
      },
    ]);

    if (!testPatient) {
      return res.status(404).json("Test Patient Not Found!");
    }

    if (testPatient) {
      return res.status(200).json(testPatient);
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/TestOfPatient-POST", upload.none(), async (req, res) => {
  const {
    testPatientId,
    prescribedByDoctor,
    patientType,
    note,
    total,
    paymentType,
  } = req.body;

  try {
    const test = req.body.test ? JSON.parse(req.body.test) : [];
    const newTestPatient = new TestPatientModel({
      mainId: "TP-" + generateUniqueId(),
      testPatientId: testPatientId,
      prescribedByDoctor: prescribedByDoctor,
      test: test.map((tst) => ({
        Name: tst.name,

        Price: tst.price,
        Quantity: tst.quantity,
        Total: tst.total,
      })),
      patientType: patientType,
      note: note,
      total: total,
      paymentType: paymentType,
    });
    return await newTestPatient.save().then((data) => {
      return res.status(200).json({
        message: "Test Of Patient Created Successfully!",
        data: data,
      });
    });
  } catch (error) {
    console.log(error);

    res.status(500).json("Internal Server Error");
  }
});

Router.put("/TestOfPatient-PUT/:ID", upload.none(), async (req, res) => {
  const id = req.params.ID;
  const {
    testPatientId,
    prescribedByDoctor,

    patientType,
    note,
    total,
    paymentType,
  } = req.body;

  try {
    const test = req.body.test ? JSON.parse(req.body.test) : [];
    console.log(test);
    const updatedTestPatient = await TestPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        testPatientId: testPatientId
          ? testPatientId
          : TestPatientModel.testPatientId,
        prescribedByDoctor: prescribedByDoctor
          ? prescribedByDoctor
          : TestPatientModel.prescribedByDoctor,
        test:
          test?.length > 0
            ? test.map((tst) => ({
                Name: tst.name,

                Price: tst.price,
                Quantity: tst.quantity,
                Total: tst.total,
              }))
            : TestPatientModel.test,
        patientType: patientType ? patientType : TestPatientModel.patientType,
        note: note ? note : TestPatientModel.note,
        total: total ? total : TestPatientModel.total,
        paymentType: paymentType ? paymentType : TestPatientModel.paymentType,
      }
    );

    if (!updatedTestPatient) {
      return res.status(404).json("Test Patient Data Not Found");
    }

    if (updatedTestPatient) {
      return res.status(200).json("Test Patient Data Updated Successfully!");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/TestOfPatient-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const testPatientData = await TestPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!testPatientData) {
      return res.status(404).json("Test Patient Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "Test Patient Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post(
  "/add-discount-test/:testPatientId",
  upload.none(),
  async (req, res) => {
    const testPatientId = req.params.testPatientId;
    const { discountPercentage, discountGivenBy } = req.body;

    try {
      const isTestPatientAvaliable = await TestPatientModel.findOne({
        mainId: testPatientId,
      });
      if (!isTestPatientAvaliable || isTestPatientAvaliable?.length === 0) {
        return res.status(404).json({ message: "No Test Patient Found" });
      }
      const totalFess = isTestPatientAvaliable?.total;
      const discountPercentageByDoctor = discountPercentage;
      const discountAmount = totalFess * (discountPercentageByDoctor / 100);
      const testPatientData = await TestPatientModel.findOneAndUpdate(
        {
          mainId: testPatientId,
        },
        {
          $set: {
            discountPercentage: discountPercentage,
            refundedAmount: discountAmount,
            finalChargedAmount: totalFess - discountAmount,
            discountGivenBy:discountGivenBy,
            discountAmount:discountAmount,
          },
        },
        { new: true }
      );
      return res.status(201).json({
        message: "Discount Given Successfully",
        data: testPatientData,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json("internal server error");
    }
  }
);
module.exports = Router;
