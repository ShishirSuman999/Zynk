import httpStatus from "http-status"
import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Meeting } from "../models/meeting.model.js"
import bcrypt, { hash } from "bcrypt"
import crypto from "crypto"

const login = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(httpStatus.BAD_REQUEST).json({message: "Please enter valid details"})
    try {
        const user = await User.findOne({ username })
        if (!user) return res.status(httpStatus.NOT_FOUND).json({message: "User Not Found"})
        
        let isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (isPasswordCorrect) {
            let token = crypto.randomBytes(32).toString("hex")
            user.token = token

            await user.save()
            return res.status(httpStatus.OK).json({message: "User Logged In Successfully", token: token})
        } else return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid User"})
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: `Something went wrong: ${e}`})
    }
}

const register = async (req, res) => {
    const { name, username, password } = req.body
    try {
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User({
            name: name,
            username: username,
            password: hashedPassword,
        })
        await newUser.save()
        return res.status(httpStatus.CREATED).json({message: "User registered successfully"})
    } catch (e) {
        res.json({message: `Something went wrong: ${e}`})
    }
}

const getUserHistory = async (req, res) => {
    const {token} = req.query
    try {
        const user = await User.findOne({token: token})
        const meeting = await Meeting.find({user_id: user.username})
        res.json(meeting)
    } catch (error) {
        res.json({message: `SOMETHING WENT WRONG: ${error}`})
    }
}

const addToHistory = async (req, res) => {
    const {token, meeting_code} = req.body
    try {
        const user = await User.findOne({token: token})
        const newMeeting = await Meeting({
            user_id: user.username,
            meetingCode: meeting_code,
        })
        await newMeeting.save()
        res.status(httpStatus.CREATED).json({message: "Meeting added to history"})
    } catch (error) {
        res.json({message: `SOMETHING WENT WRONG: ${error}`})
    }
}

export { login, register, getUserHistory, addToHistory }