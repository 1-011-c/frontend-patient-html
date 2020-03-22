import ky from 'https://cdn.jsdelivr.net/npm/ky@latest/index.js';
import QrScanner from './qr-scanner.min.js';

window.onload = () => {
  const apiEndpoint = "https://blffmaku9b.execute-api.eu-central-1.amazonaws.com/Prod";

  const videoElement = document.getElementById('video-canvas');
  const headlineElement = document.getElementById('headline');
  const scanButton = document.getElementById('scan-button');
  const flipButton = document.getElementById('flip-button');
  const cancelButton = document.getElementById('cancel-button');
  const requestButton = document.getElementById('request-button');
  const testStateContainer = document.getElementById('test-state');
  const testIdContainer = document.getElementById('test-id');
  const testHeroContainer = document.getElementById('test-hero');
  const mediaForbiddenTitle = document.getElementById('media-forbidden-title');

  let videoinputs = [];
  let currentVideoinput = 0;
  const pathValidator = /^\/corona-test-case\/([0-9a-z-]+)$/m;
  const scanner = new QrScanner(videoElement, res => {
    const trimmedRes = res.trim();
    const match = trimmedRes.match(pathValidator);

    if (match !== null) {
      const id = match[1];

      if (testIdContainer.innerText === id) {
        return;
      }
      testIdContainer.innerText = match[1];

      testStateContainer.innerText = 'Status noch nicht abgerufen.';

      testHeroContainer.setAttribute('class', 'hero is-info');

      scanner.stop();
      videoElement.srcObject = undefined;

      cancelButton.setAttribute('disabled', 'disabled');
      flipButton.setAttribute('disabled', 'disabled');
      scanButton.removeAttribute('disabled');
      requestButton.removeAttribute('disabled');
    } else {
      console.log('mismatch:', trimmedRes);
    }
  });
  const escapeHtml = unsafe => {
      return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
  }

  scanButton.addEventListener('click', event => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: "environment"}})
        .then(stream => {
          videoElement.srcObject = stream;
          scanner.start();

          scanButton.setAttribute('disabled', 'disabled');
          if (videoinputs.length > 1) {
            flipButton.removeAttribute('disabled');
          }
          cancelButton.removeAttribute('disabled');
          mediaForbiddenTitle.setAttribute('hidden', 'true');
        })
        .catch(err => {
          videoElement.srcObject = undefined;
          scanner.stop();

          cancelButton.setAttribute('disabled', 'disabled');
          flipButton.setAttribute('disabled', 'disabled');
          scanButton.removeAttribute('disabled');
          mediaForbiddenTitle.removeAttribute('hidden');
        });
    }
  });

  cancelButton.addEventListener('click', event => {
    scanner.stop();
    videoElement.srcObject = undefined;

    cancelButton.setAttribute('disabled', 'disabled');
    scanButton.removeAttribute('disabled');
    if (videoinputs.length > 1) {
      flipButton.removeAttribute('disabled');
    }
  });

  flipButton.addEventListener('click', event => {
    if (videoinputs.length > 1) {
      const nextVideoinput = (currentVideoinput + 1) % videoinputs.length;

      navigator.mediaDevices.getUserMedia({audio: false, video: {deviceId: videoinputs[nextVideoinput]}})
        .then(stream => {
          videoElement.srcObject = stream;
          currentVideoinput = nextVideoinput;
        })
        .catch(err => {
          videoElement.srcObject = undefined;
          scanner.stop();

          cancelButton.setAttribute('disabled', 'disabled');
          flipButton.setAttribute('disabled', 'disabled');
          scanButton.removeAttribute('disabled');
          mediaForbiddenTitle.removeAttribute('hidden');
        });
    }
  });

  requestButton.addEventListener('click', event => {
    const testId = testIdContainer.innerText;

    if (!testId) {
      return;
    }

    ky.get(`${apiEndpoint}/corona-test-case/${testId}`)
      .then(response => {
        if (!response.ok) {
          throw new HTTPError('Fetch error:', response.statusText);
        }

        return response.json();
      })
      .then(parsed => {
        const contentDefault = document.getElementById('content-default');
        const contentPositive = document.getElementById('content-positive');
        const contentNegative = document.getElementById('content-negative');
        const contentInProgress = document.getElementById('content-in-progress');

        const allContents = [contentDefault, contentPositive, contentNegative, contentInProgress];
        const hideAllBut = id => {
          for (const content of allContents) {
            if (content.id.endsWith(id) === true) {
              content.removeAttribute('hidden');
            } else {
              content.setAttribute('hidden', 'true');
            }
          }
        };

        switch (parsed.infected) {
          case 'IN_PROGRESS':
            testStateContainer.innerText = 'Ihr Test ist in Bearbeitung, bitte haben Sie Geduld.';
            testHeroContainer.setAttribute('class', 'hero is-info');
            hideAllBut('in-progress');
            break;
          case 'POSITIVE':
            testStateContainer.innerText = 'Der Befund für Ihren Test ist positiv.';
            testHeroContainer.setAttribute('class', 'hero is-warning');
            hideAllBut('positive');
            break;
          case 'NEGATIVE':
            testStateContainer.innerText = 'Der Befund für Ihren Test ist negativ.';
            testHeroContainer.setAttribute('class', 'hero is-success');
            hideAllBut('negative');
            break;
          default:
            testStateContainer.innerText = 'Ihr Test konnte nicht geprüft werden.';
            testHeroContainer.setAttribute('class', 'hero is-light');
            hideAllBut('default');
            break;
        }
      })
      .catch(err => console.log('error:', err));
  });

  (async () => {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    videoinputs = mediaDevices.filter(curr => curr.kind === 'videoinput');

    if (videoinputs.length > 0) {
      scanButton.removeAttribute('disabled');
    }
  })();
};
