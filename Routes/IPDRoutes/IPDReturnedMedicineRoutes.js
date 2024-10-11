const express = require("express");

const Router = express.Router();

const mongoose = require("mongoose");

require("../../DB/connection");
const IPDReturnedMedicine = require("../../Models/IPDSchema/IPDReturnedMedicine");
const { upload } = require("../../utils/upload");
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

Router.get("/get-all-return-medicine", async (req, res) => {
  try {
    const IPDReturnedMedicinedata = await IPDReturnedMedicine.find();
    if (!IPDReturnedMedicinedata || IPDReturnedMedicinedata?.length === 0) {
      return res.status(404).json({ message: "No Returned Medicine Find" });
    }
    return res
      .status(200)
      .json({ message: "Successfully Feteched Return Medicine Data" });
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
});
Router.post("/add-return-medicine", upload.none(), async (req, res) => {
  const { ipdPatientMainId } = req.body;
  const medicine = req.body.medicine ? JSON.parse(req.body.medicine) : [];

  try {
    const IPDReturnedMedicinedata = await IPDReturnedMedicine.create({
      returnedMedicineId: "RET-" + generateUniqueId(),
      ipdPatientMainId: ipdPatientMainId,
      medicine: medicine?.map((med) => ({
        Name: med?.Name,
        Quantity: Number(med?.Quantity),
        Price: Number(med?.Price),
        subTotal: Number(med?.Price) * Number(med?.Quantity),
        date: (() => {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        })(),
      })),
    });
    const IPDSavedReturnedMedicine = await IPDReturnedMedicine.findById(
      IPDReturnedMedicinedata?._id
    );

    if (!IPDSavedReturnedMedicine) {
      res
        .status(500)
        .json("Something went wrong while Saving the IPD Return Medicine Data");
    }
    let total = 0;
    if (
      IPDReturnedMedicinedata &&
      IPDReturnedMedicinedata.medicine &&
      Array.isArray(IPDReturnedMedicinedata.medicine)
    ) {
      total = IPDReturnedMedicinedata.medicine.reduce(
        (sum, med) => sum + med.subTotal,
        0
      );
    }
    const IPDReturnedMedicineTotal = await IPDReturnedMedicine.findOneAndUpdate(
      { returnedMedicineId: IPDReturnedMedicinedata?.returnedMedicineId },
      {
        $set: {
          Total: total,
        },
      },
      { new: true }
    );
    return res.status(201).json({
      message: "Return Medicine Added Successfully",
      data: IPDReturnedMedicineTotal,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json("Internal Server Error");
  }
});
Router.get("/get-one-return-medicine/:returnId", async (req, res) => {
  const returnId = req.params.returnId;
  if (!returnId || returnId.length === 0) {
    return res.status(404).json({ message: "Return Medicine ID Is Required" });
  }
  try {
    const IPDReturnedMedicinedata = await IPDReturnedMedicine.findOne({
      returnId: returnId,
    });
    if (!IPDReturnedMedicinedata || IPDReturnedMedicinedata?.length === 0) {
      return res.status(404).json({ message: "No Returned Found" });
    }
    return res.status(200).json({
      message: "Return Medicine Data Fetch Successfully",
      data: IPDReturnedMedicinedata,
    });
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
});
Router.get(
  "/get-one-ipd-patient-return-medicine/:ipdPatientId",
  async (req, res) => {
    const ipdPatientId = req.params.ipdPatientId;
    if (!ipdPatientId || ipdPatientId.length === 0) {
      return res
        .status(404)
        .json({ message: "Return Medicine ID Is Required" });
    }
    try {
      const IPDReturnedMedicinedata = await IPDReturnedMedicine.find({
        ipdPatientMainId: ipdPatientId,
      });
      if (!IPDReturnedMedicinedata || IPDReturnedMedicinedata?.length === 0) {
        return res.status(404).json({ message: "No Returned Found" });
      }
      return res.status(200).json({
        message: "Return Medicine Data Fetch Successfully",
        data: IPDReturnedMedicinedata,
      });
    } catch (error) {
      return res.status(500).json("Internal Server Error");
    }
  }
);
Router.put(
  "/update-one-return-medicine/:returnId/:ipdPatientMainId",
  upload.none(),
  async (req, res) => {
    const { returnId, ipdPatientMainId } = req.params;
    const medicine = req.body.medicine ? JSON.parse(req.body.medicine) : [];

    if (
      !returnId ||
      returnId.length === 0 ||
      !ipdPatientMainId ||
      ipdPatientMainId.length === 0
    ) {
      return res
        .status(404)
        .json({ message: "Return Medicine ID and Ipd Patient Id Is Required" });
    }
    try {
      const IPDReturnedMedicinedata =
        await IPDReturnedMedicine.findOneAndUpdate(
          {
            returnedMedicineId: returnId,
            ipdPatientMainId: ipdPatientMainId,
          },
          {
            medicine: medicine?.map((med) => ({
              Name: med?.Name,
              Quantity: Number(med?.Quantity),
              Price: Number(med?.Price),
              subTotal: Number(med?.Price) * Number(med?.Quantity),
              date: (() => {
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                const seconds = String(date.getSeconds()).padStart(2, "0");
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
              })(),
            })),
          },
          {
            new: true,
          }
        );

      if (!IPDReturnedMedicinedata) {
        res
          .status(500)
          .json(
            "Something went wrong while Updaing the IPD Return Medicine Data"
          );
      }
      let total = 0;
      if (
        IPDReturnedMedicinedata &&
        IPDReturnedMedicinedata.medicine &&
        Array.isArray(IPDReturnedMedicinedata.medicine)
      ) {
        total = IPDReturnedMedicinedata.medicine.reduce(
          (sum, med) => sum + med.subTotal,
          0
        );
      }
      const IPDReturnedMedicineTotal =
        await IPDReturnedMedicine.findOneAndUpdate(
          { returnedMedicineId: returnId },
          {
            $set: {
              Total: total,
            },
          },
          { new: true }
        );
      return res.status(201).json({
        message: "Return Medicine Updated Successfully",
        data: IPDReturnedMedicineTotal,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json("Internal Server Error");
    }
  }
);
Router.delete("/delete-one-returned-medicine/:returnId", async (req, res) => {
  const returnId = req.params.returnId;
  if (!returnId || returnId.length === 0) {
    return res.status(404).json({ message: "Return Medicine ID Is Required" });
  }
  try {
    const IPDReturnedMedicinedata = await IPDReturnedMedicine.findOneAndDelete({
      returnId: returnId,
    });
    if (!IPDReturnedMedicinedata || IPDReturnedMedicinedata?.length === 0) {
      return res.status(404).json({ message: "No Returned Found" });
    }
    return res.status(200).json({
      message: "Return Medicine Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
});
module.exports = Router;
