const express = require("express");

const router = express.Router();

const RoomsModel = require("../models/Room.model");
const UserModel = require("../models/User.model");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/create-rooms", isAuthenticated, async (req, res) => {
  try {

    const { name, description, imageUrl } = req.body;

    const roomCreated = await RoomsModel.create({
      name,
      description,
      imageUrl,
      userId: req.user._id,
    });

    await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { roomsId: roomCreated._id } }
    );

    res.status(201).json(roomCreated);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


router.get("/rooms", isAuthenticated, async (req, res) => {
  try {
    const rooms = await RoomsModel.find();

    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


router.get("/rooms-user", isAuthenticated, async (req, res) => {
  try {
    const rooms = await RoomsModel.find();

    const roomsFiltered = rooms.filter((currentRoom) =>{
      return currentRoom.userId === req.user._id
    })

    res.status(200).json(roomsFiltered);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


router.get("/rooms/:id", isAuthenticated, async (req, res) => {
  try {
    const room = await RoomsModel.findOne({
      _id: req.params.id,
    }).populate("reviews");

    if (!room) {
      return res
        .status(404)
        .json({ message: "Acesso negado: operação não permitida" });
    }

    res.status(200).json(room);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Quarto não encontrado" });
  }
});


router.patch("/edit-rooms/:id", isAuthenticated, async (req, res) => {
  try {
    const updatedRoom = await RoomsModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res
        .status(403)
        .json({ message: "Acesso negado: operação não permitida" });
    }

    res.status(200).json(updatedRoom);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Quarto não encontrado" });
  }
});


router.delete("/room/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const dataRoom = await RoomsModel.findOne({ _id: req.params.id });

    if (req.user._id !== dataRoom.userId) {
      return res.status(403).json({
        message:
          "Acesso negado: você não tem permissão para deletar esse quarto.",
      });
    }

    await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { roomsId: req.params.id } }
    );

    const deleteRoom = await RoomsModel.deleteOne({ _id: req.params.id });

    if (deleteRoom.deletedCount < 1) {
      return res.status(404).json({ message: "Quarto não encontrado" });
    }

    res.status(200).json({ message: "Quarto deletado." });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Quarto não encontrado" });
  }
});

module.exports = router;