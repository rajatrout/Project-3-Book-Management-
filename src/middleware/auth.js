const jwt=require("jsonwebtoken")
const bookModel= require("../models/booksModel")


exports.mid1 = function (req, res, next) {
  try {


    // console.log(req)
    token = req.headers["x-api-key"]
    if (!token) token = req.headers["x-Api-key"]
    if (!token) return res.status(400).send({ status: false, msg: "token is required" })
    console.log(token)
    let decodedToken = jwt.verify(token, "functionup-project-3")
    if (!decodedToken) return res.status(400).send({ status: false, msg: " token is invalid" })
    
    req.decodedToken = decodedToken;
    console.log(req.decodedToken)

    next()
  }
catch (err) {
    console.log("This is the error:", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
  }
};
exports.mid2 = async function (req, res, next) {
    try {
      // console.log(req.decodedToken)
  
      const token = req.decodedToken;
      const bookId = req.params.bookId;
      const book = await bookModel.findById(bookId);
    //   console.log(book)
  
      if (!book ) {
        return res.status(404).send({ status: false, msg: "Book Not Found" })
      }
      const userId = book.userId;
      if (token)
  
        if (token.UserId != userId)
          return res.status(403).send({
            msg: 'FORBIDDEN',
            error: 'User logged is not allowed to modify the requested users data',
          });
      next();
    } catch (err) {
      console.log('This is the error :', err.message);
      res.status(500).send({ msg: 'Error', error: err.message });
    }
  };
  
