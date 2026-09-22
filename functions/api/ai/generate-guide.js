export async function onRequestPost(context) {
  try {
    const request = context.request;
    const body = await request.json();
    const env = context.env;

    const apiKey = body.apiKey || (env && env.GEMINI_API_KEY) || 'AQ.Ab8RN6JhpjDBh_RP138UTkDHmJtMMBZ0fNOaizBLBH3iHutUDg';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Kein API-Key vorhanden.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const userText = (body.text || '').trim();
    const imageData = (body.image || '').trim();

    if (!userText && !imageData) {
      return new Response(JSON.stringify({ error: 'Bitte Text eingeben oder Bild hochladen.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const prompt = `Du bist ein Experte in der Sozialpsychiatrie. Erstelle aus den bereitgestellten Aufgaben/Reinigungsplan eine extrem einfache, visuelle Schritt-für-Schritt-Anleitung für einen Bewohner mit kognitiven Einschränkungen und Schizophrenie.
Anforderungen:
1. Jeder Schritt MUSS sehr kurz und einfach sein (maximal 3-5 Wörter auf Deutsch).
2. Jeder Schritt MUSS 1-3 passende, klare Emojis haben.
3. Der letzte Schritt sollte immer 'Fertig! Gut gemacht!' mit Emoji ['✅'] sein.
4. Gebe ein passendes Haupt-Emoji für die Gesamtaufgabe an.

Antworte AUSSCHLIESSLICH im folgenden JSON-Format ohne Markdown-Formatierung:
{
  "title": "Kurzer, klarer Titel der Aufgabe",
  "emoji": "🛋️",
  "steps": [
    {"emojis": ["🪑", "⬆️"], "german": "Stühle hochstellen"},
    {"emojis": ["🧹"], "german": "Boden fegen"},
    {"emojis": ["✅"], "german": "Fertig! Gut gemacht!"}
  ]
}`;

    const parts = [{ text: prompt }];
    if (userText) parts.push({ text: `Aufgaben-Plan:\n${userText}` });
    if (imageData) {
      let mimeType = 'image/jpeg';
      let b64Content = imageData;
      if (imageData.includes(',')) {
        const split = imageData.split(',');
        const m = split[0].match(/data:([^;]+);base64/);
        if (m) mimeType = m[1];
        b64Content = split[1];
      }
      parts.push({ inline_data: { mime_type: mimeType, data: b64Content } });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: 'application/json'
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const geminiResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResp.ok) {
      const err = await geminiResp.text();
      return new Response(JSON.stringify({ error: 'KI-Fehler: ' + err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const respData = await geminiResp.json();
    const pList = respData?.candidates?.[0]?.content?.parts || [];
    let text = '';
    for (let i = pList.length - 1; i >= 0; i--) {
      if (pList[i].text && pList[i].text.trim()) {
        text = pList[i].text;
        break;
      }
    }
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const guide = JSON.parse(text);
    if (!guide.id) guide.id = 'guide_' + Date.now();

    return new Response(JSON.stringify({ ok: true, guide }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
