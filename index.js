// server.js
const express = require('express');
const app = express();
const cors = require('cors')
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors())



app.use("/twilio",require("./routes/Whatsapp"))


app.get('/', (req, res) => {
  res.send('Hello from Node.js Server!');
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
