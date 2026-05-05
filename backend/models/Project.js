const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, role: { type: String, enum: ["Admin", "Member"], default: "Member" } }, { _id: false });
const projectSchema = new mongoose.Schema({ name: { type: String, required: [true, "Project name is required"], trim: true, minlength: 2 }, description: { type: String, trim: true, maxlength: 500, default: "" }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, members: { type: [memberSchema], default: [] } }, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
