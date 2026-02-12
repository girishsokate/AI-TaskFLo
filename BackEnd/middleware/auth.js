import e from "express";
import express from "express";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith("Bearer")){
    return res.status('401').json({success: false, message:"Not Authorized - Token Missing"})
  }
  const token = req.headers.authorization.split(" ")[1];
  try {    
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select("-password");
      if(!user){
        return res.status(401).json({ success: false, message: "User not found" });
      }
      req.user = user;
      next();
        
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};  

export default authMiddleware;


