import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
  addComment,
  toggleWishlist,
  getMyWishlist,
} from "../controllers/book.controller.js";

const router = Router();

router.route("/").post(verifyJWT, upload.single("coverImage"), createBook);
router.route("/:id/comment").post(verifyJWT, addComment);
router.route("/").get(verifyJWT, getAllBooks);
router.route("/toggleWishlist/:id").get(verifyJWT, toggleWishlist);
router.route("/wishlist").get(verifyJWT, getMyWishlist);
router.route("/:id").get(verifyJWT, getBookById);
router.route("/update/:id").patch(verifyJWT,upload.single("coverImage"), updateBook);
router.route("/delete/:id").delete(verifyJWT, deleteBook);

export default router;