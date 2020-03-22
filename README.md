![logo](logo.png)

# frontend-patient-html

Einfache HTML-Seite für Anwender ohne Zugriff auf native App.

## Funktionsweise

Bei der HTML-Frontend-Seite handelt es sich um eine statische HTML-Seite, die mit wenigen Plain-Vanilla-JS-Funktionen erweitert wurde. Die Webseite ermöglicht das starten der (rückseitigen) Kamera und den Scan-Vorgang einer Tracking-ID. Ist die ID-Gültig wird sie angezeigt und der Nutzer kann den aktuellen Test-Status anfordern.

Die Anwendung verbindet sich dann mit dem serverseitigen Backend und fordert das Test-Ergebnis an.

Je nach Testergebnis werden dann unterschiedliche Informationen angezeigt.

# Contribute

## Voraussetzungen

- Node.js
- NPM

## Los Geht's

### Unix/Linux-Nutzer

```
npm install
npm start
```

### Windows-Nutzer

```
npm install
npm start-win
```


