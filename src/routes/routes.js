const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const booksController = require("../controllers/booksController")



router.post("/register", userController.createUser)

router.post("/login", userController.loginUser)

router.post("/books", booksController.createBook)

router.get("/books", booksController.getBook)

router.put("/books/:bookId", booksController.updateBook)

module.exports = router;