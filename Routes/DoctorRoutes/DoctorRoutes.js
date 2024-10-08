const express = require("express");

const router = express.Router();

const multer = require("multer");

const { v4: uuidv4 } = require("uuid");

const path = require("path");

const fs = require("fs");

require("../../DB/connection");

const DoctorModel = require("../../Models/DoctorSchema/DoctorSchema");
const DoctorProfessionalDetailsModel = require("../../Models/DoctorSchema/DoctorProfessionalDetailsSchema");
const IPDPatientModel = require("../../Models/IPDPatientSchema/IPDPatientSchema");
const EmergencyPatientModel = require("../../Models/EmergencyPatientSchema/EmergencyPatientSchema");

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
  const {
    doctorNameForSearch = "",
    doctorMobileNumberForSearch = "",
    doctorIdForSearch = "",
    page = 1,
    limit,
  } = req.query;

  // console.log(query, page, limit);
  try {
    const skip = (Number(page) - 1) * Number(limit);

    if (limit) {
      const Doctors = await DoctorModel.aggregate([
        {
          $sort: { _id: -1 },
        },
        {
          $addFields: {
            phoneNumberAsString: {
              $toString: "$doctorPhone",
            },
          },
        },
        {
          $match: { doctorId: { $regex: doctorIdForSearch, $options: "i" } },
        },
        {
          $match: {
            doctorName: { $regex: doctorNameForSearch, $options: "i" },
          },
        },
        {
          $match: {
            phoneNumberAsString: {
              $regex: doctorMobileNumberForSearch,
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
      // const Doctors = await DoctorModel.find();
      // if (Doctors) {
      //   return res.status(200).json(Doctors);
      // }

      let totalDoctor = await DoctorModel.countDocuments();
      if (doctorNameForSearch !== "") {
        totalDoctor = await DoctorModel.countDocuments({
          doctorName: { $regex: doctorNameForSearch, $options: "i" },
        });
      } else if (doctorIdForSearch !== "") {
        totalDoctor = await DoctorModel.countDocuments({
          doctorId: { $regex: doctorIdForSearch, $options: "i" },
        });
      } else if (doctorMobileNumberForSearch !== "") {
        // totalDoctor = await DoctorModel.countDocuments({
        //   doctorPhone: {
        //     $regex: Number(doctorMobileNumberForSearch),
        //     $options: "i",
        //   },
        // });
        const totalDoctorData = await DoctorModel.aggregate([
          {
            $addFields: {
              phoneNumberAsString: {
                $toString: "$doctorPhone",
              },
            },
          },
          {
            $match: {
              phoneNumberAsString: {
                $regex: doctorMobileNumberForSearch,
                $options: "i",
              },
            },
          },
          {
            $count: "totalDoctors",
          },
        ]);

        totalDoctor = totalDoctorData[0]?.totalDoctors;
      }

      return res.status(200).json({
        Doctors,
        totalDoctor,
        totalPages: Math.ceil(Number(totalDoctor) / Number(limit)),
        currentPage: Number(page),
      });
    } else if (!limit) {
      const allDoctors = await DoctorModel.find();

      if (allDoctors) {
        return res.status(200).json(allDoctors);
      }
    }
  } catch (error) {
    // console.log(error);

    res.status(500).json("Internal Server Error");
  }
});
router.get("/get-all-doctor", async (req, res) => {
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
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
router.get("/get-each-doctor-with-patients", async (req, res) => {
  try {
    const doctorsPatientsList = await DoctorModel.aggregate([
      {
        $lookup: {
          from: "ipdpatients",
          localField: "doctorId",
          foreignField: "ipdDoctorId",
          as: "doctorAsignWithPatients",
        },
      },
      {
        $unwind: {
          path: "$doctorAsignWithPatients",
        },
      },
      {
        $project: {
          _id: "$_id",
          doctorId: "$doctorId",
          doctorName: "$doctorName",
          doctorBloodGroup: "$doctorBloodGroup",
          doctorSpecialization: "$doctorSpecialization",
          doctorQualification: "$doctorQualification",
          doctorPhone: "$doctorPhone",
          doctorEmail: "$doctorEmail",
          Ipdpatient_id: "$doctorAsignWithPatients._id",
          IpdpatientId: "$doctorAsignWithPatients.ipdPatientId",
          IpdPatientNotes: "$doctorAsignWithPatients.ipdPatientNotes",
          IpdPatientCreatedTime: "$doctorAsignWithPatients.updatedAt",
          IpdPatientMainId: "$doctorAsignWithPatients.mainId",
          IpdPatientNurseId: "$doctorAsignWithPatients.ipdNurseId",
          IpdPatientDischarge: "$doctorAsignWithPatients.ipdPatientDischarged",
        },
      },
    ]);
    if (!doctorsPatientsList) {
      return res.status(403).json({
        message: "SomeThing Went Wrong While Fetching Data",
      });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: doctorsPatientsList });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
router.get(
  "/get-each-doctor-with-patients-nurse/:nurseId",
  async (req, res) => {
    const Id = req.params.nurseId;
    try {
      const doctorsPatientsList = await IPDPatientModel.aggregate([
        {
          $match: {
            $and: [{ ipdNurseId: Id }, { ipdPatientDischarged: false }],
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "ipdDoctorId",
            foreignField: "doctorId",
            as: "doctorAsignWithPatients",
          },
        },
        {
          $unwind: {
            path: "$doctorAsignWithPatients",
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
        {
          $unwind: {
            path: "$PatientData",
          },
        },
        {
          $project: {
            _id: "$doctorAsignWithPatients._id",
            doctorId: "$doctorAsignWithPatients.doctorId",
            doctorName: "$doctorAsignWithPatients.doctorName",
            doctorBloodGroup: "$doctorAsignWithPatients.doctorBloodGroup",
            doctorSpecialization:
              "$doctorAsignWithPatients.doctorSpecialization",
            doctorQualification: "$doctorAsignWithPatients.doctorQualification",
            doctorPhone: "$doctorAsignWithPatients.doctorPhone",
            doctorEmail: "$doctorAsignWithPatients.doctorEmail",
            Ipdpatient_id: "$_id",
            IpdpatientId: "$ipdPatientId",
            IpdPatientNotes: "$ipdPatientNotes",
            IpdPatietnBed: "$ipdBedNo",
            IpdPatientCreatedTime: "$updatedAt",
            IpdPatientMainId: "$mainId",
            IpdPatientNurseId: "$ipdNurseId",
            IpdPatientDischarge: "$ipdPatientDischarged",
            IpdPatientName: "$PatientData.patientName",
            IpdPatientUhid: "$PatientData.patientId",
            IpdPatientPhone: "$PatientData.patientPhone",
            IpdPatientPhone2: "$PatientData.patientPhone2",
          },
        },
      ]);
      if (!doctorsPatientsList) {
        return res.status(403).json({
          message: "SomeThing Went Wrong While Fetching Data",
        });
      }
      return res.status(200).json({
        message: "Data Fetch Successfully",
        data: doctorsPatientsList,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);
router.get("/get-each-doctor-with-patients-emergency", async (req, res) => {
  try {
    const doctorsPatientsList = await DoctorModel.aggregate([
      {
        $lookup: {
          from: "emergencypatients",
          localField: "doctorId",
          foreignField: "doctorId",
          as: "doctorAsignWithEmergencyPatients",
        },
      },
      {
        $unwind: {
          path: "$doctorAsignWithEmergencyPatients",
        },
      },
      {
        $project: {
          _id: "$_id",
          doctorId: "$doctorId",
          doctorName: "$doctorName",
          doctorBloodGroup: "$doctorBloodGroup",
          doctorSpecialization: "$doctorSpecialization",
          doctorQualification: "$doctorQualification",
          doctorPhone: "$doctorPhone",
          doctorEmail: "$doctorEmail",
          Emergencypatient_id: "$doctorAsignWithEmergencyPatients._id",
          patientsId: "$doctorAsignWithEmergencyPatients.patientId",

          EmergencyNotes: "$doctorAsignWithEmergencyPatients.notes",
          EmergencyPatientCreatedTime:
            "$doctorAsignWithEmergencyPatients.updatedAt",
          EmergencyPatientMainId: "$doctorAsignWithEmergencyPatients.mainId",
        },
      },
    ]);
    if (!doctorsPatientsList) {
      return res.status(403).json({
        message: "SomeThing Went Wrong While Fetching Data",
      });
    }
    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: doctorsPatientsList });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
router.get(
  "/get-each-doctor-with-patients-emergency-doctor/:doctorId",
  async (req, res) => {
    const Id = req.params.doctorId;
    try {
      const doctorsPatientsList = await EmergencyPatientModel.aggregate([
        {
          $match: {
            $and: [{ doctorId: Id }, { emergencyPatientDischarged: false }],
          },
        },

        {
          $lookup: {
            from: "patients",
            localField: "patientId",
            foreignField: "patientId",
            as: "PatientData",
          },
        },
        {
          $unwind: {
            path: "$PatientData",
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "doctorId",
            as: "doctorData",
          },
        },
        {
          $unwind: {
            path: "$doctorData",
          },
        },
        {
          $project: {
            _id: 1,
            mainId: 1,
            patientId: 1,
            doctorId: 1,
            nurseId: 1,
            bedId: 1,
            notes: 1,
            emergencyDepositAmount: 1,
            emergencyFloorNo: 1,
            emergencyPatientNurseRequestForDischarge: 1,
            emergencyPatientDoctorRequestForDischarge: 1,
            emergencyPatientNurseConfirmation: 1,
            emergencyPatientDoctorConfirmation: 1,
            emergencyPatientDischarged: 1,
            isDeleted: 1,
            createdAt: 1,
            updatedAt: 1,
            doctorName: "$doctorData.doctorName",
            PatientName: "$PatientData.patientName",
            patientPhone: "$PatientData.patientPhone",
            patientPhone2: "$PatientData.patientPhone2",
            patientUhid: "$PatientData.patientId",
          },
        },
        // {
        //   $unwind: {
        //     path: "$doctorAsignWithEmergencyPatients",
        //   },
        // },
        // {
        //   $project: {
        //     _id: "$_id",
        //     doctorId: "$doctorId",
        //     doctorName: "$doctorName",
        //     doctorBloodGroup: "$doctorBloodGroup",
        //     doctorSpecialization: "$doctorSpecialization",
        //     doctorQualification: "$doctorQualification",
        //     doctorPhone: "$doctorPhone",
        //     doctorEmail: "$doctorEmail",
        //     Emergencypatient_id: "$doctorAsignWithEmergencyPatients._id",
        //     patientsId: "$doctorAsignWithEmergencyPatients.patientId",

        //     EmergencyNotes: "$doctorAsignWithEmergencyPatients.notes",
        //     EmergencyPatientCreatedTime:
        //       "$doctorAsignWithEmergencyPatients.updatedAt",
        //     EmergencyPatientMainId: "$doctorAsignWithEmergencyPatients.mainId",
        //   },
        // },
      ]);
      if (!doctorsPatientsList) {
        return res.status(403).json({
          message: "SomeThing Went Wrong While Fetching Data",
        });
      }
      return res.status(200).json({
        message: "Data Fetch Successfully",
        data: doctorsPatientsList,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);
router.get(
  "/get-each-doctor-with-patients-emergency-nurse/:nurseId",
  async (req, res) => {
    const Id = req.params.nurseId;
    try {
      const doctorsPatientsList = await EmergencyPatientModel.aggregate([
        {
          $match: {
            $and: [{ nurseId: Id }, { emergencyPatientDischarged: false }],
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "doctorId",
            as: "doctorAsignWithEmergencyPatients",
          },
        },
        {
          $unwind: {
            path: "$doctorAsignWithEmergencyPatients",
          },
        },
        {
          $lookup: {
            from: "patients",
            localField: "patientId",
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
          $project: {
            _id: "$_id",
            doctor_Id: "$doctorAsignWithEmergencyPatients._id",
            doctorId: "$doctorAsignWithEmergencyPatients.doctorId",
            doctorName: "$doctorAsignWithEmergencyPatients.doctorName",
            doctorBloodGroup:
              "$doctorAsignWithEmergencyPatients.doctorBloodGroup",
            doctorSpecialization:
              "$doctorAsignWithEmergencyPatients.doctorSpecialization",
            doctorQualification:
              "$doctorAsignWithEmergencyPatients.doctorQualification",
            doctorPhone: "$doctorAsignWithEmergencyPatients.doctorPhone",
            doctorEmail: "$doctorAsignWithEmergencyPatients.doctorEmail",
            Emergencypatient_id: "$_id",
            patientsId: "$patientId",

            EmergencyNotes: "$notes",
            EmergencyPatientsCurrentBed: "$bedId",
            EmergencyPatientCreatedTime: "$updatedAt",
            EmergencyPatientMainId: "$mainId",
            EmergencyPatientName: "$patientData.patientName",
            EmergencyPatientPhone: "$patientData.patientPhone",
            EmergencyPatientPhone2: "$patientData.patientPhone2",
            EmergencyPatientUhid: "$patientData.patientId",
          },
        },
      ]);
      if (!doctorsPatientsList) {
        return res.status(403).json({
          message: "SomeThing Went Wrong While Fetching Data",
        });
      }
      return res.status(200).json({
        message: "Data Fetch Successfully",
        data: doctorsPatientsList,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }
);

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
    doctorDesignation,
    doctorDepartment,
    doctorFee,
    doctorOPDFee,
    doctorGereralHighFee,
    doctorGereralJanataFee,
    doctorSemiPrivateFee,
    doctorPrivateSingleAcFee,
    doctorPrivateSingleAcDlxFee,
    doctorPrivateSuiteFee,
    doctorEmergencyFee,
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
        DoctorProfessionalDetailsId: "DPD" + (await generateUniqueId()),
        doctorId: doctor.doctorId,
        doctorFee: doctorFee,
        doctorDesignation: doctorDesignation,
        doctorDepartment: doctorDepartment,
        doctorOPDFee: doctorOPDFee,
        doctorGereralHighFee: doctorGereralHighFee,
        doctorGereralJanataFee: doctorGereralJanataFee,
        doctorSemiPrivateFee: doctorSemiPrivateFee,
        doctorPrivateSingleAcFee: doctorPrivateSingleAcFee,
        doctorPrivateSingleAcDlxFee: doctorPrivateSingleAcDlxFee,
        doctorPrivateSuiteFee: doctorPrivateSuiteFee,
        doctorEmergencyFee: doctorEmergencyFee,
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
      doctorDesignation,
      doctorDepartment,
      doctorFee,
      doctorOPDFee,
      doctorGereralHighFee,
      doctorGereralJanataFee,
      doctorSemiPrivateFee,
      doctorPrivateSingleAcFee,
      doctorPrivateSingleAcDlxFee,
      doctorPrivateSuiteFee,
      doctorEmergencyFee,
    } = req.body;

    console.log(
      doctorFee,
      doctorOPDFee,
      doctorGereralHighFee,
      doctorGereralJanataFee,
      doctorSemiPrivateFee,
      doctorPrivateSingleAcFee,
      doctorPrivateSingleAcDlxFee,
      doctorPrivateSuiteFee,
      doctorEmergencyFee
    );

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
            doctorOPDFee: doctorOPDFee
              ? doctorOPDFee
              : DoctorProfessionalDetailsModel.doctorOPDFee,
            doctorGereralHighFee: doctorGereralHighFee
              ? doctorGereralHighFee
              : DoctorProfessionalDetailsModel.doctorGereralHighFee,
            doctorGereralJanataFee: doctorGereralJanataFee
              ? doctorGereralJanataFee
              : DoctorProfessionalDetailsModel.doctorGereralJanataFee,
            doctorSemiPrivateFee: doctorSemiPrivateFee
              ? doctorSemiPrivateFee
              : DoctorProfessionalDetailsModel.doctorSemiPrivateFee,
            doctorPrivateSingleAcFee: doctorPrivateSingleAcFee
              ? doctorPrivateSingleAcFee
              : DoctorProfessionalDetailsModel.doctorPrivateSingleAcFee,
            doctorPrivateSingleAcDlxFee: doctorPrivateSingleAcDlxFee
              ? doctorPrivateSingleAcDlxFee
              : DoctorProfessionalDetailsModel.doctorPrivateSingleAcDlxFee,
            doctorPrivateSuiteFee: doctorPrivateSuiteFee
              ? doctorPrivateSuiteFee
              : DoctorProfessionalDetailsModel.doctorPrivateSuiteFee,
            doctorEmergencyFee: doctorEmergencyFee
              ? doctorEmergencyFee
              : DoctorProfessionalDetailsModel.doctorEmergencyFee,
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
router.get("/get-doctor-name/:doctorId", async (req, res) => {
  const Id = req.params.doctorId;
  try {
    const doctorname = await DoctorModel.find({
      doctorId: Id,
    });
    if (!doctorname || doctorname?.length === 0) {
      return res.status(403).json({ message: "no data found" });
    }
    return res.status(200).json({
      message: "Data Fetch Successfully",
      data: doctorname?.[0]?.doctorName,
    });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});

module.exports = router;
