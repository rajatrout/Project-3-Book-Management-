const express = require("express");
const router = express.Router();
const userController= require("../controllers/userController")
const booksController= require("../controllers/booksController")





router.post("/login",userController.loginUser)

router.get("/books",booksController.getBook)

module.exports = router;