const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Empolyee = require("../../Models/HRPanel/EmpolyeeSchema");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const Salary = require("../../Models/HRPanel/SalarySchema");
require("../../DB/connection");

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

    router.get("/Get-all-empolyee", async (req, res) => {
        try {
            const empolyees = await Empolyee.find();
            return res
            .status(200)
            .json({ message: "empoyee data get sucessfully", data: empolyees });
        } catch (error) {
            return res.status(500).json("Internal Server Error");
        }
    });

    router.get("/get-one-empolyee/:empoyeeId", async (req, res) => {
        const id = req.params.empoyeeId;
        try {
            const empolyees = await Empolyee.findOne({ mainId: id });
            if (!empolyees) {
            return res.status(404).json("Empoyee data not find");
            }
            return res.status(200).json({ data: empolyees });
        } catch (error) {
            return res.status(500).json("Internal server error");
        }
    });

    router.post("create-empolyee",upload.single('image'),async(req,res)=>{
        const{ title, fullname, dateOfBrith, zipCode, createdBy, state, city, Nationality, AadharNumber, 
            bloodgroup, workedemail, country, empolyeeType, mertialStatus, PAN, gender,currentAddress,permanentaddress,
            BasicSalary,
            Allowance,
            Incentive,
            TotleSalary,
            CTC,
            MonthlyinHand,} = req.body
        try{
            const empoyees = new Empolyee ({
                mainId : 'EMP'+generateUniqueId(),
                title:title,
                fullname:fullname,
                dateOfBrith:dateOfBrith,
                zipCode:zipCode,
                state:state,
                city:city,
                Nationality:Nationality,
                AadharNumber:AadharNumber,
                bloodgroup:bloodgroup,
                workedemail:workedemail,
                country:country,
                empolyeeType:empolyeeType,
                mertialStatus:mertialStatus,
                PAN:PAN,
                image:req.file.filename,
                createdBy:createdBy,
                gender:gender,
                currentAddress:currentAddress,
                permanentaddress:permanentaddress
            })
            await empoyees.save();

            const NewSalary = new Salary({
                SalaryId:'SAL'+generateUniqueId(),
                EmployeeId :empoyees.mainId,
                BasicSalary:BasicSalary,
                Allowance:Allowance,
                Incentive:Incentive,
                TotleSalary:TotleSalary,
                CTC:CTC,
                MonthlyinHand:MonthlyinHand
            })
            await NewSalary.save;
            return res.status(200).json({message:'empolyee created sucessfully', employee :empoyees, Salary:NewSalary});
        }catch(error){
            console.log(error);
            return res.status(500).json('Internal server error');
        }
    });

    router.put(
    "/update-employee/:mainId",
    upload.single("image"),
    async (req, res) => {
        const {
        title,
        fullname,
        dateOfBrith,
        zipCode,
        state,
        city,
        Nationality,
        AadharNumber,
        bloodgroup,
        workedemail,
        country,
        empolyeeType,
        mertialStatus,
        PAN,
        gender,
        } = req.body;
        const { mainId } = req.params;
        try {
        let employee = await Empolyee.findOne({ mainId });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        if (req.file) {
            if (employee.image) {
            fs.unlinkSync(employee.image);
            }
            employee.image = req.file.filename;
        }

        employee.title = title || employee.title;
        employee.fullname = fullname || employee.fullname;
        employee.dateOfBrith = dateOfBrith || employee.dateOfBrith;
        employee.zipCode = zipCode || employee.zipCode;
        employee.state = state || employee.state;
        employee.city = city || employee.city;
        employee.Nationality = Nationality || employee.Nationality;
        employee.AadharNumber = AadharNumber || employee.AadharNumber;
        employee.bloodgroup = bloodgroup || employee.bloodgroup;
        employee.workedemail = workedemail || employee.workedemail;
        employee.country = country || employee.country;
        employee.empolyeeType = empolyeeType || employee.empolyeeType;
        employee.mertialStatus = mertialStatus || employee.mertialStatus;
        employee.PAN = PAN || employee.PAN;
        employee.image = req.file ? req.file.filename : employee.image;
        employee.gender = gender || employee.gender;
        await employee.save();

        return res
            .status(200)
            .json({ message: "Employee updated successfully", data: employee });
        } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
        }
    }
    );

    router.put('/Employee-Salary-Update/:employeeId', async(req, res)=>{
        const employeeId = req.params.employeeId;
        const{  BasicSalary,
                Allowance,
                Incentive,
                TotleSalary,
                CTC,
                MonthlyinHand, } = req.body;
        try {
            const SalaryToUpdate =await Salary.findOne({EmployeeId:employeeId});
            if(!SalaryToUpdate){
                return res.status(404).json({message:"Salary data not find according to Employee ID"});
            }
            SalaryToUpdate.BasicSalary   =BasicSalary || SalaryToUpdate.BasicSalary;
            SalaryToUpdate.Allowance     =Allowance || SalaryToUpdate.Allowance;
            SalaryToUpdate.Incentive     =Incentive || SalaryToUpdate.Incentive;
            SalaryToUpdate.CTC           = CTC || SalaryToUpdate.CTC;
            SalaryToUpdate.MonthlyinHand = MonthlyinHand || SalaryToUpdate.MonthlyinHand;
            await SalaryToUpdate.save();
            return res.status(200).json({message:"Salary Update successfully", Salary: SalaryToUpdate});
        } catch (error) {
                console.log(error.message);
                return res.status(500).json({message:" Inter server error"});
        }
    })

module.exports = router;
