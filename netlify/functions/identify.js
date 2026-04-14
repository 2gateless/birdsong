// 새소리 스펙트로그램 → Claude Vision API로 새 종 식별
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.' }),
    };
  }

  const { spectrogram } = JSON.parse(event.body);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: spectrogram },
          },
          {
            type: 'text',
            text: `이것은 새소리의 스펙트로그램(주파수-시간 시각화)입니다.
이 패턴이 어떤 새의 울음소리인지 한국어 새 이름 하나만 답하세요.
예시: 딱새 / 참새 / 뻐꾸기 / 오목눈이 / 박새
새소리가 아니거나 알 수 없으면 정확히 "알수없음" 이라고만 답하세요.
새 이름 외에 다른 말은 절대 쓰지 마세요.`,
          },
        ],
      }],
    }),
  });

  const data = await response.json();
  const raw = (data.content?.[0]?.text ?? '').trim();
  const birdName = raw === '알수없음' ? null : raw;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birdName }),
  };
};
