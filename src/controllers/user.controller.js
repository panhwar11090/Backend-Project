import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { ApiError} from "../utils/ApiError.js"
import {uploaCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req,res)=>{
    // res.status(200).json({
    //     message: "Ok Sab Thek he"
    // })
    const{fullname ,email, username, password} = req.body
    if(
        [fullname, email,username,password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is reqired")
    }

    const avatar = await uploaCloudinary(avatarLocalPath);
    const coverImage = await uploaCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar Files is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while regitering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User Registerd Successfully")
    )
})

export{
    registerUser
}