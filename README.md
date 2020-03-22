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

## Projeltinhalt

```
.
├── docs
│   ├── bulma.min.css // css-framework
│   ├── CNAME // github-domain-configuration
│   ├── css // additional css-assets
│   ├── fonts // font-assets
│   ├── img // images
│   ├── index.html // single static html-site
│   ├── main.js // business logic
│   ├── materialdesignicons.min.css // icon-font
│   ├── .nojekyll // disable github-static page rendering
│   ├── normalize.css // normalises browser-styles
│   ├── qr-scanner.min.js // qr-scanner library
│   ├── qr-scanner-worker.min.js // worker of qr-scanner-library
│   ├── style.css // custom styles
│   └── svg
├── .editorconfig
├── LICENSE
├── logo.png
├── package.json
├── package-lock.json
├── README.md
└── testbefund-logo-de-b.png
```

Die HTML-Seite lädt alle notwendigen Assets (Schriften, Stylesheets, Scripte) und startet dann das `main.js`-Skript, dass, falls der betrachtende Browser Video-Eingabegeräte zur Verfügung stellt, die Schaltflächen aktiviert für den Scan-Vorgang aktiviert.

Startet der Nutzer den Scan-Vorgang wird das Eingangsbild der Kamera an den QR-Scanner geleitet und an ein `video`-Element, welches das Eingangsbild zugleich für den Nutzer darstellt.

Erkennt der QR-Scanner einen gültigen QR-Code (`/^\/corona-test-case\/[0-9a-z-]+$/im`), werden Scanner und Kamera automatisch deaktiviert und die Tracking-ID wird angezeigt.

Nun kann der Nutzer für diese Tracking-ID den Status anfordern, je nach BEfundlage wird ein unterschiedliches Ergebnis dargestellt.
