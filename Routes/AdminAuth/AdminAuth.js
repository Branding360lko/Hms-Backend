const express = require("express");

const Router = express.Router();

require("../../DB/connection");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const AdminModel = require("../../Models/AdminSchema/AdminSchema");

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

function validateEmail(email) {
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const secretKey = process.env.SECRET_KEY;

Router.get("/Admin-GET-ALL", async (req, res) => {
  try {
    const admins = await AdminModel.find();

    return res.status(200).json(admins);
  } catch (error) {
    res.status(500).json("Internal Server Error!");
  }
});

Router.get("/Admin-GET-ONE/:adminId", async (req, res) => {
  const AdminId = req.params.adminId;
  try {
    const admin = await AdminModel.findOne({ adminId: AdminId });

    if (!admin) {
      return res.status(400).json("Admin not found!");
    }
    return res.status(200).json(admin);
  } catch (error) {
    res.status(500).json("Internal Server Error!");
  }
});

Router.post("/AdminRegister", async (req, res) => {
  const { adminName, adminEmail, adminPassword, adminRole } = req.body;
  try {
    if (validateEmail(adminEmail)) {
      const emailExist = await AdminModel.findOne({ adminEmail: adminEmail });

      if (emailExist) {
        return res.status(400).json("Admin already exist with same email id!");
      } else {
        bcrypt.hash(adminPassword, 10, async (error, hashedPassword) => {
          if (error) {
            return next(error);
          }
          const newAdmin = new AdminModel({
            adminId: "ADM-" + generateUniqueId(),
            adminName: adminName,
            adminEmail: adminEmail,
            adminPassword: hashedPassword,
            adminRole: adminRole,
          });

          return await newAdmin
            .save()
            .then(() =>
              res.status(200).json({ message: "Admin Registered successfully" })
            );
        });
      }
    } else {
      return res.status(400).json("Invalid Email!");
    }
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

Router.post("/AdminLogin", async (req, res) => {
  const { adminEmail, adminPassword } = req.body;

  try {
    const admin = await AdminModel.findOne({ adminEmail: adminEmail });

    if (!admin) {
      return res.status(401).json("Admin username is incorrect!");
    }

    const password = await bcrypt.compare(adminPassword, admin.adminPassword);

    if (!password) {
      return res.status(401).json("Password is incorrect");
    }

    const token = jwt.sign(
      {
        adminId: admin.adminId,
        adminEmail: admin.adminEmail,
        adminRole: admin.adminRole,
        adminName: admin.adminName,
        isDeleted: admin.isDeleted,
      },
      secretKey,
      {
        expiresIn: 3600,
      }
    );

    res.cookie("adminToken", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      token,
      data: admin,
      adminRole: admin.adminRole,
      message: `${admin.adminEmail} logged in successfully`,
    });
  } catch (error) {
    res.status(500).json("Authentication Failed");
  }
});

Router.put("/Admin-PUT/:adminId", async (req, res) => {
  const AdminID = req.params.adminId;

  const { adminName, adminPassword, adminRole } = req.body;

  console.log(req.body);
  try {
    // const adminExistWithEmail = await AdminModel.findOne({
    //   adminEmail: adminEmail,
    // });
    // const adminExistWithID = await AdminModel.findOne({ adminId: AdminID });
    // if (
    //   adminExistWithEmail.adminEmail &&
    //   adminExistWithEmail.adminEmail !== adminExistWithID.adminEmail
    // ) {
    //   return res.status(422).json("Admin already exist with same email id!");
    // }

    bcrypt.hash(adminPassword, 10, async (error, hashedPassword) => {
      if (error) {
        return next(error);
      }

      const admin = await AdminModel.findOneAndUpdate(
        { adminId: AdminID },
        {
          adminName: adminName ? adminName : AdminModel.adminName,
          // adminEmail: adminEmail ? adminEmail : AdminModel.adminEmail,
          adminPassword: adminPassword
            ? hashedPassword
            : AdminModel.adminPassword,
          adminRole: adminRole ? adminRole : AdminModel.adminRole,
        }
      );

      if (!admin) {
        return res.status(404).json("Admin not found");
      }
      return res.status(200).json({ message: "Admin updated successfully!" });
    });
  } catch (error) {
    res.status(500).json("Internal Server Error!");
  }
});

Router.put("/AdminChangePasswordSelf-PUT/:adminId", async (req, res) => {
  const AdminID = req.params.adminId;

  const { adminOldPassword, adminPassword } = req.body;

  try {
    // const adminExistWithEmail = await AdminModel.findOne({
    //   adminEmail: adminEmail,
    // });
    // const adminExistWithID = await AdminModel.findOne({ adminId: AdminID });
    // if (
    //   adminExistWithEmail.adminEmail &&
    //   adminExistWithEmail.adminEmail !== adminExistWithID.adminEmail
    // ) {
    //   return res.status(422).json("Admin already exist with same email id!");
    // }

    const admin = await AdminModel.findOne({ adminId: AdminID });

    const password = await bcrypt.compare(
      adminOldPassword,
      admin.adminPassword
    );
    if (!password) {
      return res.status(401).json("Old password is incorrect!");
    }

    if (password) {
      bcrypt.hash(adminPassword, 10, async (error, hashedPassword) => {
        if (error) {
          return next(error);
        }

        const admin = await AdminModel.findOneAndUpdate(
          { adminId: AdminID },
          {
            // adminEmail: adminEmail ? adminEmail : AdminModel.adminEmail,
            adminPassword: adminPassword
              ? hashedPassword
              : AdminModel.adminPassword,
          }
        );

        if (!admin) {
          return res.status(404).json("Admin not found");
        }
        return res
          .status(200)
          .json({ message: "Password changed successfully!" });
      });
    }
  } catch (error) {
    res.status(500).json("Internal Server Error!");
  }
});

Router.put("/AdminActive/:adminId", async (req, res) => {
  const AdminID = req.params.adminId;
  const { isActive } = req.body;
  console.log(isActive);
  try {
    const admin = await AdminModel.findOneAndUpdate(
      { adminId: AdminID },
      {
        isActive: isActive,
      }
    );

    if (!admin) {
      return res.status(404).json("Admin not found");
    }

    return res.status(200).json({
      message: `${admin.adminEmail} status changed!`,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error!");
  }
});

// Router.get("/adminLogout", function (req, res) {
//   clearCookie("adminToken");
//   res.json("Admin Logout");
// });

module.exports = Router;
