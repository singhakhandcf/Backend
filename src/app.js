import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan";
import userRouter from "./routes/user.routes.js"
import bookRouter from "./routes/book.routes.js"
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(morgan('dev'))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes defined here

app.use("/api/v1/users", userRouter)
app.use("/api/v1/books",bookRouter)

export { app }