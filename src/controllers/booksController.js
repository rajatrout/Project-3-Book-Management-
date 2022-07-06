//const { query } = require("express");
const booksModel = require("../models/booksModel");


const getBook = async function (req, res) {
    try {
        let query = req.query
        if (Object.keys(req.query).length == 0) {
            const allbookdata = await booksModel.find({ isDeleted: false })
            if (!allbookdata) return res.status(404).send({ status: "false", massege: "No Book Found" })
            return res.status(200).send({ Status: "true", Data: allbookdata })
        }

        else {
            const bookdata = await booksModel.find({ isDeleted: false, $or: [query] })
            if (!bookdata) return res.status(404).send({ status: "false", massege: "No Book Found" })
            return res.status(200).send({ Status: "true", Data: bookdata })
        }
    }
    catch (error) {
        console.log("This is the error :", error.message)
        return res.status(500).send({ msg: "Error", error: error.message })
    }
}

module.exports.getBook=getBook