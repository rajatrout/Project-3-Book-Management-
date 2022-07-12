const jwt = require("jsonwebtoken")
const bookModel = require("../models/booksModel")
const userModel = require("../models/userModel")
const validator = require("validator")


exports.authenticate = function(req, res, next) {
    try {


        token = req.headers["x-api-key"]
        if (!token) token = req.headers["x-Api-key"]
        if (!token) return res.status(400).send({ status: false, msg: "Token is required" })

        jwt.verify(token, "functionup-project-3", function(err, decodedToken) {

            if (err) return res.status(401).send({ status: false, msg: "Token is Incorrect" })

            let time = Date.now()
            let exp = decodedToken.exp
            if (time > exp) {
                return res.status(400).send({ status: false, message: "Token is expired" })
            }
            req.decodedToken = decodedToken
            next()

        })

    } catch (err) {
        console.log("This is the error:", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

exports.Authorisation = async(req, res, next) => {
    try {

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Kindly enter all the required details." })
        }

        const token = req.decodedToken;
        const userIdBody = req.body.userId
        const bookId = req.params.bookId;

        if (bookId) {
            if (!validator.isMongoId(bookId)) {

                return res.status(400).send({ status: false, message: "Invalid bookId" })
            }
        }

        if (userIdBody) {

            if (!validator.isMongoId(userIdBody)) {

                return res.status(400).send({ status: false, message: "Invalid userId" })
            }
        }

        if (userIdBody || bookId) {

            if (userIdBody) {

                let validUserId = await userModel.findOne({ _id: userIdBody })
                if (!validUserId) {
                    return res.status(400).send({ status: false, message: "No user found." })
                }
                1

                if (userIdBody != token.UserId) return res.status(403).send({
                    status: false,
                    message: 'User logged is not allowed to modify the requested users data',
                })
                next()
            }

            if (bookId) {
                let useId = await bookModel.findOne({ _id: bookId }).select({ userId: 1, _id: 0 })
                if (!useId) {
                    return res.status(404).send({ status: false, msg: "Book not found" })
                }


                let userId = useId.userId.valueOf()

                if (userId != token.UserId) return res.status(403).send({
                    status: false,
                    message: 'User logged is not allowed to modify the requested users data',
                })
                next()
            }

        } else
            return res.status(400).send({ status: false, msg: "UserId is required" })

    } catch (err) {
        console.log("This is the error:", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}