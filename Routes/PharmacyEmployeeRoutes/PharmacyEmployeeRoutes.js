const express = require("express");

const Router = express.Router();

const PharmacyEmployee = require("../../Models/PharmacyEmployeeSchema/PharmacyEmployeeSchema");

Router.get("/get-all-pharmacy-employee", async (req, res) => {
  try {
    const pharamacyEmployees = await PharmacyEmployee.find();
    if (!pharamacyEmployees) {
      return res.status(403).json({ message: "No Data Found While Fetching" });
    }
    return res
      .status(200)
      .json({ message: "Successfully fetched data", data: pharamacyEmployees });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
Router.get("/get-one-pharmacy-employee/:Id", async (req, res) => {
  const Id = req.params.Id;
  try {
    const pharamacyEmployeeData = await PharmacyEmployee.findById({ _id: Id });
    if (!pharamacyEmployeeData) {
      return res
        .status(403)
        .json({ message: "No Data Found With This Employee Id" });
    }
    return res.status(200).json({
      message: "SuccessFully Data Fetched This Employee Id",
      data: pharamacyEmployeeData,
    });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
Router.post("/add-pharamcy-employee", async (req, res) => {
  const {
    Name,
    gender,
    dateOfBirth,
    email,
    Designation,
    JoiningDate,
    EmployeePhoto,
    LicenseNumber,
    ExpiryDate,
    ShiftDetails,
  } = req.body;
  try {
    if (
      !(Name && dateOfBirth && email && gender && Designation && JoiningDate)
    ) {
      return res
        .status(403)
        .json({ message: "Please Fill all Required Filed's" });
    }
    const employee = await PharmacyEmployee.create({
      Name,
      dateOfBirth,
      gender,
      email,
      Designation,
      JoiningDate,
      EmployeePhoto,
      LicenseInfo: { LicenseNumber, ExpiryDate },
      ShiftDetails,
    });
    const verifyEmployee = await PharmacyEmployee.findById(employee?._id);
    if (!verifyEmployee) {
      return res.status(403).json({
        message:
          "Something Went Wrong While Creating Pharamacy Employee,Try Again Later",
      });
    }
    return res.status(201).json({
      message: "Employee Created Successfully ",
      data: verifyEmployee,
    });
  } catch (error) {}
});
Router.put("/update-pharamcy-employee/:Id", async (req, res) => {
  const Id = req.params.Id;
  const {
    Name,
    gender,
    dateOfBirth,
    email,
    Designation,
    JoiningDate,
    EmployeePhoto,
    LicenseNumber,
    ExpiryDate,
    ShiftDetails,
  } = req.body;
  try {
    const employee = await PharmacyEmployee.findByIdAndUpdate(
      { _id: Id },
      {
        Name: Name ? Name : PharmacyEmployee.Name,
        dateOfBirth: dateOfBirth ? dateOfBirth : PharmacyEmployee.dateOfBirth,
        gender: gender ? gender : PharmacyEmployee.gender,
        email: email ? email : PharmacyEmployee.email,
        Designation: Designation ? Designation : PharmacyEmployee.Designation,
        JoiningDate: JoiningDate ? JoiningDate : PharmacyEmployee.JoiningDate,
        EmployeePhoto: EmployeePhoto
          ? EmployeePhoto
          : PharmacyEmployee.EmployeePhoto,
        LicenseInfo: {
          LicenseNumber: LicenseNumber
            ? LicenseNumber
            : PharmacyEmployee.LicenseInfo,
          ExpiryDate: ExpiryDate ? ExpiryDate : PharmacyEmployee.ExpiryDate,
        },
        ShiftDetails: ShiftDetails
          ? ShiftDetails
          : PharmacyEmployee.ShiftDetails,
      },
      {
        new: true,
      }
    );
    if (!employee) {
      return res
        .status(403)
        .json({ message: "Faild To Update,Please Try Again Later" });
    }
    return res
      .status(202)
      .json({ message: "SuccessFully Updated Employee", data: employee });
  } catch (error) {
    res.status(500).json("internal server error");
  }
});
module.exports = Router;
