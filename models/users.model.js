import { Schema, model } from "mongoose";

const users = new Schema(
  {
    name: { type: String, required: true },
    login: { type: String },
    email: { type: String },
    departament: String,
    passwordHash: { type: String },
    status: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    lastLogin: Date,
  },
  { timestamps: true },
  { strictPopulate: false }
);
users.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
export default model("Users", users);
