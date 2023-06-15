const express = require('express');
const multer = require('multer');
const PORT = process.env.PORT || 5000;
const fs = require('fs');
const cors = require('cors');
const { spawn } = require('child_process');
const config = require('./config/key.js');



const app = express();
const upload = multer({ dest: '/uploads' });

app.use(cors());


app.post('/api/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const outputImagePath = `uploads/${req.file.filename}.jpg`;

  // 이미지를 JPG 형식으로 저장
  const image = fs.readFileSync(imagePath);
  fs.writeFileSync(outputImagePath, image);


  // 환경 변수 설정
  const env = Object.create(process.env);
  env.KMP_DUPLICATE_LIB_OK = 'TRUE';
  env.PYTHONIOENCODING = 'utf-8';



  // OCR 실행을 위한 Python 스크립트 호출
  const pythonProcess = spawn('C:/Users/chnbr/Anaconda3/envs/py37/python.exe', ['ocr.py', outputImagePath], { env });
  let outputData = '';
  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString('utf-8');
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      // Process completed successfully
      const obj_json = JSON.parse(outputData);
      // mongo_db(obj_json);
      // sql_db(obj_json);
      console.log('Output:', obj_json);
      res.json(obj_json);
      // Do further processing with the output data
    } else {
      // Process exited with an error
      res.json({ error: 'An error occurred' });
    }
  });


});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}!!`);
});



const mongoose = require('mongoose');

mongoose
  .connect(
    config.mongoURI,
    {
      // useNewUrlPaser: true,
      // useUnifiedTofology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    }
  )
  .then(() => console.log('MongoDB conected....'))
  .catch((err) => {
    console.log(err);
  });

function mongo_db(data) {
  let db = mongoose.connection;
  db.collection('document_information').insertOne(data, function (err, result) {
    console.log('MONGO DB저장완료');
  });
}


const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: '0000',
  database: 'document_information'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('MySQL conected....');
});

function sql_db(data) {
  connection.query('INSERT INTO users SET ?', data, (err, results) => {
    if (err) throw err;
    console.log('MySQL 저장완료');
  });
}
