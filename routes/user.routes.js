const express = require("express");

const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

const router = express.Router();

const UserModel = require("../models/User.model");

const generateToken = require("../config/jwt.config");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/gm
      )
    ) {
      return res.status(400).json({
        msg: "A senha deve conter pelo menos 8 caracteres, letras maiúscula e minúsculas, números e caracteres especiais",
      });
    }

    const salt = bcrypt.genSaltSync(SALT_ROUNDS);

    const passwordHash = bcrypt.hashSync(password, salt);

    const userCreated = await UserModel.create({ name, email, passwordHash });

    
    res.status(201).json(userCreated);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


router.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    
    const { email, password } = req.body;

    const foundUser = await UserModel.findOne({ email });
    
    if (!foundUser) {
      return res.status(400).json({ msg: "E-mail ou senha incorretos." });
    }

    if (!bcrypt.compareSync(password, foundUser.passwordHash)) {
      return res.status(400).json({ msg: "E-mail ou senha incorretos2." });
    }

    const token = generateToken(foundUser);

    res.status(200).json({token: token, user: {name: foundUser.name, email: foundUser.email}});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/found-user", isAuthenticated, async (req, res) => {
  try {
    console.log(req.user._id);
    const { name, email } = await UserModel.findOne({ email: req.user.email });

    if (!name) {
      return res
        .status(404)
        .json({ message: "Acesso negado: operação não permitida" });
    }

    res.status(200).json({name: name, email: email});
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Usuário não encontrado" });
  }
});


router.patch("/edit-user", isAuthenticated, async (req, res) => {
  try {
    const updateUser = await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updateUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json(updateUser);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


router.delete("/user/delete", isAuthenticated, async (req, res) => {
  try {
    const deleteUser = await UserModel.deleteOne({ _id: req.user._id });

    if (deleteUser.deletedCount < 1) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json(deleteUser);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;