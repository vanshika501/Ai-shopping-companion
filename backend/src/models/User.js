import mongoose from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

// Hash password before save when modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return compare(candidatePassword, this.password);
};

// Hide password when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
