// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'vip'], default: 'free' },
    status: { type: String, enum: ['active', 'canceled'], default: 'active' },
    stripeCustomerId: String,
    currentPeriodEnd: Date,
  },
  usage: {
    resumesCreated: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
templatesUsed: [{
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  count: { type: Number, default: 1 }
}],

  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return token;
};

module.exports = mongoose.model('User', userSchema);