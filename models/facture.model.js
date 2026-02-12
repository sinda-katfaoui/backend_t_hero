const mongoose = require("mongoose");


const factureSchema = new mongoose.Schema(
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



const Facture = mongoose.model("Facture", factureSchema);
module.exports = Facture;