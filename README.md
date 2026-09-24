# UPSC MCQ Revision App

## Open the actual app
Open **index.html** in a browser. `README.md` is only documentation; it is not the app.

## Features
- Mobile/iPad-friendly dashboard
- Start Quiz
- Unseen Questions mode
- Wrong Questions mode
- Question Bank search
- Instant answer feedback and explanations
- Local attempt history using browser localStorage
- JSON MCQ import
- JSON backup/restore
- PWA manifest + service worker for installation/offline caching when hosted over HTTPS

## MCQ format
```json
[
  {
    "id":"POL-001",
    "subject":"Polity",
    "topic":"Constitution",
    "question":"Your question",
    "options":["Option A","Option B","Option C","Option D"],
    "answer":0,
    "explanation":"Why the answer is correct.",
    "source":"Provided notes"
  }
]
```
`answer` is zero-based: 0=A, 1=B, 2=C, 3=D.

## ChatGPT workflow
This app does not silently access your ChatGPT account. Use ChatGPT to generate a JSON array from your notes, copy it, open **Import MCQs**, paste it, and import.

## iPad Home Screen
For reliable PWA installation and service-worker behavior, host these files on an HTTPS static host. Then open the site in Safari and use Share → Add to Home Screen.
