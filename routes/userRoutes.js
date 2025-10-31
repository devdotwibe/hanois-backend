import express from "express";
import { registerUser, getUsers, loginUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getUsers);
router.post("/login", loginUser);

export default router;
