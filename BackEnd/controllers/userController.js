import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const EXPIRES_IN = "24h";


const createToken = (id) => {
  console.log(process.env.JWT_SECRET)
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: EXPIRES_IN });
};


export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({success: false, message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = createToken(user._id);
    res.status(201).json({ success: true, token, user:{ id: user._id, name: user.name, email: user.email }, message: "User created successfully"});
    
    
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message:"Server error" });
  }
};


// LOGIN FUNCTION

  export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
      const user = await User.findOne({ email }); 
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      } 
      const token = createToken(user._id);
      res.status(200).json({ success: true, token, user : { id: user._id, name: user.name, email: user.email }})

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };  

// GET CURRENT USER

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {  
        return res.status(404).json({ success: false, message: "User not found" });
    } else {
      res.status(200).json({ success: true, user});  
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  
  }
}

// UPDATE USER PROFILE

export const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    if(!name || !email || !validator.isEmail(email)){
      return res.status(400).json({success:false, message:"Name and Email fields are required"})
    }
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true, select: "name email"}
    );

     res.status(200).json({ success: true, user });


  }catch (error){
     console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

// CHANGE PASSWORD FUNCTION

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
      if (!oldPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect Password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};




