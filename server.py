#!/usr/bin/env python3
"""
Deutsch-Lernen Server
Stellt die App bereit und synchronisiert den Fortschritt zwischen
Bewohner-App und Betreuer-Dashboard.

Starten: python3 server.py
"""

import json
import os
import sys
import re
import urllib.request
import urllib.error
import ssl
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
PROGRESS_FILE = os.path.join(DATA_DIR, 'progress.json')
SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
PROFILE_FILE = os.path.join(DATA_DIR, 'profile.json')
GUIDES_FILE = os.path.join(DATA_DIR, 'guides.json')
CUSTOM_CATEGORIES_FILE = os.path.join(DATA_DIR, 'custom_categories.json')
CONFIG_FILE = os.path.join(DATA_DIR, 'config.json')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)


def read_json(filepath, default):
    """Read JSON file, return default if not found."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(filepath, data):
    """Write data to JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# Initialize default guides if file doesn't exist
DEFAULT_GUIDES = [
  {
    "id": "gemeinschaftsraumdienst",
    "title": "Gemeinschaftsraumdienst",
    "emoji": "🛋️",
    "steps": [
      { "emojis": ["🪑", "⬆️"], "german": "Stühle hochstellen" },
      { "emojis": ["🧹"], "german": "Boden fegen" },
      { "emojis": ["🪣", "🧽"], "german": "Boden wischen" },
      { "emojis": ["🪑", "⬇️"], "german": "Stühle wieder hinstellen" },
      { "emojis": ["🪵", "🧽"], "german": "Tische abwischen" },
      { "emojis": ["🗑️", "🚶"], "german": "Müll rausbringen" },
      { "emojis": ["✅"], "german": "Fertig! Gut gemacht!" }
    ]
  },
  {
    "id": "kuechenhygienedienst",
    "title": "Küchenhygienedienst",
    "emoji": "🍳",
    "steps": [
      { "emojis": ["🧤"], "german": "Handschuhe anziehen" },
      { "emojis": ["🍽️", "🚿"], "german": "Geschirr abspülen" },
      { "emojis": ["🍽️", "📥"], "german": "Geschirr einräumen" },
      { "emojis": ["🪵", "🧽"], "german": "Arbeitsfläche abwischen" },
      { "emojis": ["🗑️", "🚶"], "german": "Müll rausbringen" },
      { "emojis": ["🧤", "❌"], "german": "Handschuhe ausziehen" },
      { "emojis": ["🖐️", "🧼"], "german": "Hände waschen" },
      { "emojis": ["✅"], "german": "Fertig! Gut gemacht!" }
    ]
  }
]
if not os.path.exists(GUIDES_FILE):
    write_json(GUIDES_FILE, DEFAULT_GUIDES)


class AppHandler(SimpleHTTPRequestHandler):
    """HTTP handler that serves static files and a simple progress API."""

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == '/api/progress':
            data = read_json(PROGRESS_FILE, {
                'words': {},
                'sentences': {},
                'quizScores': {},
                'totalSessions': 0,
                'lastSessionDate': None
            })
            self._send_json(data)

        elif parsed.path == '/api/settings':
            data = read_json(SETTINGS_FILE, {'showText': True})
            self._send_json(data)

        elif parsed.path == '/api/profile':
            data = read_json(PROFILE_FILE, {})
            self._send_json(data)

        elif parsed.path == '/api/guides':
            data = read_json(GUIDES_FILE, DEFAULT_GUIDES)
            self._send_json(data)

        elif parsed.path == '/api/custom-categories':
            data = read_json(CUSTOM_CATEGORIES_FILE, [])
            self._send_json(data)

        elif parsed.path == '/api/config':
            data = read_json(CONFIG_FILE, {})
            self._send_json(data)

        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self._send_json({'error': 'Invalid JSON'}, 400)
            return

        if parsed.path == '/api/progress':
            write_json(PROGRESS_FILE, data)
            self._send_json({'ok': True})

        elif parsed.path == '/api/settings':
            write_json(SETTINGS_FILE, data)
            self._send_json({'ok': True})

        elif parsed.path == '/api/profile':
            write_json(PROFILE_FILE, data)
            self._send_json({'ok': True})

        elif parsed.path == '/api/guides':
            write_json(GUIDES_FILE, data)
            self._send_json({'ok': True})

        elif parsed.path == '/api/custom-categories':
            write_json(CUSTOM_CATEGORIES_FILE, data)
            self._send_json({'ok': True})

        elif parsed.path == '/api/config':
            write_json(CONFIG_FILE, data)
            self._send_json({'ok': True})

        elif parsed.path == '/api/ai/generate-guide':
            result, status = self._handle_ai_generate_guide(data)
            self._send_json(result, status)

        else:
            self._send_json({'error': 'Not found'}, 404)

    def _handle_ai_generate_guide(self, data):
        # Find API key
        config = read_json(CONFIG_FILE, {})
        api_key = data.get('apiKey') or config.get('geminiApiKey') or os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return {
                'error': 'Kein Gemini API-Key hinterlegt. Bitte geben Sie Ihren API-Key im Betreuer-Dashboard unter Einstellungen ein.'
            }, 400

        user_text = data.get('text', '').strip()
        image_data = data.get('image', '').strip()

        if not user_text and not image_data:
            return {'error': 'Bitte Text eingeben oder ein Foto hochladen.'}, 400

        prompt = (
            "Du bist ein Experte in der Sozialpsychiatrie. "
            "Erstelle aus den bereitgestellten Aufgaben/Reinigungsplan eine extrem einfache, "
            "visuelle Schritt-für-Schritt-Anleitung für einen Bewohner mit kognitiven Einschränkungen und Schizophrenie.\n"
            "Anforderungen:\n"
            "1. Jeder Schritt MUSS sehr kurz und einfach sein (maximal 3-5 Wörter auf Deutsch).\n"
            "2. Jeder Schritt MUSS 1-3 passende, klare Emojis haben.\n"
            "3. Der letzte Schritt sollte immer 'Fertig! Gut gemacht!' mit Emoji ['✅'] sein.\n"
            "4. Gebe ein passendes Haupt-Emoji für die Gesamtaufgabe an.\n\n"
            "Antworte AUSSCHLIESSLICH im folgenden JSON-Format ohne Markdown-Formatierung:\n"
            "{\n"
            '  "title": "Kurzer, klarer Titel der Aufgabe",\n'
            '  "emoji": "🛋️",\n'
            '  "steps": [\n'
            '    {"emojis": ["🪑", "⬆️"], "german": "Stühle hochstellen"},\n'
            '    {"emojis": ["🧹"], "german": "Boden fegen"},\n'
            '    {"emojis": ["✅"], "german": "Fertig! Gut gemacht!"}\n'
            "  ]\n"
            "}"
        )

        parts = [{"text": prompt}]
        if user_text:
            parts.append({"text": f"Aufgaben-Plan:\n{user_text}"})

        if image_data:
            # Handle data URL format: data:image/png;base64,...
            mime_type = "image/jpeg"
            b64_content = image_data
            if "," in image_data:
                header, b64_content = image_data.split(",", 1)
                match = re.search(r"data:([^;]+);base64", header)
                if match:
                    mime_type = match.group(1)

            parts.append({
                "inline_data": {
                    "mime_type": mime_type,
                    "data": b64_content
                }
            })

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }

        # Supported models for this API key
        models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash-lite"]
        last_error = ""

        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={"Content-Type": "application/json"}
            )
            try:
                ssl_ctx = None
                try:
                    ssl_ctx = ssl.create_default_context()
                    resp = urllib.request.urlopen(req, timeout=30, context=ssl_ctx)
                except Exception:
                    ssl_ctx = ssl._create_unverified_context()
                    resp = urllib.request.urlopen(req, timeout=30, context=ssl_ctx)

                with resp:
                    resp_data = json.loads(resp.read().decode('utf-8'))
                    parts = resp_data["candidates"][0]["content"]["parts"]
                    text = ""
                    for p in reversed(parts):
                        if "text" in p and p["text"].strip():
                            text = p["text"]
                            break

                    text = re.sub(r"^```json\s*", "", text.strip())
                    text = re.sub(r"\s*```$", "", text.strip())
                    guide_json = json.loads(text)
                    if "id" not in guide_json:
                        guide_json["id"] = "guide_" + str(int(os.times()[4] * 1000))
                    return {"ok": True, "guide": guide_json}, 200
            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8', errors='ignore')
                last_error = f"HTTP {e.code}: {err_body}"
            except Exception as e:
                last_error = str(e)

        return {"error": f"KI-Fehler: {last_error}"}, 500

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Quieter logging — only show API calls."""
        path = args[0].split()[1] if args else ''
        if '/api/' in str(path):
            super().log_message(format, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = HTTPServer(('0.0.0.0', port), AppHandler)
    
    # Get local IP for easy access
    import socket
    hostname = socket.gethostname()
    try:
        local_ip = socket.gethostbyname(hostname)
    except socket.gaierror:
        local_ip = '127.0.0.1'

    print(f"""
╔══════════════════════════════════════════════════╗
║           📖 Deutsch Lernen — Server             ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Bewohner-App:                                   ║
║  → http://{local_ip}:{port}/                      
║                                                  ║
║  Betreuer-Dashboard:                             ║
║  → http://{local_ip}:{port}/betreuer.html          
║                                                  ║
║  (Beide Geräte müssen im gleichen WLAN sein)     ║
║                                                  ║
╚══════════════════════════════════════════════════╝
""")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer beendet.")
        server.server_close()


if __name__ == '__main__':
    main()
