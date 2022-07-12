const usersModel = require("../models/userModel")
const validator = require("validator");
const jwt = require("jsonwebtoken")

const isValid = function(value) { //function to check entered data is valid or not
    if (typeof value == undefined || value == null) return false;
    if (typeof value == "string" && value.trim().length === 0) return false;
    return true;
}
let validName = /^[a-zA-Z ]{3,30}$/
let validPass = /^[a-zA-Z0-9@*&]{8,15}$/

const createUser = async function(req, res) {

    try {

        let userDetails = req.body

        if (Object.keys(userDetails).length == 0) {
            return res.status(400).send({ status: false, message: "No user Details Received" })
        }
        const { title, name, phone, email, password, address } = userDetails
        const pincode = req.body.address.pincode


        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required " })
        }
        if ((title != 'Mr') && (title != 'Mrs') && (title != 'Miss')) {
            return res.status(400).send({ status: false, message: "Please enter the correct title (Mr, Mrs, Miss)" })
        }


        if (!isValid(name) || !validName.test(name)) {
            return res.status(400).send({ status: false, message: "Name is requred and enter name in correct format" })
        }


        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: "Phone number is required" });
            return
        }
        if (!/^[6-9]{1}[0-9]{9}$/.test(phone)) {
            res.status(400).send({ status: false, message: "Please provide valid phone number" });
            return;
        }
        let uniquePhone = await usersModel.findOne({ phone: userDetails.phone });
        if (uniquePhone) {
            return res.status(400).send({ status: false, message: "Phone no. already Used" })
        }


        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" });

        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "Enter a valid email" })
        }
        let uniqueEmail = await usersModel.findOne({ email: userDetails.email });
        if (uniqueEmail) {
            return res.status(400).send({ status: false, message: "Email  already Used" })
        }


        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required " })
        }
        if (!validPass.test(password)) {
            return res.status(400).send({ status: false, message: "Password should be min 8 and max length 15" })
        }

        if (address) {
            if (typeof address !== 'object') {
                return res.status(400).send({ status: false, message: "Address is not in correct format" })
            }

            if (pincode) {
                if (!/^[0-9]{6}$/.test(pincode)) {
                    return res.status(400).send({ status: false, message: "Pin code needed in valid format." })
                }
            }
        }
        let userData = await usersModel.create(userDetails)

        res.status(201).send({ status: true, message: "Success", data: userData })

    } catch (err) {
        console.log("This is the error:", err.message)
        res.status(500).send({ message: "Error", error: err.message })
    }
}



const loginUser = async function(req, res) {
    try {
        let email = req.body.email;
        if (!email) return res.status(400).send({
            status: false,
            message: "Email Is Not Given"
        })
        let password = req.body.password;
        if (!password) return res.status(400).send({
            status: false,
            message: "Password Is Not Given"
        })

        let User = await usersModel.findOne({ email: email, password: password });
        if (!User) return res.status(404).send({ status: false, message: "Email-Id or the password is not Valid" });

        let token = jwt.sign({
                UserId: User._id.toString(),
                iat: Date.now(),
                exp: (Date.now()) + (60 * 1000) * 2
            },
            "functionup-project-3"
        );
        res.setHeader("x-api-key", token);

        return res.status(200).send({ status: true, message: "Successfull Log In", token: token });

    } catch (error) {

        return res.status(500).send({ message: "Error", error: error.message })
    }
};

module.exports.loginUser = loginUser
module.exports.createUser = createUser