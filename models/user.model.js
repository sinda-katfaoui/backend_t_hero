const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    nom:        { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: {
      type: String,
      enum: ["CITOYEN", "AGENT_MUNICIPAL", "ADMIN"],
      required: true
    },
    user_image: { type: String, default: "" },

    // AGENT_MUNICIPAL only
    code_Agent: { type: Number },

    // ADMIN only
    code_Admin: { type: Number },

    isBlocked:  { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Only hash if password was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasse")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// seConnecter() from diagram
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("Email incorrect");

  const isMatch = await bcrypt.compare(password, user.motDePasse);
  if (!isMatch) throw new Error("Mot de passe incorrect");

  if (user.isBlocked) throw new Error("Compte bloqué");

  return user;
};

module.exports = mongoose.model("User", userSchema);