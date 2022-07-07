const booksModel = require("../models/booksModel");
const bookModel = require('../models/booksModel')
const validator = require('validator')

const isValid = function(value) {
    if (value == undefined || value == null) return true
    if (typeof value !== 'string' || value.trim().length == 0) return true
    return false
}


const createBook = async function(req, res) {
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
    let validUserId = await userModel.findOne({ userId: userId })
    if (!validUserId) {
        return res.status(400).send({ status: false, message: "Invalid userId, not available in database." })
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
        if (typeof(reviews) !== Number) {
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
        return res.status(400).send({ status: false, message: "Invalid Date format. Give the date in correct format (YYYY-MM-DD ------- (Year - Month - Date))" })
    }
    final.releasedAt = releasedAt


    let saveData = await bookModel.create(final)

    return res.status(201).send({ status: true, message: 'Success', data: saveData })

}


//======================================================================================================================


const getBook = async function(req, res) {
    try {
        let query = req.query
        if (Object.keys(req.query).length == 0) {
            const allbookdata = await booksModel.find({ isDeleted: false })
            if (!allbookdata) return res.status(404).send({ status: "false", massege: "No Book Found" })
            return res.status(200).send({ Status: "true", Data: allbookdata })
        } else {
            const bookdata = await booksModel.find({ isDeleted: false, $or: [query] })
            if (!bookdata) return res.status(404).send({ status: "false", massege: "No Book Found" })
            return res.status(200).send({ Status: "true", Data: bookdata })
        }
    } catch (error) {
        console.log("This is the error :", error.message)
        return res.status(500).send({ msg: "Error", error: error.message })
    }
}


//======================================================================================================================

function valid(value) {
    if (typeof value !== 'string') return true
    if (value.trim().length == 0) return true
    return false
}

const updateBook = async function(req, res) {

    try {
        const bookId = req.params.bookId
        console.log(bookId)
        console.log("a")
        if (!bookId) {
            return res.status(400).send({ status: false, message: "BookId is not provied." })
        }
        if (!validator.isMongoId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid bookId" })
        }
        const deleteOfId = await bookModel.findById(bookId)
        if (deleteOfId.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Book is already deleted." })
        }
        const { title, excerpt, releasedAt, ISBN } = req.body


        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "No details provided. So nothing to update." })
        }

        let final = {}

        if (valid(title)) {
            return res.status(400).send({ status: false, message: "Title to update is not in valid format or not mentioned. " })
        }
        let duplicateTitle = await bookModel.findOne({ title: title })
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: "The title already present, kindly update to some other title." })
        }
        final.title = title


        if (valid(excerpt)) {
            return res.status(400).send({ status: false, message: "Excerpt to update is not in valid format or not mentioned. " })
        }
        final.excerpt = excerpt


        if (releasedAt) {
            return res.status(400).send({ status: false, message: "Release date to update is not in valid format or not mentioned. " })
        }
        final.releasedAt = releasedAt


        if (ISBN) {
            if (valid(ISBN)) {
                return res.status(400).send({ status: false, message: "ISBN to update is not in valid format or not mentioned. " })
            }
            if (!validator.isISBN(ISBN)) {
                return res.status(400).send({ status: false, message: "ISBN is invalid." })
            }
            const isbn = await bookModel.findOne({ ISBN: ISBN })
            if (isbn) {
                return res.status(400).send({ status: false, message: "ISBN to update is already there." })
            }
            final.ISBN = ISBN
        }
        const saveData = await bookModel.findOneAndUpdate({ _id: bookId }, final, { new: true })

        return res.status(200).send({ status: true, message: "Sucessfully Updated", data: saveData })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createBook = createBook
module.exports.getBook = getBook
module.exports.updateBook = updateBook