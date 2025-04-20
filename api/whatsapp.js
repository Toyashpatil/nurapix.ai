const axios = require('axios');
const { MessagingResponse } = require('twilio').twiml;

const twilioClient = require('twilio')(
  'AC77624db7aed958652287b40f783b3c59', '2ba944d789138d685c00e5ef36cc4891'
);

const WHATSAPP_NUMBER = 'whatsapp:+14155238886';
const colabAPI = 'https://7a52-34-32-155-221.ngrok-free.app/generate';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const prompt = req.body.Body || 'an image';
  const from = req.body.From;

  try {
    const imageRes = await axios.post(colabAPI, { prompt }, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(imageRes.data, 'binary').toString('base64');

    const imgurUpload = await axios.post('https://api.imgur.com/3/image', {
      image: base64,
      type: 'base64'
    }, {
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
      }
    });

    const imageUrl = imgurUpload.data.data.link;

    await twilioClient.messages.create({
      from: WHATSAPP_NUMBER,
      to: from,
      body: `Here’s your image for: "${prompt}"`,
      mediaUrl: [imageUrl]
    });

    const twiml = new MessagingResponse();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());

  } catch (err) {
    console.error(err.message);
    const twiml = new MessagingResponse();
    twiml.message('Error generating image.');
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  }
};
