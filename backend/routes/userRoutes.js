import express from "express";
import userController from "../controllers/userController.js";
import { isLoggedIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", userController.signupUser);
router.post("/login", userController.loginUser);

// ⛔️ Require login for everything below:
router.get("/me", isLoggedIn, userController.getProfile);
router.patch("/update", isLoggedIn, userController.updateProfile);
router.delete("/deactivate", isLoggedIn, userController.deactivate);

// Only admin can change roles
router.patch("/role",isLoggedIn, isAdmin, userController.changeUserRole);

export default router;
// middle -> routes -> going to update the controller