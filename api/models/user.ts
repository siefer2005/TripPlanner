import mongoose, { Schema, Document } from 'mongoose';

/* ----------------------------------
   Interface
----------------------------------- */
export interface IUser extends Document {
  googleId: string;
  name: string;
  email: string;
  photo?: string;
  token?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ----------------------------------
   Schema
----------------------------------- */
const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    photo: {
      type: String,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

/* ----------------------------------
   Model
----------------------------------- */
const User = mongoose.model<IUser>('User', userSchema);

export default User;
