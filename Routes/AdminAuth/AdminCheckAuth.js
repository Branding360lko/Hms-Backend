const auth = require("../../Middlewares/AdminAuthenticationCheck");
const { AdminModel } = require("../../Models/AdminSchema/AdminSchema");
const express = require("express");
const router = express.Router();

router.get("/AdminProfile", auth, async (req, res) => {
  try {
    res.json({ message: "Admin is authorized", data: req.Admin });
  } catch (error) {
    console.log(error);
    res.json("An error occured");
  }
});

module.exports = router;
