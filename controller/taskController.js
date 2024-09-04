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

    console.log("task is ", task);

    const newTask = await Task.create(task);
    const [formattedTask] = await Task.aggregate([
      {
        $match: { _id: newTask._id }, // Match the newly created task by its ID
      },
      {
        $lookup: {
          from: "users", // Assuming your user collection is named 'users'
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
    // const { userId } = req.body;

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
    console.log("tasks ", tasks);
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
    // const newTask = await Task.create(task);
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
    console.log("udpated task ", updatedTask);
    console.log("formated task", formattedTask);
    io.emit("taskEdited", { updatedTask: formattedTask });
    res.status(200).json({
      message: "task edited successfully",
      updatedTask: formattedTask,
    });
  });

  const deleteTask = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    // const { id } = req.body;
    const { taskId } = req.params;
    if (!taskId) {
      throw new ErrorResponse("id is required", 404);
    }

    // Find and delete the task
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
  //   const addTask = asyncHandler(async (req, res) =>{

  //       const newTask = await Task.create(req.body); // Create a new task in the database
  //       io.emit('taskAdded', newTask); // Emit an event to all connected clients
  //       res.status(201).json(newTask);

  //   });

  //   // Endpoint to update a task
  //   app.put('/tasks/:id', async (req, res) => {
  //     try {
  //       const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
  //         new: true,
  //       });
  //       io.emit('taskUpdated', updatedTask); // Emit an event when a task is updated
  //       res.status(200).json(updatedTask);
  //     } catch (err) {
  //       res.status(500).json({ error: 'Failed to update task' });
  //     }
  //   });

  //   // Endpoint to delete a task
  //   app.delete('/tasks/:id', async (req, res) => {
  //     try {
  //       await Task.findByIdAndDelete(req.params.id);
  //       io.emit('taskDeleted', req.params.id); // Emit an event when a task is deleted
  //       res.status(200).json({ message: 'Task deleted' });
  //     } catch (err) {
  //       res.status(500).json({ error: 'Failed to delete task' });
  //     }
  //   });

  return { addTask, getTasks, editTask, deleteTask };
};

export default taskController;
