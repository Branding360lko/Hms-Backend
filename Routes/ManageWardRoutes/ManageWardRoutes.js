const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const ManageWardModel = require("../../Models/ManageWardSchema/ManageWardSchema");

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

Router.get("/ManageWard-GET-ALL", async (req, res) => {
  try {
    const wards = await ManageWardModel.find();
    return res.status(200).json(wards);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/ManageWard-GET-ONE/:wardId", async (req, res) => {
  const ID = req.params.wardId;
  try {
    const ward = await ManageWardModel.findOne({ wardId: ID });

    if (!ward) {
      return res.status(400).json("Ward Data Not Found");
    }
    return res.status(200).json(ward);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/ManageWard-POST", async (req, res) => {
  const {
    floorsName,
    wardName,
    wardDescription,
    wardNumber,
    isAppointmentApplicable,
  } = req.body;

  try {
    const newWard = new ManageWardModel({
      wardId: "WARD" + generateUniqueId(),
      floorsName: floorsName,
      wardName: wardName,
      wardDescription: wardDescription,
      wardNumber: wardNumber,
      isAppointmentApplicable: isAppointmentApplicable,
    });

    return await newWard.save().then((data) =>
      res.status(200).json({
        message: "Ward Added Successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put(
  "/ManageWard-PUT-IsAppointmentApplicable/:wardId",
  async (req, res) => {
    const ID = req.params.wardId;
    const { isAppointmentApplicable } = req.body;
    try {
      const ward = await ManageWardModel.findOneAndUpdate(
        { wardId: ID },
        {
          isAppointmentApplicable: isAppointmentApplicable,
        }
      );
      if (!ward) {
        return res.status(404).json("Ward Data Not Found");
      }
      return res
        .status(200)
        .json({ message: "Appointment Applicable Updated Succesfully" });
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.delete("/ManageWard-DELETE/:wardId", async (req, res) => {
  const ID = req.params.wardId;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const ward = await ManageWardModel.findOneAndUpdate(
      { wardId: ID },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!ward) {
      return res.status(404).json("Ward Data Not Found");
    }
    return res.status(200).json({ message: "Ward Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
