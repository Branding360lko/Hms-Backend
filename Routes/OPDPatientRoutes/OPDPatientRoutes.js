const express = require("express");

const Router = express.Router();

require("../../DB/connection");
const multer = require("multer");
const OPDPatientModel = require("../../Models/OPDPatientSchema/OPDPatientSchema");

//
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
const generateUniqueId = async () => {
  try {
    // Get current date
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // const day = date.getDate().toString().padStart(2, "0");

    // Find the latest patient ID
    const latestOPDPatient = await OPDPatientModel.findOne(
      {},
      {},
      { sort: { mainId: -1 } }
    );
    // console.log(latestOPDPatient);

    // Extract the sequence part from the latest patient ID and increment it
    let sequence = 1;
    if (latestOPDPatient) {
      const latestOPDPatientId = latestOPDPatient.mainId;
      const sequencePart = latestOPDPatientId.substr(6); // Assuming the sequence part starts from the 9th character
      sequence = parseInt(sequencePart) + 1;
    }

    // Construct the new patient ID
    const paddedSequence = sequence.toString().padStart(4, "0");
    const uniqueId = `${year}${month}${paddedSequence}`;

    return uniqueId;
  } catch (error) {
    throw error;
  }
};

Router.get("/OPDPatient-GET-ALL", async (req, res) => {
  const {
    opdPatientId = "",
    patientName = "",
    patientMobileNumber = "",
    page = 1,
    limit,
  } = req.query;
  try {
    const skip = (Number(page) - 1) * Number(limit);

    let OPDPatientData = [];
    await OPDPatientModel.aggregate([
      {
        $sort: { _id: -1 },
      },
      {
        $lookup: {
          from: "patients",
          localField: "opdPatientId",
          foreignField: "patientId",
          as: "patientData",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "opdDoctorId",
          foreignField: "doctorId",
          as: "doctorData",
        },
      },
      {
        $lookup: {
          from: "doctorprofessionaldetails",
          localField: "opdDoctorId",
          foreignField: "doctorId",
          as: "doctorProfessionalData",
        },
      },
      {
        $unwind: { path: "$patientData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$doctorData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: "$doctorProfessionalData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          patientName: "$patientData.patientName",
          patientPhone: "$patientData.patientPhone",
        },
      },
      {
        $match: { opdPatientId: { $regex: opdPatientId, $options: "i" } },
      },
      {
        $match: { patientName: { $regex: patientName, $options: "i" } },
      },
      {
        $match: {
          patientPhone: { $regex: patientMobileNumber, $options: "i" },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: Number(limit),
      },
    ])
      .then((d) => {
        OPDPatientData = d;
      })
      .catch(() => {
        if (error) {
          OPDPatientData = [];
        }
      });
    // const OPDPatientData = await OPDPatientModel.find();

    let totalOPDPatient = await OPDPatientModel.countDocuments();
    if (opdPatientId !== "") {
      totalOPDPatient = await OPDPatientModel.countDocuments({
        opdPatientId: { $regex: opdPatientId, $options: "i" },
      });
    } else if (patientName !== "") {
      const totalOPDPatientCounts = await OPDPatientModel.aggregate([
        {
          $lookup: {
            from: "patients",
            localField: "opdPatientId",
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
          $count: "patientCount",
        },
      ])
        .then((d) => {
          totalOPDPatient = d[0].patientCount;
        })
        .catch((error) => {
          totalOPDPatient = 0;
        });
      // totalOPDPatient = totalOPDPatientCounts[0].patientName;
    } else if (patientMobileNumber !== "") {
      const totalOPDPatientCounts = await OPDPatientModel.aggregate([
        {
          $lookup: {
            from: "patients",
            localField: "opdPatientId",
            foreignField: "patientId",
            as: "patientData",
          },
        },
        {
          $unwind: { path: "$patientData", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            patientPhone: "$patientData.patientPhone",
          },
        },
        {
          $match: {
            patientPhone: { $regex: patientMobileNumber, $options: "i" },
          },
        },
        {
          $count: "patientCount",
        },
      ])
        .then((d) => {
          totalOPDPatient = d[0].patientCount;
        })
        .catch((error) => {
          totalOPDPatient = 0;
        });
      // totalOPDPatient = totalOPDPatientCounts[0].patientPhone;
    }

    // const totalOPDPatients = await OPDPatientModel.countDocuments({
    //   opdPatientId: { $regex: opdPatientId, $options: "i" },
    // });

    res.status(200).json({
      OPDPatientData,
      totalOPDPatient,
      totalPages: Math.ceil(Number(totalOPDPatient) / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.get("/OPDPatient-GET-ALL-with-doctorId/:doctorId", async (req, res) => {
  const Id = req.params.doctorId;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  console.log(page, limit);
  try {
    const OPDPatientData = await OPDPatientModel.aggregate([
      {
        $match: {
          opdDoctorId: Id,
        },
      },
      {
        $lookup: {
          from: "opds",
          localField: "_id",
          foreignField: "OpdPatientData",
          as: "opdPatientCheckData",
        },
      },
      // {
      //   $unwind: "$opdPatientCheckData",
      // },
      {
        $lookup: {
          from: "patients",
          localField: "opdPatientId",
          foreignField: "patientId",
          as: "patientData",
        },
      },
      { $unwind: "$patientData" },
      {
        $project: {
          _id: 1,
          mainId: 1,
          opdPatientId: 1,
          opdCaseId: 1,
          opdId: 1,
          opdDoctorId: 1,
          opdPatientBloodPressure: 1,
          opdPatientStandardCharges: 1,
          opdPatientPaymentMode: 1,
          opdDoctorVisitDate: 1,
          opdPatientNotes: 1,
          opdPatientCheckData: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          patientName: "$patientData.patientName",
        },
      },
    ])
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    const totalDocuments = await OPDPatientModel.countDocuments({
      opdDoctorId: Id,
    });
    res.status(200).json({
      OPDPatientData,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
Router.get("/OPDPatient-Search-with-doctorId/:doctorId", async (req, res) => {
  const Id = req.params.doctorId;
  const searchTerm = req.query.search || "";
  const Page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const searchRegex = new RegExp(searchTerm, "i");
    const searchData = await OPDPatientModel.aggregate([
      {
        $match: {
          opdDoctorId: Id,
        },
      },
      {
        $lookup: {
          from: "opds",
          localField: "_id",
          foreignField: "OpdPatientData",
          as: "opdPatientCheckData",
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "opdPatientId",
          foreignField: "patientId",
          as: "patientDetails",
        },
      },
      {
        $unwind: "$patientDetails",
      },
      {
        $match: {
          $or: [
            { "patientDetails.patientName": { $regex: searchRegex } },
            { "patientDetails.patientPhone": { $regex: searchRegex } },
            { "patientDetails.patientPhone2": { $regex: searchRegex } },
            { "patientDetails.patientId": { $regex: searchRegex } },
            { "patientDetails.patientId": { $regex: "uhid" + searchRegex } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          mainId: 1,
          opdPatientId: 1,
          opdCaseId: 1,
          opdId: 1,
          opdDoctorId: 1,
          opdPatientBloodPressure: 1,
          opdPatientStandardCharges: 1,
          opdPatientPaymentMode: 1,
          opdDoctorVisitDate: 1,
          opdPatientNotes: 1,
          opdPatientCheckData: 1,
          opdPatientDiscountAlloted: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          patientName: "$patientDetails.patientName",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .skip(Page * limit)
      .limit(limit);
    const totalDocuments = await OPDPatientModel.aggregate([
      {
        $match: {
          opdDoctorId: Id,
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "opdPatientId",
          foreignField: "patientId",
          as: "patientDetails",
        },
      },
      {
        $unwind: "$patientDetails",
      },
      {
        $match: {
          $or: [
            { "patientDetails.patientName": { $regex: searchRegex } },
            { "patientDetails.patientPhone": { $regex: searchRegex } },
            { "patientDetails.patientPhone2": { $regex: searchRegex } },
            { "patientDetails.patientId": { $regex: searchRegex } },
            { "patientDetails.patientId": { $regex: "uhid" + searchRegex } },
          ],
        },
      },

      {
        $count: "totalDocument",
      },
    ]);

    if (!searchData) {
      return res
        .status(403)
        .json({ message: "No Patients Found With This Doctor Id" });
    }
    return res.status(200).json({
      searchData,
      totalDocuments: totalDocuments?.[0]?.totalDocument,
      totalPages: Math.ceil(totalDocuments?.[0]?.totalDocument / limit)
        ? Math.ceil(totalDocuments?.[0]?.totalDocument / limit)
        : 0,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error");
  }
});
Router.get("/OPDPatient-GET-ONE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    const OPDPatientData = await OPDPatientModel.findOne({
      mainId: id,
    });

    if (!OPDPatientData) {
      return res.status(404).json("Patient Not Found");
    }

    return res.status(200).json(OPDPatientData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.post(
  "/OPDPatient-Refund-by-doctor/:opdPatientId",
  upload.none(),
  async (req, res) => {
    const Id = req.params.opdPatientId;
    const { refundPercentage, refundAlotedByDoctor } = req.body;
    try {
      const opdPatientData = await OPDPatientModel.findOneAndUpdate(
        {
          mainId: Id,
        },
        [
          {
            $set: {
              opdPatientRefundedAmount: {
                $multiply: [
                  { $toDouble: "$opdPatientStandardCharges" },
                  refundPercentage / 100,
                ],
              },
              opdPatientFinalChargedAmount: {
                $subtract: [
                  { $toDouble: "$opdPatientStandardCharges" },
                  {
                    $toDouble: {
                      $multiply: [
                        { $toDouble: "$opdPatientStandardCharges" },
                        refundPercentage / 100,
                      ],
                    },
                  },
                ],
              },
              opdPatientDicountPercentageByDoctor: refundPercentage,
              opdPatientDicountPercentageByDoctorId: refundAlotedByDoctor,
              opdPatientDiscountAlloted: true,
            },
          },
        ],
        {
          new: true,
        }
      );
      if (!opdPatientData) {
        return res
          .status(403)
          .json({ message: "No Patient Finds With This Id" });
      }
      res.status(201).json({ message: "Discount Give Successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);
Router.post("/OPDPatient-POST", async (req, res) => {
  const {
    opdPatientId,
    opdCaseId,
    opdId,
    opdDoctorId,
    opdPatientBloodPressure,
    opdPatientStandardCharges,
    opdPatientPaymentMode,
    // opdDoctorVisitDate,
    opdPatientNotes,
  } = req.body;
  try {
    if (!opdPatientId && !opdDoctorId) {
      return res
        .status(422)
        .json({ error: "Please fill the field completely!" });
    }

    const newOPDPatientData = new OPDPatientModel({
      mainId: await generateUniqueId(),
      opdPatientId: opdPatientId,
      opdCaseId: opdCaseId,
      opdId: opdId,
      opdDoctorId: opdDoctorId,
      opdPatientBloodPressure: opdPatientBloodPressure,
      opdPatientStandardCharges: opdPatientStandardCharges,
      opdPatientPaymentMode: opdPatientPaymentMode,
      opdDoctorVisitDate: new Date(),
      opdPatientNotes: opdPatientNotes,
      opdPatientFinalChargedAmount: opdPatientStandardCharges,
      opdPatientRefundedAmount: 0,
    });

    return await newOPDPatientData.save().then((data) =>
      res.status(200).json({
        message: "OPD Patient Added Successfully",
        data: data,
      })
    );
  } catch (error) {
    console.log(error);

    res.status(500).json("Internal Server Error");
  }
});

Router.put("/OPDPatient-PUT/:Id", async (req, res) => {
  const id = req.params.Id;

  const {
    opdPatientId,
    opdCaseId,
    opdId,
    opdDoctorId,
    opdPatientBloodPressure,
    opdPatientStandardCharges,
    opdPatientPaymentMode,
    // opdDoctorVisitDate,
    opdPatientNotes,
  } = req.body;
  try {
    const existingPatientData = await OPDPatientModel.findOne({ mainId: id });
    const standardCharges = opdPatientStandardCharges
      ? opdPatientStandardCharges
      : existingPatientData.opdPatientStandardCharges;

    const discountPercentage =
      existingPatientData.opdPatientDicountPercentageByDoctor || 0;

    const opdPatientRefundedAmount =
      standardCharges * (discountPercentage / 100);

    const opdPatientFinalChargedAmount =
      standardCharges - opdPatientRefundedAmount;

    const OPDPatientData = await OPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        $set: {
          opdPatientId: opdPatientId || existingPatientData.opdPatientId,
          opdCaseId: opdCaseId || existingPatientData.opdCaseId,
          opdId: opdId || existingPatientData.opdId,
          opdDoctorId: opdDoctorId || existingPatientData.opdDoctorId,
          opdPatientBloodPressure:
            opdPatientBloodPressure ||
            existingPatientData.opdPatientBloodPressure,
          opdPatientStandardCharges: standardCharges,
          opdPatientPaymentMode:
            opdPatientPaymentMode || existingPatientData.opdPatientPaymentMode,
          opdPatientNotes:
            opdPatientNotes || existingPatientData.opdPatientNotes,
          opdPatientRefundedAmount: opdPatientRefundedAmount,
          opdPatientFinalChargedAmount: opdPatientFinalChargedAmount,
          opdPatientDiscountAlloted: true,
        },
      },
      { new: true }
    );

    if (!OPDPatientData) {
      return res.status(404).json("OPD Patient data not found");
    }

    return res.status(200).json({
      message: "OPD Patient data Updated successfully",
      data: OPDPatientData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/OPDPatient-DELETE/:Id", async (req, res) => {
  const id = req.params.Id;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const OPDPatientData = await OPDPatientModel.findOneAndUpdate(
      { mainId: id },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!OPDPatientData) {
      return res.status(404).json("OPD Patient data not found");
    }
    return res
      .status(200)
      .json({ message: "OPD Patient Data Deleted successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.get("/download-opd-list/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const opdPatients = await OPDPatientModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "opdPatientId",
          foreignField: "patientId",
          as: "patientData",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "opdDoctorId",
          foreignField: "doctorId",
          as: "DoctorData",
        },
      },
      {
        $project: {
          Name: "$patientData.patientName",
          Doctor: "$DoctorData.doctorName",
          opdPatientId: 1,
          opdPatientStandardCharges: 1,
          opdPatientDicountPercentageByDoctor: 1,
          opdPatientFinalChargedAmount: 1,
          opdPatientRefundedAmount: 1,
          opdPatientPaymentMode: 1,
        },
      },
    ]);
    if (opdPatients.length === 0) {
      return res.status(404).json({ error: `No Patient Found On ${date}` });
    }
    const json2csv = require("json2csv").parse;
    const formattedData = opdPatients.map((patient, index) => ({
      SN: index + 1,
      PatientId: patient.opdPatientId,
      Name: patient.Name.join(", "),
      Doctor: patient.Doctor.join(", "),
      StandardCharges: patient.opdPatientStandardCharges,
      DicountPercentage: patient.opdPatientDicountPercentageByDoctor || 0,
      RefundedAmount: patient.opdPatientRefundedAmount || 0,
      FinalChargedAmount: patient.opdPatientFinalChargedAmount || "",
      PaymentMode: patient.opdPatientPaymentMode || "",
    }));

    const csv = json2csv(formattedData, { header: true });
    res.header("Content-Type", "text/csv");
    res.attachment(`opd-patients-${date}.csv`);
    res.send(csv);
  } catch (error) {
    console.log(error);

    res.status(500).send("Error fetching data");
  }
});
Router.get("/get-opd-data-with-patient-data/:mainId", async (req, res) => {
  const mainId = req.params.mainId;
  try {
    if (!mainId || mainId === null || mainId === undefined) {
      return res.status(404).json({ message: "No Opd Patient Id Provided" });
    }
    const opdPatientData = await OPDPatientModel.aggregate([
      {
        $match: {
          mainId: mainId,
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "opdPatientId",
          foreignField: "patientId",
          as: "patientData",
        },
      },
      
    ]);
    return res
      .status(200)
      .json({ message: "Opd Data Fetch Succesfully", data: opdPatientData?.[0] });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
module.exports = Router;
