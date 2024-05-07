const express = require("express");

const Router = express.Router();

const Test = require("../../Models/TestSchema/TestSchema");

Router.get("/GET-ALL-Test", async (req, res) => {
  try {
    const testData = await Test.find();
    if (!testData) {
      res.status(204).json({ message: "No Data Exits" });
    }
    res.status(200).json({
      message: "Data Fetch Successfully",
      data: testData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

Router.post("/Add-Test", async (req, res) => {
  const { TestName, Availability, Cost, Category, Description } = req.body;
  try {
    if (!(TestName && Cost && Availability)) {
      return res.status(400).json("This Fields Are Required");
    }
    const test = await Test.create({
      Description,
      Availability,
      TestName,
      Cost,
      Category,
    });
    const testData = await Test.findById(test._id);
    if (!testData) {
      return res
        .status(401)
        .json("Something Went Wrong While Saving Medicine Data");
    }
    return res
      .status(201)
      .json({ message: "Successfully Data Saved", data: testData });
  } catch (error) {
    res.status(500).json("Internal Server Error!");
  }
});

Router.post("");

module.exports = Router;
