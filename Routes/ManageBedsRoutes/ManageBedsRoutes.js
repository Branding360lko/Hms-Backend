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
  const {
    bedNumber,
    bedType,
    bedSubType,
    bedFloor,
    bedCharges,
    nursingCharges,
    EMOCharges,
    bioWasteCharges,
    sanitizationCharges,
    bedAvailableOrNot,
  } = req.body;

  try {
    const newBed = new ManageBedsModel({
      bedId: "bed" + generateUniqueId(),
      bedNumber: bedNumber,
      bedType: bedType,
      bedSubType: bedSubType,
      bedFloor: bedFloor,
      bedCharges: bedCharges,
      nursingCharges: nursingCharges,
      EMOCharges: EMOCharges,
      bioWasteCharges: bioWasteCharges,
      sanitizationCharges: sanitizationCharges,
      bedAvailableOrNot: bedAvailableOrNot,
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

Router.put("/ManageBeds-PUT/:BedId", async (req, res) => {
  const {
    bedNumber,
    bedType,
    bedSubType,
    bedFloor,
    bedCharges,
    nursingCharges,
    EMOCharges,
    bioWasteCharges,
    sanitizationCharges,
    bedAvailableOrNot,
  } = req.body;

  try {
    const id = req.params.BedId;
    const updatedBeds = await ManageBedsModel.findOneAndUpdate(
      { bedId: id },
      {
        bedNumber: bedNumber ? bedNumber : ManageBedsModel.bedNumber,
        bedType: bedType ? bedType : ManageBedsModel.bedType,
        bedSubType: bedSubType ? bedSubType : ManageBedsModel.bedSubType,
        bedFloor: bedFloor ? bedFloor : ManageBedsModel.bedFloor,
        bedCharges: bedCharges ? bedCharges : ManageBedsModel.bedCharges,
        nursingCharges: nursingCharges
          ? nursingCharges
          : ManageBedsModel.nursingCharges,
        EMOCharges: EMOCharges ? EMOCharges : ManageBedsModel.EMOCharges,
        bioWasteCharges: bioWasteCharges
          ? bioWasteCharges
          : ManageBedsModel.bioWasteCharges,
        sanitizationCharges: sanitizationCharges
          ? sanitizationCharges
          : ManageBedsModel.sanitizationCharges,
        bedAvailableOrNot: bedAvailableOrNot,
      }
    );

    if (!updatedBeds) {
      return res.status(404).json("Beds Data Not Found");
    }
    return res.status(200).json({ message: "Beds Data Updated Successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.put("/ManageBeds-PUT-IsBedAvailableOrNot/:bedId", async (req, res) => {
  const ID = req.params.bedId;

  const { bedAvailableOrNot } = req.body;
  try {
    const department = await ManageBedsModel.findOneAndUpdate(
      { bedId: ID },
      {
        bedAvailableOrNot: bedAvailableOrNot,
      }
    );
    if (!department) {
      return res.status(404).json("Bed Data Not Found");
    }
    return res
      .status(200)
      .json({ message: "BedAvailableOrNot Updated Succesfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

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
