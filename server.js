const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { MessagingResponse } = require('twilio').twiml;
const cors = require('cors')

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: false }));

const colabAPI = 'https://7a52-34-32-155-221.ngrok-free.app/generate'; // Your Colab API
const IMAGE_SAVE_PATH = './images'; // Save images locally

// Ensure image folder exists
if (!fs.existsSync(IMAGE_SAVE_PATH)) fs.mkdirSync(IMAGE_SAVE_PATH);

// Your Twilio credentials (env or direct for testing)
const twilioClient = require('twilio')('AC77624db7aed958652287b40f783b3c59', '2ba944d789138d685c00e5ef36cc4891');

// Your WhatsApp Sandbox number (must match what Twilio expects)
const WHATSAPP_NUMBER = 'whatsapp:+14155238886';

app.post('/whatsapp', async (req, res) => {
  const prompt = req.body.Body;
  const from = req.body.From;

  console.log(` Prompt received from WhatsApp: ${prompt}`);

  try {
    // Generate the image using your Colab API
    const response = await axios.post(colabAPI, { prompt }, { responseType: 'stream' });

    const filename = `${uuidv4()}.png`;
    const filepath = `${IMAGE_SAVE_PATH}/${filename}`;

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    writer.on('finish', async () => {
      // Upload image to a public host (e.g., Imgur, Cloudinary, or serve from Express)
      const imageUrl = `https://your-server.com/images/${filename}`; // Placeholder

      // Send image back via Twilio WhatsApp
      await twilioClient.messages.create({
        from: WHATSAPP_NUMBER,
        to: from,
        body: `Heres your image for: "${prompt}"`,
        mediaUrl: [imageUrl]
      });

      const twiml = new MessagingResponse();
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    });

  } catch (err) {
    console.error(' Error:', err.message);
    const twiml = new MessagingResponse();
    twiml.message("Sorry, there was a problem generating your image. Please try again later.");
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

app.use('/images', express.static('images')); // Serve local images publicly

app.get('/',(req,res)=>{
  res.json({
    messgae:"Hello"
  })
})


app.listen(3000, () => {
  console.log('Node.js server running on http://localhost:3000');
});
