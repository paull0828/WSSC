import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  age: { type: Number, required: true, min: 15, max: 70 },
  gender: { type: String, required: true },
  mobileno: { type: String, required: true, match: /^[0-9]{10}$/ },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model("User", UserSchema);
