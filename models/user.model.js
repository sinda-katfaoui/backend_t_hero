const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    nom:        { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["CITOYEN", "AGENT_MUNICIPAL", "ADMIN"],
      required: true
    },
    user_image: { type: String, default: "" },
    code_Agent: { type: Number },
    code_Admin: { type: Number },
    isBlocked:  { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("motDePasse")) return;
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

userSchema.statics.login = async function (email, password) {
  // ── select: false hides motDePasse by default
  // ── we must explicitly request it here ────────────────────
  const user = await this.findOne({ email }).select('+motDePasse');
  if (!user) throw new Error("Email incorrect");

  const isMatch = await bcrypt.compare(password, user.motDePasse);
  if (!isMatch) throw new Error("Mot de passe incorrect");

  if (user.isBlocked) throw new Error("Compte bloqué");

  return user;
};

module.exports = mongoose.model("User", userSchema);