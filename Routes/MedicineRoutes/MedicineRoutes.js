const express = require("express");

const Router = express.Router();
const fs = require("fs");
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
const fileFilter = (req, file, cb) => {
  // const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png",];
  // if (allowedFileTypes.includes(file.mimetype)) {
  //   cb(null, true);
  // } else {
  //   cb(null, false);
  // }
  if (
    file.mimetype === "application/json" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage, fileFilter });
// const upload = multer({ dest: "uploads/" });

Router.get("/GET-ALL-Medicine", async (req, res) => {
  try {
    const medicine = await Medicine.find();
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
Router.post(
  "/bulk-upload-medicines",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const filePath = req.file.path;
      const fileData = fs.readFileSync(filePath);

      const data = JSON.parse(fileData);

      if (!Array.isArray(data)) {
        return res
          .status(400)
          .json({ message: "Uploaded file must be a JSON array" });
      }

      const chunkSize = 100000; // Adjust according to your needs
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
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }
  }
);
Router.post("/add-medicine", async (req, res) => {
  const {
    Name,

    BATCH,
    EXPIRY,
    QTY,
    Mrp,
    RATE,
  } = req.body;
  console.log(
    Name,

    BATCH,
    EXPIRY,
    QTY,
    Mrp,
    RATE
  );
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
    console.log(error);
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
  } catch (error) {}
});
Router.put("/update-one-medicine-data/:Id", async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return req.status(403).json("No medicine Id is Provided");
  }
  const { BATCH, EXPIRY, QTY, Mrp, RATE } = req.body;
  try {
    const medicineData = await Medicine.findByIdAndUpdate(
      { _id: Id },
      {
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

module.exports = Router;
