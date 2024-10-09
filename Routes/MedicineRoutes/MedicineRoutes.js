const express = require("express");

const Router = express.Router();
const fs = require("fs").promises;
const { readFileSync } = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Medicine = require("../../Models/MedicineSchema/MedicineSchema");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

Router.get("/GET-ALL-Medicine", async (req, res) => {
  try {
    const medicine = await Medicine.find().sort({ createdAt: -1 });
    if (!medicine) {
      res.status(204).json({ message: "No Data Exits" });
    }
    res.status(200).json({
      message: "Data Fetch Successfully",
      data: medicine,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.post("/file-upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  try {
    if (!file) {
      return res.status(403).json({ message: "No File Upload" });
    }

    const filePath = file.path;
    const fileData = await fs.readFile(filePath);
    const data = await JSON.parse(fileData);
    const medicine = await Medicine.insertMany(data);
    if (!medicine) {
      return res.status(403).json({ message: "Failed To Save Medicine Data" });
    }
    return res.status(201).json({ message: "Data Saved Successfully" });
  } catch (error) {
    res.status(500).json("internal server error");
  } finally {
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      console.error("Error deleting uploaded file:", unlinkError);
    }
  }
});
Router.post(
  "/bulk-upload-medicines",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const fileData = await fs.readFile(req.file.path, "utf-8");

      const data = JSON.parse(fileData);

      if (!Array.isArray(data)) {
        return res
          .status(400)
          .json({ message: "Uploaded file must be a JSON array" });
      }

      const chunkSize = 100000;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await Medicine.insertMany(chunk);
      }

      return res.status(201).json({
        message: "Successfully uploaded medicines data",
      });
    } catch (error) {
      console.error("Error uploading medicines data:", error);
      return res.status(500).json({
        message: "An error occurred while uploading the medicines data",
      });
    } finally {
      try {
        await fs.unlink(req.file.path); // Delete the file asynchronously
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }
  }
);
Router.post("/add-medicine", upload.none(), async (req, res) => {
  const {
    Name,

    BATCH,
    EXPIRY,
    QTY,
    Mrp,
    RATE,
  } = req.body;

  try {
    if (!Name) {
      return res.status(401).json("Feilds are required");
    }
    const medicine = await Medicine.create({
      Name,
      BATCH,
      EXPIRY,
      QTY,
      Mrp,
      RATE,
    });

    const medicineData = await Medicine.findById(medicine._id);
    if (!medicineData) {
      res.status(404).json({
        message: "Something went wrong while Saving the Medicine Data",
      });
    }
    return res
      .status(201)
      .json({ message: "SuccessFully Data Created", data: medicineData });
  } catch (error) {

    res.status(500).json("Something went wrong");
  }
});
Router.get("/get-one-medicine/:Id", async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return req.status(403).json("No medicine Id is Provided");
  }
  try {
    const medicineData = await Medicine.findById({ _id: Id });
    if (!medicineData) {
      return res
        .status(403)
        .json({ message: "No medicine Find By This Medicine Id" });
    }
    return res.status(200).json({
      message: "Medicine Data Fetch Successfully",
      data: medicineData,
    });
  } catch (error) {

    res.status(500).json("Something went wrong");
  }
});
Router.put("/update-one-medicine-data/:Id", upload.none(), async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return req.status(403).json("No medicine Id is Provided");
  }
  const { Name, BATCH, EXPIRY, QTY, Mrp, RATE } = req.body;
  try {
    const medicineData = await Medicine.findByIdAndUpdate(
      { _id: Id },
      {
        Name,
        BATCH,
        EXPIRY,
        QTY,
        Mrp,
        RATE,
      },
      { new: true }
    );
    if (!medicineData) {
      return res
        .status(403)
        .json({ message: "Faild To Update Medicine Data " });
    }
    return res.status(200).json({
      message: "Medicine Data Updated Successfully",
      data: medicineData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
Router.delete("/delete-one-medicine/:Id", async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return req.status(403).json("No medicine Id is Provided");
  }
  try {
    const medicineData = await Medicine.findByIdAndDelete({ _id: Id });
    if (!medicineData) {
      return res
        .status(403)
        .json({ message: "No medicine Find By This Medicine Id" });
    }
    return res.status(200).json({
      message: "Medicine Deleted Successfully",
      data: medicineData,
    });
  } catch (error) {

    res.status(500).json("Something went wrong");
  }
});
module.exports = Router;
