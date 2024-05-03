const express = require("express");

const router = express.Router();

const multer = require("multer");

const { v4: uuidv4 } = require("uuid");

const path = require("path");

const fs = require("fs");

require("../../DB/connection");

const DoctorModel = require("../../Models/DoctorSchema/DoctorSchema");
const DoctorProfessionalDetailsModel = require("../../Models/DoctorSchema/DoctorProfessionalDetailsSchema");

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
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Find the latest patient ID
    const latestDoctor = await DoctorModel.findOne(
      {},
      {},
      { sort: { doctorId: -1 } }
    );
    // console.log(latestPatient)

    // Extract the sequence part from the latest patient ID and increment it
    let sequence = 1;
    if (latestDoctor) {
      const latestDoctortId = latestDoctor.doctorId;
      const sequencePart = latestDoctortId.substr(9, 4); // Assuming the sequence part starts from the 9th character
      sequence = parseInt(sequencePart) + 1;
    }

    // Construct the new patient ID
    const paddedSequence = sequence.toString().padStart(4, "0");
    const uniqueId = `${year}${month}${day}${paddedSequence}`;

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

router.get("/Doctor-GET-ALL", async (req, res) => {
  try {
    const Doctors = await DoctorModel.find();
    if (Doctors) {
      return res.status(200).json(Doctors);
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

router.get("/Doctor-GET-ONE/:doctorId", async (req, res) => {
  const doctorId = req.params.doctorId;
  try {
    const doctor = await DoctorModel.findOne({ doctorId: doctorId });
    const doctorProfDetails = await DoctorProfessionalDetailsModel.findOne({
      doctorId: doctorId,
    });

    if (!doctor) {
      res.status(404).json("Doctor details not found");
    }
    res.status(200).json({
      DoctorDetails: doctor,
      DoctorProfessionalDetails: doctorProfDetails,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

router.post("/Doctor-POST", upload.single("doctorImage"), async (req, res) => {
  const {
    doctorName,
    doctorEmail,
    doctorQualification,
    doctorSpecialization,
    doctorDOB,
    doctorPhone,
    doctorGender,
    doctorBloodGroup,
    doctorLocalAddress,
    doctorPermanentAddress,
    doctorCity,
    doctorState,
    doctorCountry,
    doctorZipCode,
    // Doc Prof Details
    doctorFee,
    doctorDesignation,
    doctorDepartment,
  } = req.body;

  // console.log(req.body);
  if (!doctorName || !doctorEmail || !doctorPhone) {
    return res.status(422).json("Please fill the required fields properly!");
  }
  try {
    const doctorImage = req.file ? req.file.filename : "";
    // const doctorExist = await DoctorModel.findOne({
    //   doctorEmail: doctorEmail,
    // });

    // if (doctorExist) {
    //   return res
    //     .status(422)
    //     .json({ error: "Doctor Already Exists With Same Email ID" });
    // }

    const doctor = new DoctorModel({
      doctorId: await generateUniqueId(),
      doctorName: doctorName,
      doctorEmail: doctorEmail,
      doctorQualification: doctorQualification,
      doctorSpecialization: doctorSpecialization,
      doctorDOB: doctorDOB,
      doctorPhone: doctorPhone,
      doctorGender: doctorGender,
      doctorBloodGroup: doctorBloodGroup,
      doctorLocalAddress: doctorLocalAddress,
      doctorPermanentAddress: doctorPermanentAddress,
      doctorCity: doctorCity,
      doctorState: doctorState,
      doctorCountry: doctorCountry,
      doctorZipCode: doctorZipCode,
      doctorImage: doctorImage !== "" ? doctorImage : "",
    });

    if (doctor) {
      const doctorProfDetails = new DoctorProfessionalDetailsModel({
        DoctorProfessionalDetailsId: "DPD" + generateUniqueId(),
        doctorId: doctor.doctorId,
        doctorFee: doctorFee,
        doctorDesignation: doctorDesignation,
        doctorDepartment: doctorDepartment,
      });
      await doctorProfDetails.save();
    }
    return await doctor.save().then((data) =>
      res.json({
        message: "Doctor added successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal server error");
  }
});

router.put(
  "/Doctor-PUT/:doctorId",
  upload.single("doctorImage"),
  async (req, res) => {
    const doctorId = req.params.doctorId;

    const {
      doctorName,
      doctorEmail,
      doctorQualification,
      doctorSpecialization,
      doctorDOB,
      doctorPhone,
      doctorGender,
      doctorBloodGroup,
      doctorLocalAddress,
      doctorPermanentAddress,
      doctorCity,
      doctorState,
      doctorCountry,
      doctorZipCode,
      // Doc Prof Details
      doctorFee,
      doctorDesignation,
      doctorDepartment,
    } = req.body;

    try {
      const doctorImage = req.file ? req.file.filename : "";

      // const doctorExistWithEmail = await DoctorModel.findOne({
      //   doctorEmail: doctorEmail,
      // });
      // const doctorExistWithId = await DoctorModel.findOne({
      //   doctorId: doctorId,
      // });
      // if (
      //   doctorExistWithEmail.doctorEmail &&
      //   doctorExistWithEmail.doctorEmail !== doctorExistWithId.doctorEmail
      // ) {
      //   return res
      //     .status(422)
      //     .json({ error: "Doctor Already Exists With Same Email ID" });
      // }

      if (doctorImage !== "") {
        const filePath = path.dirname(
          `../../../backend/assets/images/${DoctorModel.doctorImage}`
        );
        const previousDoctorData = await DoctorModel.findOne({
          doctorId: doctorId,
        });
        if (previousDoctorData) {
          // console.log(`${filePath}/${previousPatientData.patientImage}`);
          // fs.unlinkSync(`${filePath}/${previousPatientData.patientImage}`);
          fs.unlink(
            "public" + `${filePath}/${previousDoctorData.doctorImage}`,
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

      const doctor = await DoctorModel.findOneAndUpdate(
        { doctorId: doctorId },
        {
          doctorName: doctorName ? doctorName : DoctorModel.doctorName,
          doctorEmail: doctorEmail ? doctorEmail : DoctorModel.doctorEmail,
          doctorQualification: doctorQualification
            ? doctorQualification
            : DoctorModel.doctorQualification,
          doctorSpecialization: doctorSpecialization
            ? doctorSpecialization
            : DoctorModel.doctorSpecialization,
          doctorDOB: doctorDOB ? doctorDOB : DoctorModel.doctorDOB,
          doctorPhone: doctorPhone ? doctorPhone : DoctorModel.doctorPhone,
          doctorGender: doctorGender ? doctorGender : DoctorModel.doctorGender,
          doctorBloodGroup: doctorBloodGroup
            ? doctorBloodGroup
            : DoctorModel.doctorBloodGroup,
          doctorLocalAddress: doctorLocalAddress
            ? doctorLocalAddress
            : DoctorModel.doctorLocalAddress,
          doctorPermanentAddress: doctorPermanentAddress
            ? doctorPermanentAddress
            : DoctorModel.doctorPermanentAddress,
          doctorCity: doctorCity ? doctorCity : DoctorModel.doctorCity,
          doctorState: doctorState ? doctorState : DoctorModel.doctorState,
          doctorCountry: doctorCountry
            ? doctorCountry
            : DoctorModel.doctorCountry,
          doctorZipCode: doctorZipCode
            ? doctorZipCode
            : DoctorModel.doctorZipCode,
          doctorImage:
            doctorImage !== "" ? doctorImage : DoctorModel.doctorImage,
        }
      );

      if (doctor) {
        await DoctorProfessionalDetailsModel.findOneAndUpdate(
          { doctorId: doctorId },
          {
            doctorFee: doctorFee
              ? doctorFee
              : DoctorProfessionalDetailsModel.doctorFee,
            doctorDesignation: doctorDesignation
              ? doctorDesignation
              : DoctorProfessionalDetailsModel.doctorDesignation,
            doctorDepartment: doctorDepartment
              ? doctorDepartment
              : DoctorProfessionalDetailsModel.doctorDepartment,
          }
        );
      }

      if (!doctor) {
        return res.status(404).json("Doctor not found");
      }
      return res.status(200).json({ message: "Doctor Updated successfully" });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  }
);

router.delete("/Doctor-DELETE/:doctorId", async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();
    const doctor = await DoctorModel.findOneAndUpdate(
      {
        doctorId: doctorId,
      },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (doctor) {
      await DoctorProfessionalDetailsModel.findOneAndUpdate(
        {
          doctorId: doctorId,
        },
        {
          isDeleted: true,
          deletedAt: `${date} ${time}`,
        }
      );
    }

    if (!doctor) {
      return res.status(404).json("Doctor not found");
    }
    return res.status(200).json({ message: "Doctor Deleted successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
