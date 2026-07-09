# Pics File Sorter

Pics File Sorter ist eine lokale Web-App, mit der du Foto- und Videodateien aus einem Quellordner in eine saubere Ordnerstruktur im Zielordner sortierst.

## Was das Projekt macht

Die App führt dich in vier Schritten durch den Import:

1. Quell- und Zielordner auswählen (über die File System Access API im Browser)
2. Medien im Quellordner rekursiv analysieren
3. Aufnahmeserien als „Szenen“ gruppieren und benennen
4. Dateien in eine Struktur `Jahr/Monat/Szene` kopieren

## Wichtige Funktionen

- Unterstützt Bilder, Videos und RAW-Dateien
- Batch-Bildung nach Zeitabstand (1 Minute, 10 Minuten, 1 Tag oder benutzerdefiniert)
- Anpassbare Dateinamens-Syntax zum Auslesen von Datum/Uhrzeit aus Dateinamen
- Fallback auf Dateisystem-Zeitstempel, wenn aus dem Dateinamen kein Datum extrahiert werden kann
- Mehrsprachige Oberfläche (Deutsch, Englisch, Italienisch, Französisch, Spanisch)
- Theme-Auswahl (System, Hell, Dunkel)
- Lokale Speicherung der Einstellungen im Browser

## Unterstützte Browser

Die App benötigt die **File System Access API**. Praktisch bedeutet das:

- Chrome
- Edge
- Opera

## Installation

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

## Build erstellen

```bash
npm run build
```

## Tests ausführen

```bash
npm run test
```

## Tech-Stack

- React 18
- TypeScript
- Vite
- Vitest

## Hinweise

- Die App arbeitet lokal im Browser und nutzt vom Nutzer ausgewählte Verzeichnisse.
- Es gibt kein Backend im Repository.
