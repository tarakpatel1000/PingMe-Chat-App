import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token; //.token is the name given while creating token
        if(!token) {
            return res.status(401).json({
                message : "Unauthorized - No token provided"
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if(!decode) {
            return res.status(401).json({
                message : "Unauthorized - Invalid Token"
            });
        }

        const user = await User.findById(decode.userId).select("-password");
        if(!user) {
            return res.status(404).json({
                message : "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log(error);
    }
}