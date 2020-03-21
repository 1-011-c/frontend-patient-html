(function (ky, QrScanner) {
  'use strict';

  ky = ky && Object.prototype.hasOwnProperty.call(ky, 'default') ? ky['default'] : ky;
  QrScanner = QrScanner && Object.prototype.hasOwnProperty.call(QrScanner, 'default') ? QrScanner['default'] : QrScanner;

  const videoCanvas = document.getElementById('video-canvas');
  const qrScanner = new QrScanner(videoCanvas, res => console.log('qr code: ', res));

  (async () => {
    const parsed = await ky('https://jsonplaceholder.typicode.com/todos/1').json();

    console.log(parsed.title);
    //=> 'delectus aut autem
  })();

}(ky, QrScanner));
