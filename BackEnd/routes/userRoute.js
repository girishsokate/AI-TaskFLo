import express from "express";
import { registerUser, loginUser, getCurrentUser, updateUserProfile, changePassword } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

// Public Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Private Routes - Protected
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateUserProfile);
userRouter.put("/password", authMiddleware, changePassword);


export default userRouter;

