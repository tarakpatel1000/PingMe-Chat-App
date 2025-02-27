import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : { $ne : loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log(error);
    }
}

export const getAllMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const allMessages = await Message.find({
            $or : [
                {senderId : myId, receiverId : userToChatId},
                {senderId : userToChatId, receiverId : myId}
            ]
        })

        res.status(200).json(allMessages)
    } catch (error) {
        console.log(error);
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id : receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url; 
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageUrl
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        //todo real time functionality goes here

        res.status(201).json(newMessage);
    } catch (error) {
        console.log(error);
    }
}