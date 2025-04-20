const express = require('express');
const router = express.Router();

router.get('/checkHealth',(req,res)=>{
    res.json({
        message:"Health ok"
    })
})



module.exports = router;
