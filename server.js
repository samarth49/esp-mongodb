const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB connection with error handling
mongoose.connect('mongodb url', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Monitor MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Add a simple GET route to check database connection
app.get('/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let status;
  
  switch(dbStatus) {
    case 0:
      status = 'Disconnected';
      break;
    case 1:
      status = 'Connected';
      break;
    case 2:
      status = 'Connecting';
      break;
    case 3:
      status = 'Disconnecting';
      break;
    default:
      status = 'Unknown';
  }
  
  res.json({
    database: status,
    timestamp: new Date()
  });
});

// Define sensor data schema
const sensorDataSchema = new mongoose.Schema({
  sensorValue: Number,
  deviceId: String,
  timestamp: Number,
  createdAt: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

// API endpoint to receive sensor data
app.post('/sensor-data', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const sensorData = new SensorData(req.body);
    await sensorData.save();
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});