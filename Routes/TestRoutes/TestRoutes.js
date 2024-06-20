const express = require("express");

const Router = express.Router();

const Test = require("../../Models/TestSchema/TestSchema");

Router.get("/GET-ALL-Test", async (req, res) => {
  try {
    const testData = await Test.find().select("-createdAt -updatedAt");
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
  const { Name, Availability, Cost, Category, Description } = req.body;
  try {
    if (!(Name && Cost && Availability)) {
      return res.status(400).json("This Fields Are Required");
    }
    const test = await Test.create({
      Description,
      Availability,
      Name,
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
Router.get("/get-one-test/:Id", async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return req.status(403).json("No Test Id is Provided");
  }
  try {
    const testData = await Test.findById({ _id: Id }).select(
      "-createdAt -updatedAt"
    );
    if (!testData) {
      return res.status(403).json({ message: "No Test Find By This Test Id" });
    }
    return res.status(200).json({
      message: "Test Data Fetch Successfully",
      data: testData,
    });
  } catch (error) {}
});
Router.put("/update-one-test-data/:Id", async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return req.status(403).json("No Test Id is Provided");
  }
  const { Description, Availability, Cost, Category } = req.body;
  try {
    const testData = await Test.findByIdAndUpdate(
      { _id: Id },
      {
        Description,
        Availability,
        Cost,
        Category,
      },
      { new: true }
    );
    if (!testData) {
      return res.status(403).json({ message: "Faild To Update Test Data " });
    }
    return res.status(200).json({
      message: "Test Data Updated Successfully",
      data: testData,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

module.exports = Router;
