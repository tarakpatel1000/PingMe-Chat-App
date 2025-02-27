import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.SECRET_KEY, {expiresIn : '1d'});
    res.cookie("token", token, {
        maxAge : 24 * 60 * 60 * 1000,
        httpOnly : true,
        sameSite : "strict"
    });

    return token;
}