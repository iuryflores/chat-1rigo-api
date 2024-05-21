import { Router } from "express";
import User from "../models/Users.model.js";
import * as dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (user) {
      const payLoad = {
        id: user._id,
        name: user.name,
        email: user.email,
        admin: user.admin,
        document: user.document,
      };
      return res.status(200).json({ payLoad });
    }
  } catch (error) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }
});

export default router;
