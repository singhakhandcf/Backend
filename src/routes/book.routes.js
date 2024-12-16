import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from "../controllers/book.controller.js";

const router = Router();
router.route("/").post(verifyJWT,upload.single('coverImage'), createBook);
//router.route("/").post(verifyJWT, createBook);
router.route("/").get(verifyJWT,getAllBooks);
router.route("/:id").get(verifyJWT,getBookById)
router.route("/update/:id").patch(verifyJWT, updateBook)
router.route("/delete/:id").delete(verifyJWT, deleteBook);

export default router;