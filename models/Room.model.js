const mongoose = require('mongoose');

const RoomShema = new mongoose.Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true},
    imageUrl: { type: String, trim: true },
    reviews: {[type: mongoose.Types.ObjectId, ref: "Review"]},
    userId: String
});

module.exports = mongoose.model("Room", RoomSchema)