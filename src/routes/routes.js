const express = require("express");
const router = express.Router();
const userController= require("../controllers/userController")
const booksController= require("../controllers/booksController")
const { mid1,mid2} = require("../middleware/auth")



router.post("/register", userController.createUser)

router.post("/login", userController.loginUser)

router.post("/books",mid1,booksController.createBook)

router.get("/books",mid1,booksController.getBook)

router.delete("/books/:bookId",mid1,mid2,booksController.deletedBookById)



router.put("/books/:bookId",mid1,mid2, booksController.updateBook)

module.exports = router;