const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    comment: { type: String, maxLength: 200, trim: true },
    roomId: { type: mongoose.Types.ObjectId, ref: "Room" },
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    userName: String
});

module.exports = mongoose.model("Review", ReviewSchema)