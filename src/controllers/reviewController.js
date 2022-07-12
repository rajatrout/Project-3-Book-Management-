const booksModel = require('../models/booksModel')
const reviewModel = require('../models/reviewModel')
const validator = require('validator')

const isValid = function(value) {
    if (value == undefined || value == null) return false
    if (typeof value == 'string' && value.trim().length == 0) return false
    return true
}

const createReview = async function(req, res) {

    try {

        const bookId = req.params.bookId
        if (!validator.isMongoId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid bookId" })
        }
        const deletedBook = await booksModel.findOne({ _id: bookId })
        if (!deletedBook) {
            return res.status(404).send({ status: false, message: "The book not present." })
        }
        if (deletedBook.isDeleted === true) {
            return res.status(404).send({ status: false, message: "The book is deleted." })
        }

        let final = {}
        final.bookId = bookId

        const { reviewedBy, rating, review } = req.body

        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, message: "No reviews" })
        }


        if (bookId) {
            const a = await booksModel.findById(bookId)
            a.reviews++
                await a.save()
        }

        if (reviewedBy) {

            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, message: "Reviewer name not in correct format or not mentioned." })
            }
            if (!/^[a-zA-Z ]{3,30}$/.test(reviewedBy)) {
                return res.status(400).send({ status: false, message: "Invalid reviewer name." })
            }
            final.reviewedBy = reviewedBy

        }


        final.reviewedAt = Date.now()


        if (typeof rating !== 'number' || !/^[1-5]{1}$/.test(rating)) {
            return res.status(400).send({ status: false, message: "Invalid rating or rating is not mentioned." })
        }
        final.rating = rating


        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, message: "Invalid review or review is not mentioned." })
            }
            final.review = review
        }
        console.log(final);

        let arr = []
        const saveData = await reviewModel.create(final)
        arr.push(saveData)

        const bookData = await booksModel.findById(bookId).lean()

        const data = {...bookData, reviewData: arr }

        return res.status(201).send({ status: true, message: "Review Done", data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// _________________________________________________

const updateReview = async function(req, res) {

    try {
        const bookId = req.params.bookId


        if (!validator.isMongoId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid bookId" })
        }
        const deletedBook = await booksModel.findOne({ _id: bookId })
        if (!deletedBook) {
            return res.status(404).send({ status: false, message: "The book not found." })

        }
        if (deletedBook.isDeleted === true) {
            return res.status(404).send({ status: false, message: "The book is deleted." })
        }


        const reviewId = req.params.reviewId
        if (!validator.isMongoId(reviewId)) {
            return res.status(400).send({ status: false, message: "Invalid reviewId" })
        }
        const deletedReview = await reviewModel.findOne({ _id: reviewId })
        if (!deletedReview) {
            return res.status(404).send({ status: false, message: "Review not found." })
        }
        if (deletedReview.isDeleted === true) {
            return res.status(404).send({ status: false, message: "Review is deleted." })
        }


        reviewDetail = req.body

        if (Object.keys(reviewDetail).length == 0) {
            return res.status(400).send({ status: false, msg: "Nothing to update" })
        }

        const { reviewedBy, rating, review } = reviewDetail

        let final = {}

        if (reviewedBy) {

            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, message: "Reviewer name not in correct format or not mentioned." })
            }
            if (!/^[a-zA-Z ]{3,30}$/.test(reviewedBy)) {
                return res.status(400).send({ status: false, message: "Invalid reviewer name." })
            }
        }
        final.reviewedBy = reviewedBy


        if (rating) {
            if (typeof rating !== 'number' || !/^[1-5]{1}$/.test(rating)) {
                return res.status(400).send({ status: false, message: "Invalid rating or rating is not mentioned." })
            }

        }
        final.rating = rating


        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, message: "Invalid review or review is not mentioned." })
            }
            final.review = review
        }

        let arr = []
        const bookData = await booksModel.findById(bookId).lean()

        const updated = await reviewModel.findOneAndUpdate({ _Id: reviewId }, final, { new: true })
        arr.push(updated)

        const data = {...bookData, reviewsData: arr }

        res.status(200).send({ status: false, message: "Succesfully updated", data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// --------------------------------------------------------------------------------------------------------------------------------------------

const deleteByReviewId = async function(req, res) {

    try {

        const bookId = req.params.bookId

        if (!validator.isMongoId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid bookId" })
        }
        const deletedBook = await booksModel.findOne({ _id: bookId })
        if (!deletedBook) {
            return res.status(404).send({ status: false, message: "The book not found." })

        }
        if (deletedBook.isDeleted === true) {
            return res.status(404).send({ status: false, message: "The book is deleted." })
        }


        const reviewId = req.params.reviewId
        if (!validator.isMongoId(reviewId)) {
            return res.status(400).send({ status: false, message: "Invalid reviewId" })
        }
        const deletedReview = await reviewModel.findOne({ _id: reviewId })
        if (!deletedReview) {
            return res.status(404).send({ status: false, message: "Review not found." })
        }
        console.log(deletedReview);
        if (deletedReview.isDeleted === true) {
            return res.status(404).send({ status: false, message: "Review is already deleted." })
        }


        let deletingReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, {
            isDeleted: true,
            deletedAt: Date.now()
        }, { new: true });


        if (bookId) {
            const a = await booksModel.findById(bookId)
            a.reviews--
                await a.save()

        }

        res.status(200).send({ status: true, message: "Review is succesfully deleted" })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports.updateReview = updateReview
module.exports.createReview = createReview
module.exports.deleteByReviewId = deleteByReviewId