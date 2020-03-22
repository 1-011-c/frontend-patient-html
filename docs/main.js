import ky from 'https://cdn.jsdelivr.net/npm/ky@latest/index.js';
import QrScanner from './qr-scanner.min.js';

// Hook into the onload-event of the window
window.onload = () => {
  const apiEndpoint = "https://blffmaku9b.execute-api.eu-central-1.amazonaws.com/Prod";

  const mvpWarningEndpointElementId = 'mvp-warning-popup';
  const appStoreInfoPopupId = 'app-store-info-popup';

  // provide all elements as handy constants
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
  const removeMvpWarningButton = document.getElementById('remove-mvp-warning-button');
  const removeAppStoreInfoButton = document.getElementById('remove-connected-app-info-button');
  const openInAndroidButton = document.getElementById('open-in-android-appstore-button');
  const openInIosButton = document.getElementById('open-in-ios-appstore-button');

  let videoinputs = [];
  let currentVideoinput = 0;
  const pathValidator = /^\/corona-test-case\/([0-9a-z-]+)$/m;
  // instantiate the qr-scanner with a "success"-callback, called whenever a qr-code was detected
  const scanner = new QrScanner(videoElement, res => {
    const trimmedRes = res.trim();
    const match = trimmedRes.match(pathValidator);

    // if the test-case-path is valid
    if (match !== null) {
      const id = match[1];

      // load the id into the testIdContainer
      if (testIdContainer.innerText === id) {
        return;
      }
      testIdContainer.innerText = match[1];

      testStateContainer.innerText = 'Status noch nicht abgerufen.';

      testHeroContainer.setAttribute('class', 'hero is-light');

      // stop scanner and release video-canvas
      scanner.stop();
      videoElement.srcObject = undefined;

      // manage button-state
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

  // whenever user clicks scan
  scanButton.addEventListener('click', event => {
    if (navigator.mediaDevices.getUserMedia) {
      // start rear-video device
      navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: "environment"}})
        .then(stream => {
          // attach stream and start scanning
          videoElement.srcObject = stream;
          scanner.start();

          // manage button states
          scanButton.setAttribute('disabled', 'disabled');
          if (videoinputs.length > 1) {
            flipButton.removeAttribute('disabled');
          }
          cancelButton.removeAttribute('disabled');
          mediaForbiddenTitle.setAttribute('hidden', 'true');
        })
        .catch(err => { // in the case of an error
          // release stream and stop scanner
          videoElement.srcObject = undefined;
          scanner.stop();

          // manage button states
          cancelButton.setAttribute('disabled', 'disabled');
          flipButton.setAttribute('disabled', 'disabled');
          scanButton.removeAttribute('disabled');
          // show forbidden-message
          mediaForbiddenTitle.removeAttribute('hidden');
        });
    }
  });

  // if the user clicks cancel scanning
  cancelButton.addEventListener('click', event => {
    // release stream and scanner
    scanner.stop();
    videoElement.srcObject = undefined;

    // manage button state
    cancelButton.setAttribute('disabled', 'disabled');
    scanButton.removeAttribute('disabled');
    if (videoinputs.length > 1) {
      flipButton.removeAttribute('disabled');
    }
  });

  // if teh user clicks flipcamera
  flipButton.addEventListener('click', event => {
    if (videoinputs.length > 1) { // and the device has more than one videoinput-device
      const nextVideoinput = (currentVideoinput + 1) % videoinputs.length;

      // switch the nect videoinput-device
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

  // id the user clicks request
  requestButton.addEventListener('click', event => {
    const testId = testIdContainer.innerText;

    if (!testId) {
      return;
    }

    // issue a get request to the server-backend
    ky.get(`${apiEndpoint}/corona-test-case/${testId}`)
      .then(response => {
        if (!response.ok) {
          throw new HTTPError('Fetch error:', response.statusText);
        }

        return response.json();
      })
      .then(parsed => { // when we have some json
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

        // detect the infection-state and manage the result by hiding all mismatching content-containers
        switch (parsed.infected) {
          case 'IN_PROGRESS':
            testStateContainer.innerText = 'Ihr Test ist in Bearbeitung, bitte haben Sie Geduld.';
            testHeroContainer.setAttribute('class', 'hero is-info');
            showPopup(appStoreInfoPopupId);
            hideAllBut('in-progress');
            break;
          case 'POSITIVE':
            testStateContainer.innerText = 'Der Befund für Ihren Test ist positiv.';
            testHeroContainer.setAttribute('class', 'hero is-warning');
            showPopup(appStoreInfoPopupId);
            hideAllBut('positive');
            break;
          case 'NEGATIVE':
            testStateContainer.innerText = 'Der Befund für Ihren Test ist negativ.';
            testHeroContainer.setAttribute('class', 'hero is-success');
            showPopup(appStoreInfoPopupId);
            hideAllBut('negative');
            break;
          default:
            testStateContainer.innerText = 'Ihr Test konnte nicht geprüft werden.';
            testHeroContainer.setAttribute('class', 'hero is-light');
            showPopup(appStoreInfoPopupId);
            hideAllBut('default');
            break;
        }
      })
      .catch(err => console.log('error:', err));
  });


  // allow people to hide the warning 
  function hidePopup(popupId) {
    let element = document.getElementById(popupId);
    element.setAttribute("hidden", "true");
  }

  function showPopup(popupId) {
    let element = document.getElementById(popupId);
    element.removeAttribute("hidden");
  }

  function removePopupListener(popupId) {
    return () => {
      hidePopup(popupId);
      window.localStorage.setItem("mvp-warning-visible", "false");
    }
  }

  // Event listeners to hide popups
  removeMvpWarningButton.addEventListener("click", removePopupListener(mvpWarningEndpointElementId));
  removeAppStoreInfoButton.addEventListener("click", removePopupListener(appStoreInfoPopupId));

  // Remove the popups permanently.
  openInAndroidButton.addEventListener("click", removePopupListener(appStoreInfoPopupId));
  openInIosButton.addEventListener("click", removePopupListener(appStoreInfoPopupId));

  // Upon page load, check if we need to remove the popup again
  let visibleValue = window.localStorage.getItem("mvp-warning-visible");
  if (visibleValue === "false") {
    hidePopup(mvpWarningEndpointElementId);
  }

  // After onload
  (async () => {
    // request all mediadevices
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    // keep only videoinput devices
    videoinputs = mediaDevices.filter(curr => curr.kind === 'videoinput');

    // enable scan-button if videoinput devices available
    if (videoinputs.length > 0) {
      scanButton.removeAttribute('disabled');
    }
  })();
};
