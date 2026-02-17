import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Task from "../models/taskModel.js";

// CREATE A TASK
export const createTask = async (req, res) => {
  try{
    const {title, description, priority, dueDate, completed} = req.body;

    const task = new Task({
      title, 
      description, 
      priority, 
      dueDate, 
      owner: req.user.id, 
      completed: completed === "yes" || completed === true, 
    })

    const saved = task.save();
    res.status(201).json({success:true, task : saved})

  }catch(err){
    console.error(err);
    res.status(400).json({success: false, message: err.message });
  }
}

// GET ALL TASKS
export const getTasks = async (req, res) => {
  try{
    const tasks = await Task.find({owner:req.user.id}).sort({createdAt: -1})
    res.status(200).json({success: true, tasks})
  }catch(err){
    console.error(err);
    res.status(500).json({success: false, message: err.message });
  }
}

//GET TASKS BY ID (MUST BELONG TO CURRENT USER) 
  export const getTaskById = async (req, res) => {
    try{
      const task = await Task.findOne({_id: req.params.id, owner:req.user.id })
      if(!task){
        return res.status(404).json({success: false, message: "Task Not Found" });
      }
      res.status(201).json({success: true, task})
    }catch(err){
      console.error(err);
      res.status(500).json({success: false, message: err.message });
    }
  };

// UPDATE A TASK BY ID
export const updateTask = async(req, res) => {
  
  try{
    const data = {...req.body};
    console.log(data)
    if(data.completed !== undefined){
      data.completed = data.completed === "yes" || data.completed === true;
    }
    const updatedTask = await Task.findOneAndUpdate(
      {_id: req.params.id, owner:req.user.id }, 
      data, 
      {runValidators: true, returnDocument: 'after'})
    if(!updatedTask){
      return res.status(404).json({status:false, message:"Task not found"})
    }
    res.json({success:true, task: updatedTask})

  }catch(err){
      console.error(err);
      res.status(500).json({success: false, message: err.message });
  }
}

// DELETE TASK BY ID
export const deleteTask = async (req, res) => {
  try{
    const task = await Task.findOneAndDelete(
      {_id: req.params.id, owner:req.user.id },
    )
    if (!task) { 
      return res.status(404).json({ success: false, message: "Task not found" }); 
    }
    res.status(200).json({success: true, task})
    
  }catch(err){
      console.error(err);
      res.status(500).json({success: false, message: err.message });
  }
}