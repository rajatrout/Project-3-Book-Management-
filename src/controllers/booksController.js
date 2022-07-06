//const { query } = require("express");
const booksModel = require("../models/booksModel");
const bookModel = require('../models/booksModel')
const validator = require('validator')
    //const moment = require('moment')

    const nullValue = function(value) {
        if (value == undefined || value == null) return true
        if (typeof value !== 'string' || value.trim().length == 0) return true
        return false
    }


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


//======================================================================================================================



const createBook = async function(req, res) {
    const { title, excerpt, userId, ISBN, category, subcategory, reviews, isDeleted, releasedAt } = req.body

    let final = {}
    if (Object.keys(req.body) === 0) {
        return res.status(400).send({ status: false, message: "Kindly enter all the required details(title, excerpt, userId, ISBN,category, subcategory, requiredAt. )" })
    }


    if (nullValue(title)) {
        return res.status(400).send({ status: false, message: "Invalid title or title is not mentioned. " })
    }
    let duplicateTitle = await bookModel.findOne({ title: title })
    if (duplicateTitle) {
        return res.status(400).send({ status: false, message: "The book is already created, try with some other book." })
    }
    final.title = title


    if (nullValue(excerpt)) {
        return res.status(400).send({ status: false, message: "Invalid excerpt or excerpt is not mentioned." })
    }
    final.excerpt = excerpt


    if (nullValue(userId)) {
        return res.status(400).send({ status: false, message: "Invalid userId or userId is not mentioned." })
    }
    if (!validator.isMongoId(userId)) {
        return res.status(400).send({ status: false, message: "Invalid userId" })
    }
    final.userId = userId


    if (nullValue(ISBN)) {
        return res.status(400).send({ status: false, message: "Invalid ISBN or ISBN is not mentioned." })
    }
    if (!validator.isISBN(ISBN)) {
        return res.status(400).send({ status: false, message: "Invalid ISBN" })
    }
    final.ISBN = ISBN


    if (nullValue(category)) {
        return res.status(400).send({ status: false, message: "Invalid category or category is not mentioned." })
    }
    final.category = category


    if (nullValue(subcategory)) {
        return res.status(400).send({ status: false, message: "Invalid subcategory or subcategory is not mentioned." })
    }
    final.subcategory = subcategory

if(reviews) {
    if (typeof(reviews )!== Number) {
        return res.status(400).send({ status: false, message: "Invalid reviews." })
    }
    final.reviews = reviews
}

    if (isDeleted === true) {
        final.isDeleted = true
        final.deletedAt = Date.now()
    }

    
    if (nullValue(releasedAt)) {
        return res.status(400).send({ status: false, message: "Invalid release date or release date is not mentioned." })
    }
    if (!validator.isDate(releasedAt)) {
        return res.status(400).send({ status: false, message: "Invalid Date. Give the date in correct format (YYYY-MM-DD ------- (Year - Month - Date))" })
    }
    final.releasedAt = releasedAt


    let saveData = await bookModel.create(final)

    return res.status(201).send({ status: true, message: 'Success', data: saveData })

}


module.exports.getBook=getBook
module.exports.createBook = createBook
