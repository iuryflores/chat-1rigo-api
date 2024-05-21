import { Router } from "express";
import User from "../models/Users.model.js";
import Contact from "../models/Contact.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/users", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.create({ name });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const contact = await Contact.create({ name, phoneNumber });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar contato." });
  }
});

router.post("/users/:userId/add-contact", async (req, res) => {
  try {
    const { userId } = req.params;
    const { contactId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { contacts: contactId } },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar contato ao usuário." });
  }
});
//Create User
router.post("/auth/signup", async (req, res, next) => {
  //Get data from body
  let { fullName, newEmail, confirmPassword, document } = req.body;

  //Check if all fields are filled
  if (!fullName || !newEmail || !confirmPassword || !document) {
    return res.status(400).json({ msg: "Todos os campos são obrigatórios!" });
  }

  //Check if is a valid email
  const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ msg: "Seu email não é válido." });
  }

  //Try to add user
  try {
    //Check if user exists
    const foudedUser = await User.findOne({ document });
    if (foudedUser) {
      return res.status(400).json({
        msg: `Já existe um usuário com este documento "${foudedUser.document}"!`,
      });
    }

    //Generate passwordHash
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(confirmPassword, salt);

    //Create new user
    const newUser = await User.create({
      name: fullName,
      email: newEmail,
      passwordHash,
      document,
    });

    //Get id from newUser
    const { _id } = newUser;

    return res.status(201).json({ fullName, newEmail, _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//Login
router.post("/auth/login", async (req, res, next) => {
  const { email, password } = req.body;

  console.log(req.body);

  try {
    //Look for user by email
    const user = await User.findOne({ email });

    //Check if email was fouded
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    //Compare the password if matchs
    const compareHash = bcrypt.compareSync(password, user.passwordHash);

    //Check if the password is wrong
    if (!compareHash) {
      return res.status(400).json({ msg: "Documento ou senha são inválidos." });
    }
    if (user.status !== true) {
      return res
        .status(400)
        .json({ status: 401, msg: "Usuário não autorizado" });
    }
    const payload = {
      id: user._id,
      name: user.name,
      document: user.document,
    };

    //Create token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    return res.status(200).json({ ...payload, token });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
export default router;
