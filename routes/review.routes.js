const express = require("express");

const router = express.Router();

const ReviewModel = require("../models/Review.model");
const RoomModel = require("../models/Room.model");
const UserModel = require("../models/User.model");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/room/create-review", isAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.user._id });
    const { comment, roomId } = req.body;

    if (user.roomsId.includes(req.body.roomId)) {
      return res.status(403).json({
        message:
          "Acesso negado: você não pode fazer comentário no seu próprio anúncio",
      });
    }

    const reviewCreated = await ReviewModel.create({
      comment: comment,
      roomId: roomId,
      userId: user._id,
      userName: user.name,
    });

    await RoomModel.findOneAndUpdate(
      { _id: reviewCreated.roomId },
      { $push: { reviews: reviewCreated._id } }
    );

    res.status(201).json(reviewCreated);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.patch("/room/edit-review/:id", isAuthenticated, async (req, res) => {
  try {
    const review = await ReviewModel.findOne({ _id: req.params.id });

    
    if (review.userId.valueOf() !== req.user._id) {
      return res.status(403).json({
        message:
          "Acesso negado: você não tem autorização para atualizar esse comentário",
      });
    }

    const reviewUpdated = await ReviewModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { comment: req.body.comment } },
      { new: true, runValidators: true }
    );

    res.status(200).json(reviewUpdated);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Comentário não encontrado" });
  }
});

router.delete("/room/delete-review/:id", isAuthenticated, async (req, res) => {
  try {
    
    const review = await ReviewModel.findOne({ _id: req.params.id });
    const user = await UserModel.findOne({ _id: req.user._id });

    
    if (review.userId.valueOf() === user._id.valueOf()) {
    
      await RoomModel.findOneAndUpdate(
        { _id: review.roomId },
        { $pull: { reviews: req.params.id } }
      );

     
      const deletedReview = await ReviewModel.deleteOne({ _id: req.params.id });

      if (deletedReview.deletedCount < 1) {
        return res.status(404).json({ message: "Comentário não encontrado" });
      }

      return res.status(200).json({});
    }

    res.status(403).json({
      message:
        "Acesso negado: você não tem autorização para excluir esse comentário",
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Comentário não encontrado" });
  }
});


module.exports = router;