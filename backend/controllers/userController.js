// ✅ controllers/userController.js
import userService from "../services/userService.js";

// 🔁 CHANGED: no more req.body.userId — now use req.user.id from authMiddleware
const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id); // ✅ Changed
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// 🔁 CHANGED: use req.user.id for logged-in user and full req.body for updates
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "❌ updates object is missing or empty" });
    }

    const updated = await userService.updateUserProfile(req.user.id, updates); // ✅ Changed
    return res.json({ message: "✅ Profile updated", user: updated });

  } catch (err) {
    console.error("💥 Error in updateProfile:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 🔁 CHANGED: no need for userId in body — use req.user.id
const deactivate = async (req, res) => {
  try {
    const result = await userService.deactivateUser(req.user.id); // ✅ Changed
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ KEEP AS IS — admin will manually send user id + role in body
const changeUserRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    if (!id || !role) return res.status(400).json({ error: "User ID and new role are required" });

    const result = await userService.changeRole(id, role);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ No changes
const signupUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    const code = err.message === "User already exists" ? 409 : 500;
    res.status(code).json({ error: err.message });
  }
};

// ✅ FIXED: typo in catch block (error vs err)
const loginUser = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export default {
  getProfile,
  updateProfile,
  deactivate,
  changeUserRole,
  signupUser,
  loginUser,
};
