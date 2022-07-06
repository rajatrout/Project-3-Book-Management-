const userModel= require("../models/userModel")
const jwt= require("jsonwebtoken")

const loginUser = async function (req, res) {
    try{
    let email = req.body.email;
    if (!email) return res.status(400).send({status: false,
        message: "Email Is Not Given"})
    let password = req.body.password;
    if (!password) return res.status(400).send({status: false,
        message: "password Is Not Given"})
  
    let User= await userModel.findOne({ email: email, password: password });
    if (!User) return res.status(404).send({ status: false, msg: "Email-Id or the password is not Valid" });
  
    let token = jwt.sign(
      {
        UserId: User._id.toString(),
        batch: "Radon",
        organisation: "FunctionUp",
      },
      "functionup-project-3"
    );
    res.setHeader("x-api-key", token);
    return res.status(200).send({ status: true, message: "Successfull Log In", token: token });
    }
    catch (error) {
      console.log("This is the error :", error.message)
      return res.status(500).send({ msg: "Error", error: error.message })
  }
  };

  module.exports.loginUser=loginUser