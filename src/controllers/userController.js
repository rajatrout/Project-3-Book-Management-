const userModel = require("../models/userModel")
const validateEmail = require("email-validator")

const isValid = function (value) {   //function to check entered data is valid or not
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length === 0) return false;
    return true;
}
let validName = /\d/;
let validPass=new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$")



exports.createUser = async function (req, res) {

    try{


    let userDetails = req.body

    if (Object.keys(userDetails).length == 0) {
        res.status(400).send({ status: false, message: "No user Detail Received" })
        return
    }
    const { title, name, phone, email, password} = userDetails
    if (!isValid(title)) {
        res.status(400).send({ status: false, msg: "title is requred and enter title as [Mr,Mrs,Miss]" })
    }

    if (!isValid(name) || validName.test(name)) {
        res.status(400).send({ status: false, msg: "name is requred and enter name in correct format" })
    }
    if (!isValid(phone)) {
        res.status(400).send({ status: false, msg: " phone number is required" });
        return
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
        res.status(400).send({ status: false, message: "Please provide valid phone number" });
        return;
    }
    if (!isValid(email)) {
        res.status(400).send({ status: false, msg: " email is required" });
        return
    }


    if (!validateEmail.validate(email)) return res.status(400).send({ status: false, msg: "Enter a valid email" })
    let uniqueEmail= await internModel.findOne({ email: internDetails.email });
    if (uniqueEmail) return res.status(400).send({ status: false, msg: "email  already Used" })
    let uniquePhone = await internModel.findOne({   phone: internDetails.phone});
    if (uniquePhone) return res.status(400).send({ status: false, msg: "Phone no  already Used" })

    if(!isValid(password)) return res.status(400).send({ status: false, msg: "password is required " })

if(validPass.test(password)) return res.status(400).send({ status: false, msg: "password should be min 8 and max length 15" })


  let userData= await userModel.create(userDetails)
  if (!userData) return res.status(404).send({ status: false, msg: " user not found" })
    res.status(201).send({status:true,data:userData})

} catch (err) {
    console.log("This is the error:", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
}
}