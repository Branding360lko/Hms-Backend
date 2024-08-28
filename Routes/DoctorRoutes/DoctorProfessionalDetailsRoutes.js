const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const DoctorProfessionalDetailsModel = require("../../Models/DoctorSchema/DoctorProfessionalDetailsSchema");

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

Router.get("/DoctorProfDetails-GET-ALL", async (req, res) => {
  try {
    const DoctorProfDetails = await DoctorProfessionalDetailsModel.find();

    if (DoctorProfDetails) {
      return res.status(200).json(DoctorProfDetails);
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get(
  "/DoctorProfDetails-GET-ONE/:DoctorProfessionalDetailsId",
  async (req, res) => {
    const docProfDetailsId = req.params.DoctorProfessionalDetailsId;

    try {
      const DoctorProfDetails = await DoctorProfessionalDetailsModel.findOne({
        DoctorProfessionalDetailsId: docProfDetailsId,
      });

      if (!DoctorProfDetails) {
        return res.status(404).json("Doctor Professional Details Not Found!");
      }
      return res.status(200).json(DoctorProfDetails);
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.get(
  "/DoctorProfDetails-GET-ONE-By_Doctor_ID/:doctorId",
  async (req, res) => {
    const doctorId = req.params.doctorId;

    try {
      const DoctorProfDetails = await DoctorProfessionalDetailsModel.findOne({
        doctorId: doctorId,
      });

      if (!DoctorProfDetails) {
        return res.status(404).json("Doctor Professional Details Not Found!");
      }
      return res.status(200).json(DoctorProfDetails);
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.post("/DoctorProfDetails-POST", async (req, res) => {
  const { doctorId, doctorFee, doctorDesignation, doctorDepartment } = req.body;

  try {
    if (!doctorId || !doctorFee || !doctorDesignation || !doctorDepartment) {
      return res.status(422).json("Please fill the required fields properly!");
    }
    const doctorProfDetailsExist = await DoctorProfessionalDetailsModel.findOne(
      {
        doctorId: doctorId,
      }
    );

    if (doctorProfDetailsExist) {
      return res.status(422).json({
        error: "Doctor Professional Details Already Exists With Same ID",
      });
    }
    const DoctorProfDetails = new DoctorProfessionalDetailsModel({
      DoctorProfessionalDetailsId: "DPD" + generateUniqueId(),
      doctorId: doctorId,
      doctorFee: doctorFee,
      doctorDepartment: doctorDepartment,
      doctorDesignation: doctorDesignation,
    });

    return await DoctorProfDetails.save().then((data) =>
      res.json({
        message: "Doctor professional details added successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/DoctorProfDetails-PUT/:doctorId", async (req, res) => {
  const doctorId = req.params.doctorId;
  const { doctorFee, doctorDesignation, doctorDepartment } = req.body;
  try {
    const DoctorProfDetails =
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

    if (!DoctorProfDetails) {
      return res.status(404).json("Doctor professional details Data not found");
    }
    return res
      .status(200)
      .json({ message: "Doctor professional details Updated successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.delete("/DoctorProfDetails-DELETE/:doctorId", async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();
    const DoctorProfDetails =
      await DoctorProfessionalDetailsModel.findOneAndUpdate(
        {
          doctorId: doctorId,
        },
        {
          isDeleted: true,
          deletedAt: `${date} ${time}`,
        }
      );

    if (!DoctorProfDetails) {
      return res.status(404).json("Doctor professional details not found");
    }
    return res
      .status(200)
      .json({ message: "Doctor professional details deleted successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
