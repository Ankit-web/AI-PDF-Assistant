import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";
import serverConfig from "../config/serverConfig.js";

const createUser = async ({ name, email, password }) => {
  // Add validation
  if (!name || !email || !password) {
    throw new Error(`Missing required fields: name=${!!name}, email=${!!email}, password=${!!password}`);
  }

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
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

const getUserById = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

const updateUserProfile = async (userId, updates) => {
  const user = await userRepository.updateUser(userId, updates);
  if (!user) throw new Error("User not found");
  return user;
};

const deactivateUser = async (userId) => {
  const user = await userRepository.deactivateUser(userId);
  if (!user) throw new Error("User not found or already deactivated");
  return { message: "User deactivated successfully" };
};

const changeRole = async (userId, newRole) => {
  const user = await userRepository.updateUser(userId, { role: newRole });
  if (!user) throw new Error("User not found");
  return { message: "User role updated", user };
};

export default {
  getUserById,
  updateUserProfile,
  deactivateUser,
  changeRole,
  createUser,
  loginUser,
};
