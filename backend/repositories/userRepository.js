// ✅ repositories/userRepository.js
import User from "../models/userModel.js";

const createUser = async (data) => new User(data).save();
const findUserByEmail = async (email) => User.findOne({ email });
const findUserById = async (id) => User.findById(id);
const updateUser = async (id, updateData) =>
  User.findByIdAndUpdate(id, updateData, { new: true });

export default {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
};

