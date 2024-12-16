import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Book from "../models/book.model.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.config.js";



// Create Book


const createBook = asyncHandler(async (req, res) => {
  try {
    const { title, description, author,  genre } = req.body;
    const { path } = req.file;
    if ([title, description, author, genre].some(field => !field)) {
        throw new ApiError(400, "All fields are required");
    }
    const result = await uploadOnCloudinary(path);
    if (!result) {
        throw new ApiError(500, "Error uploading file to Cloudinary");
      }
    const book = await Book.create({ title, description, author, coverImage: result.url, genre });
    res.status(201).json(new ApiResponse(201, book, "Book created successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Server Error");
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
    res.status(200).json(new ApiResponse(200, book, "Book deleted successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Server Error");
  }
});
// Get All Books (Paginated & Search)
const getAllBooks = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 2, search = "" } = req.query;
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const books = await Book.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);

    res.status(200).json(new ApiResponse(200, { books, total }, "Books retrieved successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Server Error");
  }
});

// Get Book by ID
const getBookById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    res.status(200).json(new ApiResponse(200, book, "Book retrieved successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Server Error");
  }
});

// Update Book
const updateBook = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const book = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    res.status(200).json(new ApiResponse(200, book, "Book updated successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Server Error");
  }
});

export { createBook, deleteBook, getAllBooks, getBookById, updateBook };