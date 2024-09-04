import { Router } from "express";
import taskController from "../controller/taskController.js";
const router = Router();
const taskRoutes = () => {
  router.post("/add", taskController().addTask);
  router.get("/all-tasks",taskController().getTasks)
  router.patch("/edit-task",taskController().editTask)
  router.delete("/delete-task/:taskId",taskController().deleteTask)
  return router;
};

export default taskRoutes;
