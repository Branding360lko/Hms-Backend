const express = require("express");

const Router = express.Router();

const multer = require("multer");

const path = require("path");

const { v4: uuidv4 } = require("uuid");

const fs = require("fs");

require("../../DB/connection");

const NurseModel = require("../../Models/NurseSchema/NurseSchema");

const generateUniqueId = async () => {
  try {
    // Get current date
    const date = new Date();
    const year = date.getFullYear().toString();
    // const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // const day = date.getDate().toString().padStart(2, "0");

    // Find the latest patient ID
    const latestNurse = await NurseModel.findOne(
      {},
      {},
      { sort: { nurseId: -1 } }
    );
    // console.log(latestPatient)

    // Extract the sequence part from the latest patient ID and increment it
    let sequence = 1;
    if (latestNurse) {
      const latestNurseId = latestNurse.nurseId;
      // const sequencePart = latestPatientId.substr(9, 4); // Assuming the sequence part starts from the 9th character
      const sequencePart = latestNurseId.substr(7);
      sequence = parseInt(sequencePart) + 1;
    }

    // Construct the new patient ID
    // const paddedSequence = sequence.toString().padStart(6, "0");
    const paddedSequence = sequence.toString().padStart(4, "0");
    const uniqueId = `NUR${year}${paddedSequence}`;

    return uniqueId;
  } catch (error) {
    throw error;
  }
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

Router.get("/Nurse-GET-ALL", async (req, res) => {
  const {
    nurseIdForSearching = "",
    nurseNameForSearching = "",
    nurseMobileNoForSearching = "",
    page = 1,
    limit,
  } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    if (limit) {
      const nurses = await NurseModel.aggregate([
        {
          $sort: { _id: -1 },
        },
        {
          $addFields: {
            nursePhoneNumberAsString: {
              $toString: "$nursePhone",
            },
          },
        },
        {
          $match: { nurseId: { $regex: nurseIdForSearching, $options: "i" } },
        },
        {
          $match: {
            nurseName: { $regex: nurseNameForSearching, $options: "i" },
          },
        },
        {
          $match: {
            nursePhoneNumberAsString: {
              $regex: nurseMobileNoForSearching,
              $options: "i",
            },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: Number(limit),
        },
      ]);
      // const nurses = await NurseModel.find();
      let totalNurses = await NurseModel.countDocuments();

      if (nurseIdForSearching !== "") {
        totalNurses = await NurseModel.countDocuments({
          nurseId: { $regex: nurseIdForSearching, $options: "i" },
        });
      } else if (nurseNameForSearching !== "") {
        totalNurses = await NurseModel.countDocuments({
          nurseName: { $regex: nurseNameForSearching, $options: "i" },
        });
      } else if (nurseMobileNoForSearching !== "") {
        const totalNursesData = await NurseModel.aggregate([
          {
            $addFields: {
              nursePhoneNumberAsString: {
                $toString: "$nursePhone",
              },
            },
          },
          {
            $match: {
              nursePhoneNumberAsString: {
                $regex: nurseMobileNoForSearching,
                $options: "i",
              },
            },
          },
          {
            $count: "nurseCount",
          },
        ]);
        totalNurses = totalNursesData[0].nurseCount;
      }

      return res.status(200).json({
        nurses,
        totalNurses,
        totalPages: Math.ceil(Number(totalNurses) / Number(limit)),
        currentPage: Number(page),
      });
    } else if (!limit) {
      const allNurses = await NurseModel.find();

      if (allNurses) {
        res.status(200).json(allNurses);
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.get("/Nurse-GET-ONE/:nurseId", async (req, res) => {
  try {
    const id = req.params.nurseId;

    const nurseData = await NurseModel.findOne({ nurseId: id });

    if (!nurseData) {
      return res.status(404).json({ error: "Nurse data not found!" });
    }
    return res.status(200).json(nurseData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.post("/Nurse-POST", upload.single("nurseImage"), async (req, res) => {
  const { nurseName, nurseEmail, nursePhone, nurseQualification, nurseAge } =
    req.body;

  try {
    const nurseImage = req.file ? req.file.filename : "";

    const newNurse = new NurseModel({
      nurseId: await generateUniqueId(),
      nurseName: nurseName,
      nurseEmail: nurseEmail,
      nursePhone: nursePhone,
      nurseQualification: nurseQualification,
      nurseAge: nurseAge,
      nurseImage: nurseImage !== "" ? nurseImage : "",
    });

    return await newNurse
      .save()
      .then((data) =>
        res.json({ message: "Nurse Created Successfully", data: data })
      );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.put(
  "/Nurse-PUT/:nurseId",
  upload.single("nurseImage"),
  async (req, res) => {
    const { nurseName, nurseEmail, nursePhone, nurseQualification, nurseAge } =
      req.body;
    const id = req.params.nurseId;

    try {
      const nurseImage = req.file ? req.file.filename : "";

      if (nurseImage !== "") {
        const filePath = path.dirname(
          `../../../backend/assets/images/${NurseModel.patientImage}`
        );
        const previousNurseData = await NurseModel.findOne({
          nurseId: id,
        });
        if (previousNurseData) {
          console.log(`${filePath}/${previousNurseData.nurseImage}`);
          // fs.unlinkSync(`${filePath}/${previousPatientData.patientImage}`);
          fs.unlink(
            "public" + `${filePath}/${previousNurseData.nurseImage}`,
            (err) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log("File deleted successfully");
            }
          );
        }
      }

      const updatedNurseData = await NurseModel.findOneAndUpdate(
        {
          nurseId: id,
        },
        {
          nurseName: nurseName ? nurseName : NurseModel.nurseName,
          nurseEmail: nurseEmail ? nurseEmail : NurseModel.nurseEmail,
          nursePhone: nursePhone ? nursePhone : NurseModel.nursePhone,
          nurseQualification: nurseQualification
            ? nurseQualification
            : NurseModel.nurseQualification,
          nurseAge: nurseAge ? nurseAge : NurseModel.nurseAge,
          nurseImage: nurseImage !== "" ? nurseImage : NurseModel.nurseImage,
        }
      );

      if (!updatedNurseData) {
        return res.status(404).json({ error: "Nurse data not found!" });
      }
      return res.status(200).json({ message: "Nurse Updated Successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

Router.delete("/Nurse-DELETE/:nurseId", async (req, res) => {
  const id = req.params.nurseId;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();
    const Nurse = await NurseModel.findOneAndUpdate(
      {
        nurseId: id,
      },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!Nurse) {
      return res.status(404).json({ error: "Nurse not found" });
    }
    return res.status(200).json({ message: "Nurse Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = Router;
