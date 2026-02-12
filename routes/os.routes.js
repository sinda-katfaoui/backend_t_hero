var express = require('express');
var router = express.Router();
const osController = require('../controllers/os.Controller');
const os = require('os');

/* GET home page. */
router.get('/os', function(req, res, next) {
  res.json('Operating Systems route');
});

router.get('/getOs', osController.getOsInfo);

/*
 // GET / route
 router.get('/', (req, res, next) => {
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
       message: "OS root route",
       data: osInformations,
     });

   } catch (error) {
     // Handle errors
     res.status(500).json({ error: error.message });
   }
 });

 module.exports = router;
*/
module.exports = router;