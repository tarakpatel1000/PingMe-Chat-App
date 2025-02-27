import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;
    if (!password || !email || !fullName) {
      res.status(400).json({
        message: "All fields are compulsory",
      });
    }

    if (password.length < 6) {
      res.status(400).json({
        message: "Password should be greater or equal to 6 characters",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({
        message: "User already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        message: "User sign up succesfully",
        newUser,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({
        message : "All fields are required"
      })
    }

    const user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({
        message : "Invalid Credentials"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) {
      return res.status(400).json({
        message : "Invalid Credentials"
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      message : "Login successful",
      user
    })
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {maxAge : 0});
    res.status(200).json({
      message : "User logged out successfully"
    })
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if(!profilePic) {
      return res.status(400).json({
        message : "Please provide your profile picture"
      })
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic : uploadResponse.secure_url}, {new : true});

    res.status(200).json(updatedUser);

  } catch (error) {
    console.log(error);
  }
}

export const checkAuth = (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
}
