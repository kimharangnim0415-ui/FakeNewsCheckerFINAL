// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Node 18 이상이면 내장 fetch 가능
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const MODEL = "mrm8488/bert-tiny-finetuned-fake-news"; // 무료 뉴스 가짜 판별 모델

// 뉴스 판별 POST 라우트
app.post('/check-news', async (req, res) => {
  const { title, content } = req.body;
  const inputText = `${title}\n${content}`;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: inputText })
    });

    const result = await response.json();

    // 모델 출력: [{label: "FAKE", score: 0.95}]
    if (Array.isArray(result) && result[0] && result[0].label) {
      res.json({ result: `판별 결과: ${result[0].label}, 신뢰도: ${result[0].score.toFixed(2)}` });
    } else {
      res.json({ result: "모델에서 유효한 결과를 받지 못했습니다." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "서버 오류 발생: " + err.message });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버 실행됨: http://localhost:${port}`);
});
