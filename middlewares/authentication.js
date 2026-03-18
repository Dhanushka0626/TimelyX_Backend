import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export default function authenticateUser(req, res, next) {
    const header = req.header("Authorization");

    if (!header) {
        return next();
    }

    const token = header.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                message: "Invalid or Expired Token"
            });
        }

        req.user = decoded;
        next();
    });
}