const booksModel = require("../models/booksModel");
const bookModel = require('../models/booksModel')
const userModel = require("../models/userModel")
const validator = require('validator');
const reviewModel = require("../models/reviewModel");

const isValid = function(value) { //function to check entered data is valid or not
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length === 0) return false;
    return true;
}
let validregex = /^[a-zA-Z ]{3,30}$/
let validsubcategory = /^[a-zA-Z ,]{3,150}$/

//======================================================================================================================

const createBook = async function(req, res) {

        try {
            let final = {}
            let data = req.swap
            final.bookCover = data

            if (Object.keys(req.body).length === 0) {
                return res.status(400).send({ status: false, message: "Kindly enter all the required details." })
            }

            const { title, excerpt, userId, ISBN, category, subcategory, reviews, isDeleted, releasedAt } = req.body

            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "Invalid title or title is not mentioned. " })
            }
            let duplicateTitle = await bookModel.findOne({ title: title })
            if (duplicateTitle) {
                return res.status(400).send({ status: false, message: "The book is already created, try with some other book." })
            }
            final.title = title


            if (!isValid(excerpt)) {
                return res.status(400).send({ status: false, message: "Invalid excerpt or excerpt is not mentioned." })
            }
            final.excerpt = excerpt


            if (!isValid(userId)) {
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


            if (!isValid(ISBN)) {
                return res.status(400).send({ status: false, message: "Invalid ISBN or ISBN is not mentioned." })
            }
            if (!validator.isISBN(ISBN)) {
                return res.status(400).send({ status: false, message: "Invalid ISBN" })

            }
            const duplicateISBN = await booksModel.findOne({ ISBN: ISBN })
            if (duplicateISBN) {
                return res.status(400).send({ status: false, message: "ISBN already used." })
            }
            final.ISBN = ISBN


            if (!isValid(category)) {
                return res.status(400).send({ status: false, message: "Invalid category or category is not mentioned." })
            }
            if (!validregex.test(category)) {
                return res.status(400).send({ status: false, message: "Invalid category format" })
            }
            final.category = category


            if (!isValid(subcategory)) {
                return res.status(400).send({ status: false, message: "Invalid subcategory or subcategory is not mentioned." })
            }
            if (!validsubcategory.test(subcategory)) {
                return res.status(400).send({ status: false, message: "Invalid subcategory format" })
            }
            final.subcategory = subcategory.split(',')
            console.log(final)

            final.reviews = reviews

            if (isDeleted === true) {
                final.isDeleted = true
                final.deletedAt = Date.now()
            }


            if (!isValid(releasedAt)) {
                return res.status(400).send({ status: false, message: "Invalid release date or release date is not mentioned." })
            }
            if (!validator.isDate(releasedAt)) {
                return res.status(400).send({ status: false, message: "Invalid Date format. Give the date in correct format (YYYY-MM-DD ------- (Year - Month - Date))" })
            }
            final.releasedAt = releasedAt


            const saveData = await bookModel.create(final)

            return res.status(201).send({ status: true, message: 'Success', data: saveData })

        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    }
    // ==========================================================get books=======================================================================

const getBook = async function(req, res) {
    try {
        const query = req.query
        const subcategory = req.query.subcategory.split(',')
        console.log(subcategory)

        if (Object.keys(req.query).length == 0) {
            const allBookData = await booksModel.find({ isDeleted: false }).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
            if (!allBookData) {
                return res.status(404).send({ status: "false", message: "No Book Found" })
            }

            return res.status(200).send({ status: "true", message: "Success", data: allBookData })

        } else {

            const bookData = await booksModel.find({ isDeleted: false, $or: [query, { subcategory: subcategory }] }).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

            if (bookData.length == 0) {
                return res.status(404).send({ status: "false", massege: "No Book Found" })
            }

            return res.status(200).send({ status: "true", message: "Success", data: bookData })
        }

    } catch (error) {
        console.log("This is the error :", error.message)
        return res.status(500).send({ msg: "Error", error: error.message })
    }
}

// ==============================================================get book by id=================================================================

const getBookById = async function(req, res) {
    try {
        bookId = req.params.bookId

        if (!bookId) {
            return res.status(400).send({ status: false, message: "Blog Id Is Needed" })
        }

        if (!validator.isMongoId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid bookId" })
        }


        const bookData = await bookModel.findOne({ _id: bookId }).lean()
        if (!bookData) {
            return res.status(404).send({ status: false, msg: "No Book Found With Given Book Id" })
        }
        if (bookData.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "Book is Deleted" })
        }

        const reviewsData = await reviewModel.find({ bookId: bookId })
            //  bookData = JSON.parse(JSON.stringify(bookData))
        const data = {...bookData, reviewsData: reviewsData }

        return res.status(200).send({ status: "true", message: "Success", data: data })

    } catch (error) {

        return res.status(500).send({ msg: "Error", error: error.message })
    }
}

//=============================================================================update book =====================================================


const updateBook = async function(req, res) {

        try {
            const bookId = req.params.bookId

            const deleteOfId = await bookModel.findById(bookId)
            if (deleteOfId.isDeleted == true) {
                return res.status(404).send({ status: false, message: "Book is already deleted." })
            }

            const { title, excerpt, releasedAt, ISBN } = req.body

            let final = {}

            if (title) {
                if (Object.keys(title).length == 0 || !isValid(title)) {
                    return res.status(400).send({ status: false, message: "Title to update is not in valid format or not mentioned. " })
                }
                let duplicateTitle = await bookModel.findOne({ title: title })
                if (duplicateTitle) {
                    return res.status(400).send({ status: false, message: "The title already present, kindly update to some other title." })
                }
                final.title = title
            }


            if (excerpt) {
                if (!isValid(excerpt)) {
                    return res.status(400).send({ status: false, message: "Excerpt to update is not in valid format or not mentioned. " })
                }
                final.excerpt = excerpt
            }


            if (releasedAt) {
                if (!isValid(releasedAt)) {
                    return res.status(400).send({ status: false, message: "Release date to update is not in valid format or not mentioned. " })
                }
                if (!validator.isDate(releasedAt)) {
                    return res.status(400).send({ status: false, message: "Invalid Date format. Give the date in correct format (YYYY-MM-DD ------- (Year - Month - Date))" })
                }
                final.releasedAt = releasedAt
            }


            if (ISBN) {
                if (!isValid(ISBN)) {
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

            console.log(final);
            const saveData = await bookModel.findOneAndUpdate({ _id: bookId }, final, { new: true })

            return res.status(200).send({ status: true, message: "Sucessfully Updated", data: saveData })

        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }

    }
    // =============================================================delete book by id=====================================================================



const deletedBookById = async function(req, res) {
    try {

        const token = req.decodedToken

        const bookId = req.params.bookId;

        if (!validator.isMongoId(bookId)) {
            return res.status(404).send({ status: false, message: "Invalid Book Id." })
        }

        let book = await bookModel.findById(bookId);
        if (!book) {
            return res.status(404).send({ status: false, message: "Book not found." })
        }

        let userId = book.userId.valueOf()

        if (userId != token.UserId) {
            return res.status(403).send({
                status: false,
                message: 'User logged is not allowed to modify the requested users data',
            })
        }

        if (book.isDeleted === true) {
            return res.status(404).send({ status: false, message: "Book is already deleted" })
        }

        let deletedBook = await bookModel.findOneAndUpdate({ _id: bookId }, {
            isDeleted: true,
            deletedAt: Date()
        }, { new: true });

        return res.status(200).send({ status: true, message: "Book is succesfully deleted" });

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }

}

module.exports.createBook = createBook
module.exports.getBook = getBook
module.exports.getBookById = getBookById
module.exports.updateBook = updateBook
module.exports.deletedBookById = deletedBookById