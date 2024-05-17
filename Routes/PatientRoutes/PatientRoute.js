const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const { v4: uuidv4 } = require("uuid");

const fs = require("fs");

require("../../DB/connection");

const PatientModel = require("../../Models/PatientSchema/PatientSchema");

// const generateUniqueId = () => {
//   const date = new Date();
//   const year = date.getFullYear().toString();
//   const month = (date.getMonth() + 1).toString().padStart(2, "0");
//   const day = date.getDate().toString().padStart(2, "0");
//   // const hours = date.getHours().toString().padStart(2, "0");
//   // const minutes = date.getMinutes().toString().padStart(2, "0");
//   const seconds = date.getSeconds().toString().padStart(2, "0");

//   // const uniqueId = `${year}${month}${day}${hours}${minutes}${seconds}`;
//   const uniqueId = `${year}${month}${day}${seconds}`;

//   return uniqueId;
// };
const generateUniqueId = async () => {
  try {
    // Get current date
    const date = new Date();
    const year = date.getFullYear().toString();
    // const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // const day = date.getDate().toString().padStart(2, "0");

    // Find the latest patient ID
    const latestPatient = await PatientModel.findOne(
      {},
      {},
      { sort: { patientId: -1 } }
    );
    // console.log(latestPatient)

    // Extract the sequence part from the latest patient ID and increment it
    let sequence = 1;
    if (latestPatient) {
      const latestPatientId = latestPatient.patientId;
      // const sequencePart = latestPatientId.substr(9, 4); // Assuming the sequence part starts from the 9th character
      const sequencePart = latestPatientId.substr(4);
      sequence = parseInt(sequencePart) + 1;
    }

    // Construct the new patient ID
    // const paddedSequence = sequence.toString().padStart(6, "0");
    const paddedSequence = sequence.toString().padStart(4, "0");
    const uniqueId = `${year}${paddedSequence}`;

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

router.get("/Patient-GET-ALL", async (req, res) => {
  try {
    const Patients = await PatientModel.find();
    if (Patients) {
      return res.status(200).json(Patients);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/Patient-GET-ONE/:PatientId", async (req, res) => {
  const PatientId = req.params.PatientId;
  console.log(PatientId);
  try {
    const Patient = await PatientModel.findOne({ patientId: PatientId });

    if (!Patient) {
      return res.status(404).json("Patient Not Found");
    }
    return res.status(200).json(Patient);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/Patient-POST",
  upload.single("patientImage"),
  async (req, res) => {
    const {
      patientName,
      patientEmail,
      patientFatherName,
      patientHusbandName,
      patientDateOfBirth,
      patientAge,
      patientPhone,
      patientPhone2,
      patientHeight,
      patientWeight,
      patientGender,
      patientBloodGroup,
      patientAdmittingCategory,
      patientLocalAddress,
      patientPermanentAddress,
      patientCity,
      patientState,
      patientCountry,
      patientZipCode,
      createdBy,
      editedBy,
    } = req.body;

    // if (
    //   !patientName ||
    //   !patientEmail ||
    //   !patientDateOfBirth ||
    //   !patientPhone ||
    //   !patientGender
    // ) {
    //   res.status(422).json({ error: "Please fill the field completely!" });
    // }

    try {
      const patientImage = req.file ? req.file.filename : "";
      // const patientExistWithEmail = await PatientModel.findOne({
      //   patientEmail: patientEmail,
      // });

      // if (patientExistWithEmail) {
      //   return res
      //     .status(422)
      //     .json({ error: "Patient Already Exists With Same Email ID" });
      // }

      // const patientExistWithPhone = await PatientModel.findOne({
      //   patientPhone: patientPhone,
      // });

      // if (patientExistWithPhone) {
      //   return res
      //     .status(422)
      //     .json({ error: "Patient Already Exists With Same Mobile Number" });
      // }

      const newPatient = new PatientModel({
        patientId: await generateUniqueId(),
        patientName: patientName,
        patientEmail: patientEmail,
        patientFatherName: patientFatherName,
        patientHusbandName: patientHusbandName,
        patientDateOfBirth: patientDateOfBirth,
        patientAge: patientAge,
        patientPhone: patientPhone,
        patientPhone2: patientPhone2,
        patientHeight: patientHeight,
        patientWeight: patientWeight,
        patientGender: patientGender,
        patientBloodGroup: patientBloodGroup,
        patientAdmittingCategory: patientAdmittingCategory,
        patientLocalAddress: patientLocalAddress,
        patientPermanentAddress: patientPermanentAddress,
        patientCity: patientCity,
        patientState: patientState,
        patientCountry: patientCountry,
        patientZipCode: patientZipCode,
        createdBy: createdBy,
        editedBy: editedBy,
        patientImage: patientImage !== "" ? patientImage : "",
      });

      return await newPatient
        .save()
        .then((data) =>
          res.json({ message: "Patient added successfully", data: data })
        );
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.put(
  "/Patient-PUT/:PatientId",
  upload.single("patientImage"),
  async (req, res) => {
    const PatientId = req.params.PatientId;

    const {
      patientId,
      patientName,
      patientEmail,
      patientFatherName,
      patientHusbandName,
      patientDateOfBirth,
      patientAge,
      patientPhone,
      patientPhone2,
      patientHeight,
      patientWeight,
      patientGender,
      patientBloodGroup,
      patientAdmittingCategory,
      patientLocalAddress,
      patientPermanentAddress,
      patientCity,
      patientState,
      patientCountry,
      patientZipCode,
      editedBy,
    } = req.body;

    try {
      const patientImage = req.file ? req.file.filename : "";

      // const patientExistWithEmail = await PatientModel.findOne({
      //   patientEmail: patientEmail,
      // });
      // const patientExistWithId = await PatientModel.findOne({
      //   patientId: PatientId,
      // });
      // if (
      //   patientExistWithEmail.doctorEmail &&
      //   patientExistWithEmail.doctorEmail !== patientExistWithId.doctorEmail
      // ) {
      //   return res
      //     .status(422)
      //     .json({ error: "Patient Already Exists With Same Email ID" });
      // }

      if (patientImage !== "") {
        const filePath = path.dirname(
          `../../../backend/assets/images/${PatientModel.patientImage}`
        );
        const previousPatientData = await PatientModel.findOne({
          patientId: PatientId,
        });
        if (previousPatientData) {
          console.log(`${filePath}/${previousPatientData.patientImage}`);
          // fs.unlinkSync(`${filePath}/${previousPatientData.patientImage}`);
          fs.unlink(
            "public" + `${filePath}/${previousPatientData.patientImage}`,
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

      const Patient = await PatientModel.findOneAndUpdate(
        {
          patientId: PatientId,
        },
        {
          patientId: patientId ? patientId : PatientModel.patientId,
          patientName: patientName ? patientName : PatientModel.patientName,
          patientEmail: patientEmail ? patientEmail : PatientModel.patientEmail,
          patientFatherName: patientFatherName
            ? patientFatherName
            : PatientModel.patientFatherName,
          patientHusbandName: patientHusbandName
            ? patientHusbandName
            : PatientModel.patientHusbandName,
          patientDateOfBirth: patientDateOfBirth
            ? patientDateOfBirth
            : PatientModel.patientDateOfBirth,
          patientAge: patientAge ? patientAge : PatientModel.patientAge,
          patientPhone: patientPhone ? patientPhone : PatientModel.patientPhone,
          patientPhone2: patientPhone2
            ? patientPhone2
            : PatientModel.patientPhone2,
          patientHeight: patientHeight
            ? patientHeight
            : PatientModel.patientHeight,
          patientWeight: patientWeight
            ? patientWeight
            : PatientModel.patientWeight,
          patientGender: patientGender
            ? patientGender
            : PatientModel.patientGender,
          patientBloodGroup: patientBloodGroup
            ? patientBloodGroup
            : PatientModel.patientBloodGroup,
          patientLocalAddress: patientLocalAddress
            ? patientLocalAddress
            : PatientModel.patientLocalAddress,
          patientPermanentAddress: patientPermanentAddress
            ? patientPermanentAddress
            : PatientModel.patientPermanentAddress,
          patientCity: patientCity ? patientCity : PatientModel.patientCity,
          patientState: patientState ? patientState : PatientModel.patientState,
          patientCountry: patientCountry
            ? patientCountry
            : PatientModel.patientCountry,
          patientZipCode: patientZipCode
            ? patientZipCode
            : PatientModel.patientZipCode,
          editedBy: editedBy ? editedBy : PatientModel.editedBy,
          patientImage:
            patientImage !== "" ? patientImage : PatientModel.patientImage,
          patientAdmittingCategory: patientAdmittingCategory
            ? patientAdmittingCategory
            : PatientModel.patientAdmittingCategory,
        }
      );
      // console.log(Patient);

      if (!Patient) {
        return res.status(404).json("Patient not found");
      }

      // fs.unlinkSync(filePath);

      return res.status(200).json({ message: "Patient Updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// router.delete("/Patient-DELETE/:PatientId", async (req, res) => {
//   const PatientId = req.params.PatientId;

//   try {
//     const Patient = await PatientModel.findOneAndDelete({
//       patientId: PatientId,
//     });

//     if (!Patient) {
//       return res.status(404).json("Patient not found to Delete");
//     }

//     return res
//       .status(200)
//       .json({ message: `Patient with Id: ${PatientId} deleted successfully!` });
//   } catch (error) {
//     res.status(500).json("Internal Server Error");
//   }
// });

router.delete("/Patient-DELETE/:PatientId", async (req, res) => {
  const PatientId = req.params.PatientId;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();
    const Patient = await PatientModel.findOneAndUpdate(
      {
        patientId: PatientId,
      },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!Patient) {
      return res.status(404).json("Patient not found");
    }
    return res.status(200).json({ message: "Patient Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
