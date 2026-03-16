import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In production, this should be hashed
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);
export default mongoose.model("User", userSchema);