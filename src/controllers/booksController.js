//const { query } = require("express");
const booksModel = require("../models/booksModel");
const bookModel = require('../models/booksModel')
const validator = require('validator')
//const moment = require('moment')

const isValid = function (value) {
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



const createBook = async function (req, res) {
    const { title, excerpt, userId, ISBN, category, subcategory, reviews, isDeleted, releasedAt } = req.body

    let final = {}
    if (Object.keys(req.body) === 0) {
        return res.status(400).send({ status: false, message: "Kindly enter all the required details(title, excerpt, userId, ISBN,category, subcategory, requiredAt. )" })
    }


    if (isValid(title)) {
        return res.status(400).send({ status: false, message: "Invalid title or title is not mentioned. " })
    }
    let duplicateTitle = await bookModel.findOne({ title: title })
    if (duplicateTitle) {
        return res.status(400).send({ status: false, message: "The book is already created, try with some other book." })
    }
    final.title = title


    if (isValid(excerpt)) {
        return res.status(400).send({ status: false, message: "Invalid excerpt or excerpt is not mentioned." })
    }
    final.excerpt = excerpt


    if (isValid(userId)) {
        return res.status(400).send({ status: false, message: "Invalid userId or userId is not mentioned." })
    }
    if (!validator.isMongoId(userId)) {
        return res.status(400).send({ status: false, message: "Invalid userId" })
    }
    final.userId = userId


    if (isValid(ISBN)) {
        return res.status(400).send({ status: false, message: "Invalid ISBN or ISBN is not mentioned." })
    }
    if (!validator.isISBN(ISBN)) {
        return res.status(400).send({ status: false, message: "Invalid ISBN" })
    }
    final.ISBN = ISBN


    if (isValid(category)) {
        return res.status(400).send({ status: false, message: "Invalid category or category is not mentioned." })
    }
    final.category = category


    if (isValid(subcategory)) {
        return res.status(400).send({ status: false, message: "Invalid subcategory or subcategory is not mentioned." })
    }
    final.subcategory = subcategory

    if (reviews) {
        if (typeof (reviews) !== Number) {
            return res.status(400).send({ status: false, message: "Invalid reviews." })
        }
        final.reviews = reviews
    }

    if (isDeleted === true) {
        final.isDeleted = true
        final.deletedAt = Date.now()
    }


    if (isValid(releasedAt)) {
        return res.status(400).send({ status: false, message: "Invalid release date or release date is not mentioned." })
    }
    if (!validator.isDate(releasedAt)) {
        return res.status(400).send({ status: false, message: "Invalid Date. Give the date in correct format (YYYY-MM-DD ------- (Year - Month - Date))" })
    }
    final.releasedAt = releasedAt


    let saveData = await bookModel.create(final)

    return res.status(201).send({ status: true, message: 'Success', data: saveData })

}

exports.deletedBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;
       if(!(bookId)) return res.status(400).send({status:false,msg:"please enter book id"})
       if(!validator.isMongoId(bookId)) return res.status(400).send({status:false,msg:"book id is not valid"})
        let book= await bookModel.findById(bookId);
        if (!book) return res.status(404).send({ status: false, msg: "  book not found" })
        

if(book.isDeleted===true) return res.status(404).send({status:false,msg:"book is already deleted"})

       
        // blogData = req.body
        let deletedBook = await bookModel.findOneAndUpdate({ _id: bookId }, {
            $set: {
                isDeleted: true, deletedAt: Date()
            }
        }, { new: true });
        res.status(200).send({ status: true, msg:"book is succesfully deleted" });



    } catch (err) {
        console.log("This is the error:", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}



module.exports.getBook = getBook
module.exports.createBook = createBook
