import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan";

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

app.get('/getme',(req,res)=>{

   res.send({
        name: 'Rohit',
        age: 21
    })
})

export { app }