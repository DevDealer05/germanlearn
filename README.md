# 📖 Deutsch Lernen — PWA & Betreuer-Dashboard

Eine barrierearme, visuelle Lern-App und Tagesstruktur-Hilfe für Bewohner mit kognitiven Einschränkungen und Schizophrenie im sozialpsychiatrischen Wohnbereich, inklusive webbasiertem Betreuer-Dashboard und Cloud-Synchronisation über Supabase.

---

## ✨ Features

- **Bewohner-App (`index.html`)**:
  - Reizarmes, klares Design (sanfte Farben, große Touch-Ziele, keine Hektik).
  - 11 Basis-Kategorien + Wohnbereichsaufgaben (Fegen, Wischen, Küche, Müll etc.) mit Audioausgabe.
  - Vokabeln lernen, Sätze üben und sanftes Satz-Quiz mit automatischer Wiederholungsschleife.
  - Schritt-für-Schritt-Anleitungen (Einzelschritt-Prinzip mit Audio und großem ✅-Button).
  - Installierbar als vollwertige **PWA** auf Smartphone oder Tablet (auch offlinefähig).
  
- **Betreuer-Dashboard (`betreuer.html`)**:
  - PIN-geschützt (Standard-PIN: `1234`).
  - Lernfortschritts- und Genauigkeits-Übersicht in Echtzeit.
  - Schritt-für-Schritt-Anleitungen erstellen und verwalten.
  - **🤖 KI-Dienstplan-Import**: Dienstpläne als Text oder Foto hochladen — Google Gemini wandelt sie automatisch in bebilderte Schritt-für-Schritt-Anleitungen um.
  - Eigene Kategorien mit individuellem Vokabular anlegen.
  - Reizreduktions-Optionen (z. B. Text ausblenden, nur Emojis/Audio).

- **☁️ Supabase Cloud-Sync**:
  - Nahtlose Synchronisation zwischen Bewohner-Handy und Betreuer-Gerät über beliebiges Netz (WLAN & LTE/Mobilfunk).
  - Automatisches lokales Fallback bei Verbindungsunterbrechung.

---

## 🚀 Lokale Nutzung

```bash
# Server starten
python3 server.py

# Bewohner-App: http://localhost:8080/
# Betreuer-Dashboard: http://localhost:8080/betreuer.html
```

---

## ⚡ Deployment auf Cloudflare Pages

Diese App ist 100% kompatibel mit **Cloudflare Pages**:

1. Repository auf **GitHub** pushen.
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/) auf **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** gehen.
3. Das GitHub-Repository auswählen.
4. **Build settings**:
   - **Framework preset**: `None`
   - **Build command**: *(leer lassen)*
   - **Build output directory**: `/` *(Root)*
5. Klick auf **Save and Deploy**!
6. Fertig! Die PWA ist weltweit unter `https://dein-projekt.pages.dev` erreichbar.
