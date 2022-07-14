const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const booksController = require("../controllers/booksController")
const { authenticate, Authorisation } = require("../middleware/auth")
const reviewController = require("../controllers/reviewController")
const awsController = require("../middleware/aws")


router.post("/register", userController.createUser)

router.post("/login", userController.loginUser)

router.post("/books", awsController.awsGenerator, booksController.createBook)

router.get("/books", authenticate, booksController.getBook)

router.get("/books/:bookId", authenticate, booksController.getBookById)

router.delete("/books/:bookId", authenticate, booksController.deletedBookById)

router.post("/books/:bookId/review", reviewController.createReview)

router.put("/books/:bookId", authenticate, Authorisation, booksController.updateBook)

router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteByReviewId)

// if api is invalid OR wrong URL
// router.all("/**", function(req, res) {
//     res.status(404).send({
//         status: false,
//         message: "The api you request is not available"
//     })
// })

module.exports = router;