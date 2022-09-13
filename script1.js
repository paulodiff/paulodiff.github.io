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
    video: {
      width: {
        min: 320,
        ideal: 1920,
        max: 2560,
      },
      height: {
        min: 240,
        ideal: 1080,
        max: 1440,
      },
      deviceId: videoSource ? {exact: videoSource} : undefined}
  };

  console.log('getStream', constraints);

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
  console.log('onGrabFrameButtonClick');
  imageCapture.grabFrame()
  .then(imageBitmap => {
    const canvas = document.querySelector('#canvasGrabFrame');
    drawCanvas(canvas, imageBitmap, true);
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

function drawCanvas(canvas, img, resize) {
  console.log('drawCanvas', img.width, img.height, resize);

  if(resize)  {
    canvas.width = img.width;
    canvas.height = img.height;
  } else {
    canvas.width = getComputedStyle(canvas).width.split('px')[0];
    canvas.height = getComputedStyle(canvas).height.split('px')[0];
  }

  let ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
      x, y, img.width * ratio, img.height * ratio);
}


// UPLOAD 

const form = document.querySelector("form"),
fileInput = document.querySelector(".file-input"),
progressArea = document.querySelector(".progress-area"),
uploadedArea = document.querySelector(".uploaded-area");


document.getElementById('btnUpload').onclick = uploadFile('prova.png');

form.addEventListener("click", () =>{
  // fileInput.click();
});

fileInput.onchange = ({target})=>{
  let file = target.files[0];
  if(file){
    console.log('onChange', file);
    let fileName = file.name;
    
    if(fileName.length >= 12){
      let splitName = fileName.split('.');
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    console.log('onChange', fileName);
    // uploadFile(fileName);
  }
}

function uploadFile(name){
  console.log('uploadFile', name);
  let xhr = new XMLHttpRequest();

  console.log('uploadFile open xhr');
  xhr.open("POST", "https://laravel-on-replit.paulodiff.repl.co/api/store-image");

  xhr.onreadystatechange = function (oEvent) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log(xhr.responseText)
        } else {
           console.log("Error", xhr.statusText);
        }
    }
  };

  xhr.upload.addEventListener("progress", ({loaded, total}) =>{
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";

    console.log('progress', loaded, total, fileSize, fileTotal);

    let progressHTML = `<li class="row">
                          <i class="fas fa-file-alt"></i>
                          <div class="content">
                            <div class="details">
                              <span class="name">${name} • Uploading</span>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;

    uploadedArea.classList.add("onprogress");

    progressArea.innerHTML = progressHTML;

    if(loaded == total){
      progressArea.innerHTML = "";
      let uploadedHTML = `<li class="row">
                            <div class="content upload">
                              <i class="fas fa-file-alt"></i>
                              <div class="details">
                                <span class="name">${name} • Uploaded</span>
                                <span class="size">${fileSize}</span>
                              </div>
                            </div>
                            <i class="fas fa-check"></i>
                          </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }

  });


  let data = new FormData(form);

  xhr.send(data);
}