'use strict';

var videoElement = document.querySelector('video');
// var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector('select#videoSource');

// audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

var imageCapture;

getStream().then(getDevices).then(gotDevices).then(setUpGui);

function getDevices() {
  // AFAICT in Safari this only gets default devices until gUM is called :/
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos; // make available to console
  console.log('Available input and output devices:', deviceInfos);
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      // option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
      // audioSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function setUpGui() {
  console.log('setUpGui');
  document.getElementById('btnGrabFrame').onclick = onGrabFrameButtonClick;
  document.getElementById('btnTakePhoto').onclick = onTakePhotoButtonClick;
  document.getElementById('btnTakePhoto2').onclick = onTakePhoto2ButtonClick;

}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  // const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    // audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  return navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  let mediaStreamTrack = stream.getVideoTracks()[0];
  imageCapture = new ImageCapture(mediaStreamTrack);
  // audioSelect.selectedIndex = [...audioSelect.options].
  //  findIndex(option => option.text === stream.getAudioTracks()[0].label);
  videoSelect.selectedIndex = [...videoSelect.options].
    findIndex(option => option.text === stream.getVideoTracks()[0].label);
  videoElement.srcObject = stream;
}

function handleError(error) {
  console.error('Error: ', error);
}


function showHideElementById(id) {
  var x = document.getElementById(id);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function onGrabFrameButtonClick() {
  imageCapture.grabFrame()
  .then(imageBitmap => {
    const canvas = document.querySelector('#canvasGrabFrame');
    drawCanvas(canvas, imageBitmap);
  })
  .catch(error => console.error(error));
}

function onTakePhotoButtonClick() {
  console.log('onTakePhotoButtonClick');
  imageCapture.takePhoto()
  .then(blob => {
    console.log(blob);
    console.log(blob.type);
    return createImageBitmap(blob);
  })
  .then(imageBitmap => {
    const canvas = document.querySelector('#canvasTakePhoto');
    console.log(`Photo size is ${imageBitmap.width}x${imageBitmap.height}`);

    drawCanvas(canvas, imageBitmap);
    /*
    var img = document.querySelector('img');
    console.log(img);
    let url = window.URL.createObjectURL(imageBitmap);
    img.src = url;
    */
  })
  .catch(error => console.error(error));
}

function onTakePhoto2ButtonClick() {
  console.log('onTakePhoto2ButtonClick');
  imageCapture
    .takePhoto()
    .then((blob) => {
      console.log('Took photo:', blob);
      var img = document.querySelector('img');
      console.log(img);
      let url = window.URL.createObjectURL(blob);
      img.src = url;
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error(error);
    });
}