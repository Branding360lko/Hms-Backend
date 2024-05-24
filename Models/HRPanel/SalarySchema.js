const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SalarySchema = new Schema({
    SalaryId:{type:String, required:true},
    EmployeeId:{type:String, required:true},
    BasicSalary:{type:String, required:true},
    Allowance:{type:String, required:true},
    Incentive:{type:String},
    TotleSalary:{type:String},
    CTC:{type:String},
    MonthlyinHand:{type:String},
})

const Salary = mongoose.model('Salary', SalarySchema);
module.exports = Salary;

