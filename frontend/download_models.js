const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.weights',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.weights',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.weights',
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.weights'
];

files.forEach(file => {
  const url = baseUrl + file;
  const dest = path.join(modelsDir, file);
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(dest);
      response.pipe(fileStream);
      fileStream.on('finish', () => console.log('Downloaded', file));
    } else {
      console.error('Failed to download', file, response.statusCode);
    }
  }).on('error', (err) => console.error(err));
});
