import asyncHandler from "express-async-handler";
import { io } from "../app.js";
import { Task } from "../model/taskModel.js";
import ErrorResponse from "../utils/errorResponse.js";
const taskController = () => {
  const addTask = asyncHandler(async (req, res) => {
    const { userId } = req.user;

    const { title, description, status, priority, dueDate, dueTime } = req.body;
    const dueDateTime = new Date(`${dueDate}T${dueTime}:00`);

    const task = {
      title,
      description,
      status,
      priority,
      dueDateTime,
      createdBy: userId,
    };


    const newTask = await Task.create(task);
    const [formattedTask] = await Task.aggregate([
      {
        $match: { _id: newTask._id },
      },
      {
        $lookup: {
          from: "users", 
          localField: "createdBy",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $project: {
          createdBy: {
            email: "$userData.email",
            _id: "$userData._id",
          },
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          dueDateTime: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    io.emit("taskAdded", { newTask: formattedTask });

    res.status(200).json({
      message: "task added",
      newTask,
    });
  });

  const getTasks = asyncHandler(async (req, res) => {

    const tasks = await Task.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedByUserData",
        },
      },
      {
        $unwind: {
          path: "$updatedByUserData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          createdBy: "$userData.email",
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          dueDateTime: 1,
          createdBy: {
            email: "$userData.email",
            _id: "$userData._id",
          },
          updatedBy: {
            email: "$updatedByUserData.email",
            _id: "$updatedByUserData._id",
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    res.status(200).json({
      message: "data retrived",
      tasks,
    });
  });

  const editTask = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const { _id, ...newValues } = req.body;

    const newData = {
      updatedBy: userId,
      ...newValues,
    };
    const updatedTask = await Task.findByIdAndUpdate(_id, newData, {
      new: true,
    });
    const [formattedTask] = await Task.aggregate([
      {
        $match: { _id: updatedTask._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedByUserData",
        },
      },
      {
        $unwind: {
          path: "$updatedByUserData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          createdBy: {
            email: "$userData.email",
            _id: "$userData._id",
          },
          updatedBy: {
            email: "$updatedByUserData.email",
            _id: "$updatedByUserData._id",
          },
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          dueDateTime: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    io.emit("taskEdited", { updatedTask: formattedTask });
    res.status(200).json({
      message: "task edited successfully",
      updatedTask: formattedTask,
    });
  });

  const deleteTask = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const { taskId } = req.params;
    if (!taskId) {
      throw new ErrorResponse("id is required", 404);
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      createdBy: userId,
    });

    if (!deletedTask) {
      throw new ErrorResponse("no task found", 404);
    }

    io.emit("taskDeleted", { deletedTaskId: deletedTask._id });

    res.status(200).json({
      message: "Task deleted successfully",
      deletedTaskId: deletedTask._id,
    });
  });
  
  return { addTask, getTasks, editTask, deleteTask };
};

export default taskController;
