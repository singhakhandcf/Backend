import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Book from "../models/book.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.config.js";
import { User } from "../models/user.model.js";

// Create Book

const createBook = asyncHandler(async (req, res) => {
  try {
    const { title, description, author, genre } = req.body;
    const { path } = req.file;
    if ([title, description, author, genre].some((field) => !field)) {
      throw new ApiError(400, "All fields are required");
    }

    const existingBook =await Book.findOne({title,author});
    if(existingBook){
      throw new ApiError(409,"Book with the same title and author already exists");
    }

    const result = await uploadOnCloudinary(path);
    if (!result) {
      throw new ApiError(500, "Error uploading file to Cloudinary");
    }
    const book = await Book.create({
      title,
      description,
      author,
      coverImage: result.url,
      genre,
    });
    res
      .status(201)
      .json(new ApiResponse(201, book, "Book created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});

// Delete Book

const deleteBook = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }
    await deleteFromCloudinary(book.coverImage);
    await Book.findByIdAndDelete(id);
    res
      .status(200)
      .json(new ApiResponse(200, book, "Book deleted successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});

const getAllBooks = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" , genre="" } = req.query;
    const query = {
      ...(search && {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ],
      }),
      ...(genre && {
        genre: { $regex: genre.split(" ").join("|"), $options: "i" },
      }),
    };

    const books = await Book.find(query)
      .select("-comments -description")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { books, totalBooks, totalPages },
          "Books retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});

// Get Book by ID
const getBookById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).populate("comments.user", "username");
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, book, "Book retrieved successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});

// Update Book
const updateBook = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.file) {
      const book = await Book.findById(id);
      const deleteResult = await deleteFromCloudinary(book.coverImage);
      if (deleteResult) {
        throw new ApiError(500, "Error uploading file to Cloudinary");
      }
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (!uploadResult) {
        throw new ApiError(500, "Error uploading file to Cloudinary");
      }
      updates.coverImage = uploadResult.url;
    }

    const book = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, book, "Book updated successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});

// add comment
const addComment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      throw new ApiError(400, "Comment content is required");
    }

    let book = await Book.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    book.comments.push({ user: userId, content });
    await book.save();
    book = await Book.findById(id).populate("comments.user", "username");
    res
      .status(201)
      .json(new ApiResponse(201, book, "Comment added successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});

const toggleWishlist = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const book = await Book.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    const user = await User.findById(userId);
    console.log(user);
    const isWishlisted = user?.wishlist?.includes(id);

    if (isWishlisted) {
      user.wishlist.pull(id);
    } else {
      user.wishlist.push(id);
    }

    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, user, "Wishlist updated successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});
const getMyWishlist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, user.wishlist, "Wishlist fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server Error"
    );
  }
});

export {
  createBook,
  getMyWishlist,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
  addComment,
  toggleWishlist,
};