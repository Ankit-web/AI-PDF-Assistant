// ✅ services/userService.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userRepository from "../repositories/userRepository.js";
import serverConfig from "../config/serverConfig.js";

const getUserById = async (id) => {
  const user = await userRepository.findUserById(id);
  if (!user) throw new Error("User not found");
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

const updateUserProfile = async (id, updates) => {
  const updatedUser = await userRepository.updateUser(id, updates);
  return {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  };
};

const deactivateUser = async (id) => {
  await userRepository.updateUser(id, { isActive: false });
  return { message: "Account deactivated" };
};

const changeRole = async (id, newRole) => {
  const updated = await userRepository.updateUser(id, { role: newRole });
  return {
    message: "Role updated",
    role: updated.role,
  };
};

const createUser = async ({ name, email, password }) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) throw new Error("User already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    name,
    email,
    passwordHash,
    role: "student",
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

// we are now implementing the login functionality

const loginUser = async ({ email, password }) => {
    const user = await userRepository.findUserByEmail(email);
    if (!user) throw new Error("User not Found (userService)");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error("Invalid Credentials!");

    const token = jwt.sign(
        { id: user._id, role: user.role },
        serverConfig.JWT_SECRET,
        { expiresIn: serverConfig.JWT_EXPIRY }
    );

    return {
        message: "Login Successful!",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};


export default {
  getUserById,
  updateUserProfile,
  deactivateUser,
  changeRole,
  createUser,
  loginUser,
};

