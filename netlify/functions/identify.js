// BirdNET-Analyzer API 프록시
// 브라우저의 CORS 제한을 우회해서 새소리 AI 분석 요청을 처리합니다.
// BirdNET API 문서: https://github.com/kahst/BirdNET-Analyzer

const BIRDNET_API = process.env.BIRDNET_API_URL || 'https://birdnet.cornell.edu/api/v2.4/analyze';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { audio, mimeType } = JSON.parse(event.body);
    const audioBuffer = Buffer.from(audio, 'base64');

    // multipart/form-data 수동 구성 (Node.js 내장 FormData 사용)
    const boundary = `----BirdsongBoundary${Date.now()}`;
    const ext = mimeType.includes('mp3') ? 'mp3' : mimeType.includes('wav') ? 'wav' : 'webm';

    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="soundfile"; filename="recording.${ext}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    );
    const latField = Buffer.from(
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="lat"\r\n\r\n36.5`
    );
    const lonField = Buffer.from(
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="lon"\r\n\r\n127.5`
    );
    const closing = Buffer.from(`\r\n--${boundary}--`);
    const body = Buffer.concat([header, audioBuffer, latField, lonField, closing]);

    const response = await fetch(BIRDNET_API, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body,
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `BirdNET API returned ${response.status}` }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
