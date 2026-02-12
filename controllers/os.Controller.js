const os = require("os");

// Export a function to get OS information
module.exports.getOsInfo = (req, res) => {
  try {
    // Gather OS information
    const osInformations = {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
    };

    // Check if we have the information
    if (!osInformations) {
      throw new Error("No OS information found");
    }

    // Send success response
    res.status(200).json({
      message: "OS Information retrieved successfully",
      data: osInformations,
    });

  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};
