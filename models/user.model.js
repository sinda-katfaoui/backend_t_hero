const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    motDePasse: { type: String, required: true },

    tel: { type: String, required: true },

    location: { type: String, required: true },

    user_image: { type: String, default: "" },

    role: {
      type: String,
      enum: ["CITOYEN", "AGENT_MUNICIPAL", "ADMIN"],
      required: true
    },
    //champs role AGENT_MUNICIPAL
    code_Agent:Number,

    //champs role ADMIN
    code_Admin:Number

  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (err) {
    throw err;
  }
});
userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });

    if (!user) {
      throw new Error("Incorrect email");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Incorrect password");
    }

    if (user.block === true) {
      throw new Error("User is blocked");
    }

    return user;

  } catch (err) {
    throw err;
  }
};


module.exports = mongoose.model("User", userSchema);
