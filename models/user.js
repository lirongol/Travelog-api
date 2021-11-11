import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
   firstName: { type: String, required: true },
   lastName: { type: String, required: true },
   fullName: { type: String, required: true },
   username: { type: String, required: true },
   email: { type: String, required: true },
   password: { type: String, required: true },
   phoneNumber: { type: String, required: true },
   profileImg: { url: String, filename: String },
   bio: { type: String, default: '' },
   following: [String],
   followers: [String],
}, {timestamps: true})

const User = mongoose.model('User', userSchema);

export default User;