const express = require('express');
const axios = require('axios');
const { MessagingResponse } = require('twilio').twiml;
const router = express.Router();

// Replace with your ngrok public URL
const COLAB_FLASK_URL = 'https://3cb6-34-169-149-135.ngrok-free.app/generate'; // ⬅️ Replace this

router.post('/incoming', async (req, res) => {
  const userPrompt = req.body.Body?.trim();
  console.log('Received prompt from WhatsApp:', userPrompt);

  const twiml = new MessagingResponse();

  try {
    // Make POST request to your Colab Flask server
    const imageResponse = await axios.post(
      `${COLAB_FLASK_URL}/generate`,
      { prompt: userPrompt },
      { responseType: 'arraybuffer' } // Important for binary image
    );

    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');

    // Send image back as media message via Twilio
    const message = twiml.message();
    message.body(`Here's your image for: "${userPrompt}"`);
    message.media(`data:image/png;base64,${base64Image}`);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.error('Error generating image:', error.message);
    twiml.message('Oops! Something went wrong generating your image.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

module.exports = router;
