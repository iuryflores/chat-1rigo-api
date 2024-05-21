import { Schema, model } from "mongoose";

const contact = new Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String },
  },
  { timestamps: true },
  { strictPopulate: false }
);
contact.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
export default model("Contact", contact);
