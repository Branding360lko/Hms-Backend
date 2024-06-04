const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EmpolyeeSchema = new Schema(
    {
      mainId: {type: String,required: true},
      title:{type:String, required:true},
      fullname:{type:String, required: true},
      dateOfBrith:{type:String, required: true},
      zipCode:{type:String, required: true},
      state:{type:String, required: true},
      city:{type:String, required: true},
      Nationality:{type:String, required: true},
      AadharNumber:{type:String, required: true},
      bloodgroup:{type:String, required: true},
      workedemail:{type:String, required: true},
      country:{type:String, required: true},
      empolyeeType:{type:String, required: true},
      mertialStatus:{type:String},
      PAN:{type:String},
      createdBy:{type:String},
      image:{type:String, required: true},
      gender:{type:String, required: true},
      currentAddress:{type:String},
      permanentaddress:{type:String},
      status:{type:String}
    },
    { timestamps: true }
    );

    
const  Empolyee = mongoose.model("Empolyee", EmpolyeeSchema);

module.exports = Empolyee;
