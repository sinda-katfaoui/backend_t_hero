const userModel = require("../models/user.model");



// module.exports.esm = async (req, res) => {
//   try {
//     //logic here
//     res.status(200).json({ message: "Hello from user controller" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        if(users.length === 0){
           //return res.status(404).json({message:"No users found"});
           throw new Error('No users found');
        }
        res.status(200).json({ message: "Users retrieved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById();
        if(!user){
           throw new Error('User not found');
        }
        res.status(200).json({ message: "User retrieved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};