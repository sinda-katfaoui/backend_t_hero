const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const userSchema = new mongoose.Schema(
    {

        name: { type: String, required: true },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [

                /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                "Please enter a valid email address"
            ]

        },
        password: { type: String, required: true },
        age: { type: Number, min: 10, max: 100 },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        address: {
            city: String,
            street: String,
            postalCode: String,

        }

    },
    { timestamps: true });

userSchema.pre("save", async function (next) {
    try {

        const salt = await bcrypt.fenSalt();
        const user = this
        user.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }

});

 module.exports = mongoose.model("User", userSchema);
 