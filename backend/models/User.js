import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: { type: String, unique: true },
  phone: String,
  location: String,
  bio: String,
  role: String,
  password: String,
  profilePhoto: String,
});

export default mongoose.model("User", UserSchema);
