const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const ManageBedsModel = require("../../Models/ManageBedsSchema/ManageBedsSchema");

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

Router.get("/ManageBeds-GET-ALL", async (req, res) => {
  try {
    const beds = await ManageBedsModel.find();
    return res.status(200).json(beds);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.get("/ManageBeds-GET-ONE/:bedId", async (req, res) => {
  const ID = req.params.bedId;

  try {
    const bed = await ManageBedsModel.findOne({ bedId: ID });
    if (!bed) {
      return res.status(400).json("Bed Data Not Found");
    }
    return res.status(200).json(bed);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/ManageBeds-POST", async (req, res) => {
  const { bedNumber, bedTypeName, bedFloor, isAppointmentApplicable } =
    req.body;

  try {
    const newBed = new ManageBedsModel({
      bedId: "BED" + generateUniqueId(),
      bedNumber: bedNumber,
      bedTypeName: bedTypeName,
      bedFloor: bedFloor,
      isAppointmentApplicable: isAppointmentApplicable,
    });

    return newBed.save().then((data) =>
      res.status(200).json({
        message: "Bed Added Successfully",
        data: data,
      })
    );
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put(
  "/ManageBeds-PUT-IsAppointmentApplicable/:bedId",
  async (req, res) => {
    const ID = req.params.bedId;

    const { isAppointmentApplicable } = req.body;
    try {
      const department = await ManageBedsModel.findOneAndUpdate(
        { bedId: ID },
        {
          isAppointmentApplicable: isAppointmentApplicable,
        }
      );
      if (!department) {
        return res.status(404).json("Bed Data Not Found");
      }
      return res
        .status(200)
        .json({ message: "Appointment Applicable Updated Succesfully" });
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  }
);

Router.delete("/ManageBeds-DELETE/:bedId", async (req, res) => {
  const ID = req.params.bedId;

  try {
    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const bed = await ManageBedsModel.findOneAndUpdate(
      { bedId: ID },
      {
        isDeleted: true,
        deletedAt: `${date} ${time}`,
      }
    );

    if (!bed) {
      return res.status(404).json("Bed Data Not Found");
    }
    return res.status(200).json({ message: "Bed Data Deleted Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
