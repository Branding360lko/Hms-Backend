const express = require("express");
const Router = express.Router();
const HospitalInventry = require("../../Models/HosiptalInventerySchema/HosiptalInventerySchema");
const { upload } = require("../../utils/upload");
const { generateUniqueId } = require("../../utils/getUniqueId");

Router.get("/get-all-hospital-inventry", async (req, res) => {
  try {
    const HosiptalInventery = await HospitalInventry.find();
    if (!HosiptalInventery || HosiptalInventery?.length === 0) {
      return res.status(200).json({ message: "NO Inventry Data Found" });
    }
    return res
      .status(200)
      .json({ message: "Data Fetech Successfully", data: HosiptalInventery });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});

Router.post("/add-hospital-inventry", upload.none(), async (req, res) => {
  const {
    NameOfEquiment,
    Modal,
    NameOfManufacturer,
    DateOfInstallation,
    CalibrationStatus,
    WhetherAmc,
  } = req.body;

  try {
    if (
      !(
        NameOfEquiment ||
        Modal ||
        NameOfManufacturer ||
        DateOfInstallation ||
        CalibrationStatus
      )
    ) {
      return res
        .status(404)
        .json({ message: "Please Fill all Required Fields" });
    }
    const AddHosiptalInventery = await HospitalInventry.create({
      InventryId: "INV-" + generateUniqueId(),
      NameOfEquiment: NameOfEquiment,
      Modal: Modal,
      NameOfManufacturer: NameOfManufacturer,
      DateOfInstallation: DateOfInstallation,
      CalibrationStatus: CalibrationStatus,
      WhetherAmc:
        WhetherAmc !== null || WhetherAmc !== undefined ? WhetherAmc : false,
    });

    const HosiptalInventery = await HospitalInventry.findById(
      AddHosiptalInventery?._id
    );

    if (!HosiptalInventery) {
      res
        .status(500)
        .json("Something went wrong while Saving the Hosiptal Inventery Data");
    }
    return res
      .status(201)
      .json({ message: "Data Saved Successfully", data: HosiptalInventery });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});

Router.get("/get-one-Hospital-Inventry/:InventryId", async (req, res) => {
  const { InventryId } = req.params;
  try {
    if (
      !InventryId ||
      InventryId === undefined ||
      InventryId === null ||
      InventryId?.length === 0
    ) {
      return res
        .status(404)
        .json({ message: "Please Provide Valid Inventry Id" });
    }
    const HosiptalInventery = await HospitalInventry.findOne({
      InventryId: InventryId,
    });
    if (!HosiptalInventery || HosiptalInventery?.length === 0) {
      return res
        .status(404)
        .json({ message: "No Hospital Inventry Found With This Id" });
    }

    return res
      .status(200)
      .json({ message: "Data Fetch Successfully", data: HosiptalInventery });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
Router.put(
  "/update-one-Hospital-Inventry/:InventryId",
  upload.none(),
  async (req, res) => {
    const { InventryId } = req.params;
    const {
      NameOfEquiment,
      Modal,
      NameOfManufacturer,
      DateOfInstallation,
      CalibrationStatus,
      WhetherAmc,
    } = req.body;
    try {
      if (
        !InventryId ||
        InventryId === undefined ||
        InventryId === null ||
        InventryId?.length === 0
      ) {
        return res
          .status(404)
          .json({ message: "Please Provide Valid Inventry Id" });
      }

      const HosiptalInventery = await HospitalInventry.findOneAndUpdate(
        {
          InventryId: InventryId,
        },
        {
          NameOfEquiment: NameOfEquiment
            ? NameOfEquiment
            : HospitalInventry.NameOfEquiment,
          Modal: Modal ? Modal : HospitalInventry.Modal,
          NameOfManufacturer: NameOfManufacturer
            ? NameOfManufacturer
            : HospitalInventry.NameOfManufacturer,
          DateOfInstallation: DateOfInstallation
            ? DateOfInstallation
            : HospitalInventry.DateOfInstallation,
          CalibrationStatus: CalibrationStatus
            ? CalibrationStatus
            : HospitalInventry.CalibrationStatus,
          WhetherAmc: WhetherAmc ? WhetherAmc : HospitalInventry.WhetherAmc,
        },
        { new: true }
      );
      if (!HosiptalInventery || HosiptalInventery?.length === 0) {
        return res.status(404).json({ message: "No Data Found With This Id" });
      }
      return res.status(200).json({
        message: "Data Updated Successfully",
        data: HosiptalInventery,
      });
    } catch (error) {
      return res.status(500).json("internal server error");
    }
  }
);
Router.delete("/delete-one-hospital-Inventry/:InventryId", async (req, res) => {
  const { InventryId } = req.params;
  try {
    if (
      !InventryId ||
      InventryId === undefined ||
      InventryId === null ||
      InventryId?.length === 0
    ) {
      return res
        .status(404)
        .json({ message: "Please Provide Valid Inventry Id" });
    }
    const HosiptalInventery = await HospitalInventry.findOneAndDelete({
      InventryId: InventryId,
    });
    if (!HosiptalInventery || HosiptalInventery?.length === 0) {
      return res.status(404).json({ message: "No Data Found With This Id" });
    }
    return res.status(200).json({
      message: "Data Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json("internal server error");
  }
});
module.exports = Router;
