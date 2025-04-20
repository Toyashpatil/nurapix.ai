// const express = require('express');
// const axios = require('axios');
// const { MessagingResponse } = require('twilio').twiml;
// const router = express.Router();

// // Replace with your ngrok public URL
// const COLAB_FLASK_URL = 'https://3cb6-34-169-149-135.ngrok-free.app/'; // ⬅️ Replace this

// router.post('/incoming', async (req, res) => {
//   const userPrompt = req.body.Body?.trim();
//   console.log('Received prompt from WhatsApp:', userPrompt);

//   const twiml = new MessagingResponse();

//   try {
//     // Make POST request to your Colab Flask server
//     const imageResponse = await axios.post(
//       `${COLAB_FLASK_URL}/generate`,
//       { prompt: userPrompt },
//       { responseType: 'arraybuffer' } // Important for binary image
//     );

//     const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');

//     // Send image back as media message via Twilio
//     const message = twiml.message();
//     message.body(`Here's your image for: "${userPrompt}"`);
//     message.media(`data:image/png;base64,${base64Image}`);

//     res.writeHead(200, { 'Content-Type': 'text/xml' });
//     res.end(twiml.toString());
//   } catch (error) {
//     console.error('Error generating image:', error.message);
//     twiml.message('Oops! Something went wrong generating your image.');
//     res.writeHead(200, { 'Content-Type': 'text/xml' });
//     res.end(twiml.toString());
//   }
// });

// module.exports = router;
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const { MessagingResponse } = require('twilio').twiml;
const router = express.Router();

// Your ngrok URL from Colab
const COLAB_FLASK_URL = 'https://8bc6-34-124-179-92.ngrok-free.app'; 

// Your imgbb API Key (get free from https://api.imgbb.com)
const IMGBB_API_KEY = 'e79bc1f402c834dc0efe08e62e6cd933'; 

router.post('/incoming', async (req, res) => {
  // const userPrompt = req.body.Body?.trim();
  const userPrompt = req.body.prompt;
  

  console.log('📩 Prompt from WhatsApp:', userPrompt);

  const twiml = new MessagingResponse();

  try {
    // 1. Get image from your Flask backend
    const imageResponse = await axios.post(
      `${COLAB_FLASK_URL}/generate`,
      { prompt: userPrompt },
      { responseType: 'arraybuffer' }
    );

    const imageBuffer = Buffer.from(imageResponse.data, 'binary');
    console.log(imageBuffer)

    // 2. Upload to imgbb
    const form = new FormData();
    form.append('image', imageBuffer.toString('base64'));

    const uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    const imageUrl = uploadRes.data.data.url;
    console.log(imageUrl)

    // 3. Send WhatsApp reply with media
    // const message = twiml.message();
    message.body(`Here's your generated image for: "${userPrompt}"`);
    // message.media(imageUrl);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (err) {
    console.error('Error:', err.message);
    twiml.message('Something went wrong generating or sending the image.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

module.exports = router;
