const express = require('express');
const router = express.Router();
const { MessagingResponse } = require('twilio').twiml;


router.get('/checkHealth', (req, res) => {
  res.json({
    message: "Health ok"
  });
});


router.post('/incoming', (req, res) => {
  const twiml = new MessagingResponse();

  
  const userMessage = req.body.Body;
  console.log('User said:', userMessage);

 
  twiml.message('Hello from Nurapix');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

module.exports = router;
