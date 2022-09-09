console.log('Start Js ...');

function addToLog(l) {
  document.getElementById('t1').value =
    document.getElementById('t1').value + '\n' + l;
}

addToLog('v 1.0.4');

function clearLog() {
  document.getElementById('t1').value = '';
}

/*

function requireVideo() {
  navigator.getUserMedia(
    // constraints
    {
      video: true,
      audio: false,
    },
    function (localMediaStream) {
      addToLog('video success');
      console.log('video success');
    },
    function (err) {
      addToLog('video denied - reset permission!');
      console.log(err);
    }
  );
}


function requireAudio() {
  navigator.getUserMedia(
    // constraints
    {
      video: false,
      audio: true,
    },
    function (localMediaStream) {
      addToLog('audio success');
      console.log('audio success');
    },
    function (err) {
      addToLog('audio denied - reset permission!');
      console.log(err);
    }
  );
}

*/

function listDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log('enumerateDevices() not supported.');
    addToLog('enumerateDevices() not supported.');
  } else {
    // List cameras and microphones.
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          console.log(
            `${device.kind}: ${device.label} id = ${device.deviceId}`
          );
          addToLog(`${device.kind}: ${device.label} id = ${device.deviceId}`);
        });
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
        addToLog(`${err.name}: ${err.message}`);
      });
  }
}

const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === 'videoinput');

  const options = videoDevices.map((videoDevice) => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join('');
};

function checkPermission() {

  navigator.permissions
    .query({ name: 'microphone' })
    .then((permissionObj) => {
      console.log(permissionObj.state);
      addToLog('mic:' + permissionObj.state);
    })
    .catch((error) => {
      console.log('Got error :', error);
    });

  navigator.permissions
    .query({ name: 'camera' })
    .then((permissionObj) => {
      console.log(permissionObj.state);
      addToLog('camera:' + permissionObj.state);
    })
    .catch((error) => {
      console.log('Got error :', error);
    });

  getCameraSelection();
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
  imageCapture.takePhoto()
  .then(blob => createImageBitmap(blob))
  .then(imageBitmap => {
    const canvas = document.querySelector('#canvasTakePhoto');
    drawCanvas(canvas, imageBitmap);
  })
  .catch(error => console.error(error));
}

// document.getElementById('btnAudio').onclick = requireAudio;
// document.getElementById('btnVideo').onclick = requireVideo;
document.getElementById('btnListDevices').onclick = listDevices;
document.getElementById('btnClearLog').onclick = clearLog;
document.getElementById('btnCheckPermission').onclick = checkPermission;
document.getElementById('btnGrabFrame').onclick = onGrabFrameButtonClick;
document.getElementById('btnTakePhoto').onclick = onTakePhotoButtonClick;

const cameraOptions = document.querySelector('.video-options>select');
let streamStarted = false;
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');

var imageCapture;

// const screenshotImage = document.querySelector('img');

const constraints = {
  video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440,
    },
  },
};


if (Modernizr.getusermedia) {
  console.log('hasGetUserMedia');
  addToLog('hasGetUserMedia');

  // var gUM = Modernizr('getUserMedia', navigator);
  // gUM({video: true}, function( //...
  //...
} else {
  console.log('ERROR : hasGetUserMedia');
}



// add stream
document.getElementById('btnPlay').onclick = () => {

  addToLog('play on ' + cameraOptions.value + ' ' + streamStarted);
  console.log('play on ', cameraOptions.value, streamStarted);
  

  if (streamStarted) {
    video.play();
    getCaps();
    // play.classList.add('d-none');
    // pause.classList.remove('d-none');
    return;
  }
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value,
      },
    };
    startStream(updatedConstraints);
  }
};

const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
};

const handleStream = (stream) => {
  console.log('handleStream');
  video.srcObject = stream;
  // play.classList.add('d-none');
  // pause.classList.remove('d-none');
  // screenshot.classList.remove('d-none');
  streamStarted = true;

  let stream_settings = stream.getVideoTracks()[0].getSettings();

  // actual width & height of the camera video
  let stream_width = stream_settings.width;
  let stream_height = stream_settings.height;

  console.log('Width: ' + stream_width + 'px');
  console.log('Height: ' + stream_height + 'px');
  addToLog('Width: ' + stream_width + 'px' + '   ' + 'Height: ' + stream_height + 'px' );


  /*
    let mediaStreamTrack = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(mediaStreamTrack);
    console.log(imageCapture);
  */

  /*
    const track = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
  */

  let mediaStreamTrack = stream.getVideoTracks()[0];
  imageCapture = new ImageCapture(mediaStreamTrack);


  getCaps();

};

function takePhoto() {
  console.log('talePhoto');
  var img = document.getElementById('img');

  console.log(imageCapture);

  imageCapture
    .takePhoto()
    .then((blob) => {
      let url = window.URL.createObjectURL(blob);
      img.src = url;

      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error(error);
    });
}

/*
 var now = Date.now();
navigator.mediaDevices.getUserMedia({audio: true, video: false})
.then(function(stream) {
  console.log('Got stream, time diff :', Date.now() - now);
})
.catch(function(err) {
  console.log('GUM failed with error, time diff: ', Date.now() - now);
});
*/

// document.getElementById('t1').value = 'casdasdad';
// document.getElementById('t1').value = document.getElementById('t1').value + '\n' + 'saluti';
/*
if (!navigator.mediaDevices?.enumerateDevices) {
  console.log("enumerateDevices() not supported.");
} else {
  // List cameras and microphones.
  navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      devices.forEach((device) => {
        console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
        addToLog(`${device.kind}: ${device.label} id = ${device.deviceId}`);
      });
    })
    .catch((err) => {
      console.error(`${err.name}: ${err.message}`);
    });
}
*/

/*

function onGetUserMediaButtonClick() {
  navigator.mediaDevices.getUserMedia({video: true})
  .then(mediaStream => {
    document.querySelector('video').srcObject = mediaStream;

    const track = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
  })
  .catch(error => ChromeSamples.log(error));
}

function onGrabFrameButtonClick() {
  imageCapture.grabFrame()
  .then(imageBitmap => {
    const canvas = document.querySelector('#grabFrameCanvas');
    drawCanvas(canvas, imageBitmap);
  })
  .catch(error => ChromeSamples.log(error));
}

function onTakePhotoButtonClick() {
  imageCapture.takePhoto()
  .then(blob => createImageBitmap(blob))
  .then(imageBitmap => {
    const canvas = document.querySelector('#takePhotoCanvas');
    drawCanvas(canvas, imageBitmap);
  })
  .catch(error => ChromeSamples.log(error));
}


function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  let ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
      x, y, img.width * ratio, img.height * ratio);
}

document.querySelector('video').addEventListener('play', function() {
  document.querySelector('#grabFrameButton').disabled = false;
  document.querySelector('#takePhotoButton').disabled = false;
});

*/

function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  let ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
      x, y, img.width * ratio, img.height * ratio);
}


function getCaps() {
  imageCapture.getPhotoCapabilities()
  .then(function(caps) {
    console.log(" PhotoCapabilities retrieved ", caps);
    addToLog(JSON.stringify(caps));
    addToLog(caps.String());
    theCapabilities = caps;

    if (theCapabilities.imageHeight) {
      theHeightSlider.min = theCapabilities.imageHeight.min;
      theHeightSlider.max = theCapabilities.imageHeight.max;
      theHeightSlider.value = theCapabilities.imageHeight.current;
      theHeightSliderValue.value = theHeightSlider.value;
      document.getElementById("height-area").style.visibility = "visible";
      theImageCapturer.setOptions({ imageHeight : theHeightSlider.value });
    }

    if (isChrome57or58) {
      if (theCapabilities.zoom.min !== theCapabilities.zoom.max) {
        theZoomSlider.min = theCapabilities.zoom.min;
        theZoomSlider.max = theCapabilities.zoom.max;
        theZoomSlider.value = theCapabilities.zoom.current;
        theZoomSlider.step = theCapabilities.zoom.step;
        theZoomSliderValue.value = theZoomSlider.value;
        document.getElementById("zoom-area").style.visibility = "visible";
      }
      focusModeLabel.innerHTML = 'focus : ' + theCapabilities.focusMode;

    } else {  /* ! isChrome57or58 */
      var zoom = theTrack.getCapabilities().zoom;
      if (zoom) {
        theZoomSlider.min = zoom.min;
        theZoomSlider.max = zoom.max;
        theZoomSlider.step = zoom.step;
        theZoomSlider.value = theTrack.getSettings().zoom;
        theZoomSliderValue.value = theZoomSlider.value;
        document.getElementById("zoom-area").style.visibility = "visible";
      }

      focusModeLabel.innerHTML =
          'focus : ' + theTrack.getCapabilities().focusMode;
    }
  });

}

/*

 let constraints = { 
                        audio: true, 
                        video: { 
                            width: { ideal: 1920 }, 
                            height: { ideal: 1080 } 
                        }
                    };

    let stream = await navigator.mediaDevices.getUserMedia(constraints);

    let stream_settings = stream.getVideoTracks()[0].getSettings();

    // actual width & height of the camera video
    let stream_width = stream_settings.width;
    let stream_height = stream_settings.height;

    console.log('Width: ' + stream_width + 'px');
    console.log('Height: ' + stream_height + 'px');

    */
