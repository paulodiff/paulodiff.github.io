'use strict';

var videoElement = document.querySelector('video');

// videoElement.width=500;
// videoElement.height=240;

// var videoCanvas = document.getElementById('videoCanvas')
// var ctx = videoCanvas.getContext('2d');

// ctx.canvas.width = videoElement.width;
// ctx.canvas.height = videoElement.height;

// console.log('cx ',  ctx.canvas.width, ctx.canvas.height, vRatio, hRatio);

// var vRatio = (ctx.canvas.height / videoElement.width) * videoElement.width;
// ctx.drawImage(v, 0,0, vRatio, c.height);

// fill horizontally  
// var hRatio = (ctx.canvas.width / videoElement.height) * videoElement.height;

// console.log('cx ',  ctx.canvas.width, ctx.canvas.height, vRatio, hRatio);

// var audioSelect = document.querySelector('select#audioSource');
/*
videoElement.addEventListener('play', function () {
  var $this = this; //cache
  (function loop() {
      if (!$this.paused && !$this.ended) {


          // var c = canvasElement, v=videoElement;
          // fill vertically  
          var vRatio = (ctx.canvas.height / $this.videoHeight) * $this.videoWidth;
          // ctx.drawImage(v, 0,0, vRatio, c.height);

          // fill horizontally  
          var hRatio = (ctx.canvas.width / $this.videoWidth) * $this.videoHeight;
          ctx.drawImage($this, 0,0, vRatio, hRatio);
         
          // ctx.drawImage($this, 0, 0);
          setTimeout(loop, 1000 / 30); // drawing at 30fps
      }
  })();
}, 0);
*/

function log2video(s)
{
  document.getElementById('txtMsg').innerHTML = s;
  
}



// var videoSelect = document.querySelector('select#videoSource');
var videoSelect = document.getElementById('selectVideoSource');

// audioSelect.onchange = getStream;
// videoSelect.onchange = getStream;

videoSelect.onchange = changeVideo;

var imageCapture;
var currentCapabilities;
var file;


getStream().then(getDevices).then(gotDevices)
.then(getPhotoCapabilities).then(gotPhotoCapabilities)
.then(setUpGui);
// .then(onGrabFrameButtonClick);


function changeVideo (){
  getStream()
.then(getPhotoCapabilities).then(gotPhotoCapabilities)
.then(setUpGui);
}

function getDevices() {
  // AFAICT in Safari this only gets default devices until gUM is called :/
  console.log('getDevices');
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
  // document.getElementById('btnTakePhoto').onclick = onTakePhotoButtonClick;
  document.getElementById('btnTakePhoto').onclick = onTakePhotoButtonClick;
  document.getElementById('btnUploadFromCanvas').onclick = uploadFileFromCanvas;
  document.getElementById('btnUploadFromImg').onclick = uploadFileFromImg;
  document.getElementById('btnSwitchCamera').onclick = switchCamera;
  document.getElementById('btnRiprova').onclick = riprova;
  // document.getElementById('btnUpload').onclick = uploadFile;

  hideElementById('btnUploadFromImg');
  hideElementById('btnRiprova');
  // showHideElementById('btnGrabFrame');
  // showHideElementById('btnUploadFromCanvas');

}

function riprova () {
  showElementById('btnTakephoto');
  console.log('riprova .. ');
  hideElementById('btnUploadFromImg');
  // hideElementById('btnRiprova');
  log2video('Inquadrare il documento e cliccare su scatta');
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
  console.log('gotStream');
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


function hideElementById(id) {
  console.log('hide', id);
  var x = document.getElementById(id);
  x.style.display = "none";
}

function showElementById(id) {
  console.log('show', id);
  var x = document.getElementById(id);
  x.style.display = "block";
}

function onGrabFrameButtonClick() {
  console.log('onGrabFrameButtonClick');
  log2video('Foto acquisita. Clicca su carica o annulla');

  imageCapture.grabFrame()
  .then(imageBitmap => {
    const canvas = document.querySelector('#canvasGrabFrame');
    drawCanvas(canvas, imageBitmap, true);
  })
  .catch(error => console.error(error));
}
/*
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
  
  })
  .catch(error => console.error(error));
}
*/

/*

const img = document.querySelector('img');
// ...
imageCapture.takePhoto()
    .then(blob => {
    img.src = URL.createObjectURL(blob);
    img.onload = () => { URL.revokeObjectURL(this.src); }
    })
    .catch(error => console.error('takePhoto() error:', error));

*/

function onTakePhotoButtonClick() {
  console.log('onTakePhotoButtonClick on img');
  log2video('Acquisizione foto ...');
  imageCapture
    .takePhoto()
    .then((blob) => {
      console.log('Took photo:', blob);

      console.log('Took photo init file');
      file = new File([blob], 'test.png', { type: 'image/png' });

      var img = document.querySelector('img');
      img.src = URL.createObjectURL(blob);
      img.onload = () => { 
        showElementById('btnUploadFromImg');
        showElementById('btnRiprova');
        hideElementById('btnTakePhoto');
        log2video('Foto acquisita. Clicca su invia o riprova');
        URL.revokeObjectURL(this.src); 
      }
      //  let url = window.URL.createObjectURL(blob);
      // img.src = url;
      // window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error(error);
    });
}


function getPhotoCapabilities() {
  return imageCapture.getPhotoCapabilities();
}

function gotPhotoCapabilities(c) {
  currentCapabilities = c;
  return console.log('gotPhotoCapabilities', JSON.stringify(currentCapabilities));
}

function getPhotoCapabilities1() {
  console.log('getPhotoCapabilities');
  imageCapture.getPhotoCapabilities()
  .then(function(caps) {
    console.log('getPhotoCapabilities', caps);
    return true;
    
    /*
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

    } else { 
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

    */

  });

}

/*

const capture = new ImageCapture(track);
const { imageWidth, imageHeight } = await capture.getPhotoCapabilities();
const width = setInRange(required_width, imageWidth);
const height = setInRange(required_height, imageHeight);
const photoSettings = (width && height) ? {
  imageWidth: width,
  imageHeight: height
} : null;
const pic = await capture.takePhoto(photoSettings);

function setInRange(value, range) {
  if(!range) return NaN;
  let x = Math.min(range.max, Math.max(range.min, value));
  x = Math.round(x / range.step) * range.step; // take `step` into account
  return x;
}


*/
function photoCapapilies2str(c) {

  var ret = '';
  var theCapabilities = c;
  return JSON.stringify(c);

  /*

  if (theCapabilities.imageHeight) {
    theHeightSlider.min = theCapabilities.imageHeight.min;
    theHeightSlider.max = theCapabilities.imageHeight.max;
    theHeightSlider.value = theCapabilities.imageHeight.current;
    theHeightSliderValue.value = theHeightSlider.value;
    // document.getElementById("height-area").style.visibility = "visible";
    // theImageCapturer.setOptions({ imageHeight : theHeightSlider.value });
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

    */

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


function switchCamera() {
  const $select = document.querySelector('#selectVideoSource');
  // console.log($select.value);
  // $select.value = 'steve';
  var currSelected =  $select.selectedIndex + 1;
  var newSelected = (currSelected < $select.length) ? currSelected : 0 ;
  
  console.log($select.selectedIndex, newSelected);
  
  $select.selectedIndex = newSelected;

  var event = new Event('change');

// Dispatch it.
  $select.dispatchEvent(event);
  // $select.fireEvent("onchange");
  /*
  for (i = 0; i < $select.length; i++) {
        console.log(i, $select.length, $select.selectedIndex, $select.options[i].value, $select.options[i].text);
  
  }
  */
  
};


// UPLOAD  --------------------------------------------------

// var form = document.querySelector("form");
// var fileInput = document.querySelector(".file-input");
// var progressArea = document.querySelector(".progress-area");
// var uploadedArea = document.querySelector(".uploaded-area");
var fileName;

// document.getElementById('btnUpload').onclick = uploadFile('pro4va.png');

// form.addEventListener("click", () =>{ // fileInput.click();});

/*
fileInput.onchange = ({target})=>{
  let file = target.files[0];
  if(file){
    console.log('onChange', file);
    fileName = file.name;
    
    if(fileName.length >= 12){
      let splitName = fileName.split('.');
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    console.log('onChange', fileName);
    // uploadFile(fileName);
  }
}
*/

function uploadFile(){
  console.log('uploadFile', fileName);
  var name = fileName;
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

  xhr.upload.addEventListener("uploadFile progress", ({loaded, total}) =>{
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";

    console.log('uploadFile progress', loaded, total, fileSize, fileTotal);

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

  console.log(data);

  xhr.send(data);
}

/*

// JPEG file
let file = null;
let blob = document.querySelector("#canvasGrabFrame").toBlob(function(blob) {
				file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
			}, 'image/jpeg');

const formData = new FormData();
formData.append(files[i].name, files[i]);
request.send(formData);

 formData.append("file", file);
request.send(formData);

*/

//-------------------------------------------

const uploadFileFromImg = async () => {

  console.log('uploadFileFromImg', '....')
  var frm = new FormData();
  frm.append("image", file);
  uploadForm(frm)
}

const uploadFileFromCanvas = async () => {
// function async uploadFileFromCanvas(){

  

  var fileName = 'test.jpg';
  var name = fileName;
  

  log2video('Caricamento ...');
  console.log('uploadFileFromCanvas', 'create image from canvas')

  // const blob = await new Promise(resolve => canvasElem.toBlob(resolve));

  /*
  var blob = document.querySelector("#canvasGrabFrame")
        .toBlob(function(blob) {
          console.log('insideToBlob!');
          file = new File([blob], fileName, { type: 'image/jpeg' });
        }, 'image/jpeg');
  */
  

  var blob = await new Promise(resolve => 
    document.querySelector("#canvasGrabFrame")
      .toBlob(function(blob) {
    console.log('insideToBlob!');
    file = new File([blob], fileName, { type: 'image/jpeg' });
    console.log('file builded!', file);
    // formData.append('file', blob, 'image.jpg')
    var frm = new FormData();
    frm.append("image", file);
    // frm.append(files[i].name, files[i]);
    //request.send(formData);
    // console.log(file);
    // formData.append("image", file);
    uploadForm(frm);
    }, 'image/jpeg')
  );

/*

  console.log('uploadFileFromCanvas', blob);
  console.log('uploadFileFromCanvas', file);

  

  let xhr = new XMLHttpRequest();

  console.log('uploadFileFromCanvas open xhr');

  xhr.open("POST", "https://laravel-on-replit.paulodiff.repl.co/api/store-image");

  xhr.onreadystatechange = function (oEvent) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('onreadystatechange', xhr.responseText)
          log2video(xhr.responseText);
        } else {
           console.log("Error", xhr.statusText);
           log2video('ERRORE!');
        }
    }
  };

  xhr.upload.addEventListener("progress", ({loaded, total}) =>{
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";

    console.log('progress', loaded, total, fileSize, fileTotal);
    log2video('progress' & loaded  & total & fileSize & fileTotal);

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
      console.log('progress', name, loaded, total, fileSize, fileTotal);
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


  // let data = new FormData(form);


  console.log('uploadFileFromCanvas', 'create form values ...');

  var formData = new FormData();
  //formData.append(files[i].name, files[i]);
  //request.send(formData);

  console.log(file);

  formData.append("image", file);
  // request.send(formData);


  xhr.send(formData);

  */
}


function uploadForm(frm)
{

  let xhr = new XMLHttpRequest();

  console.log('uploadForm open xhr');

  xhr.open("POST", "https://laravel-on-replit.paulodiff.repl.co/api/store-image");

  xhr.onreadystatechange = function (oEvent) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('uploadForm', xhr.responseText)
          log2video('Caricamento ok!');
        } else {
           console.log("Error", xhr.statusText);
           log2video('Upload ERROR!');
        }
    }
  };

  xhr.upload.addEventListener("progress", ({loaded, total}) =>{
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";

    console.log('uploadForm progress', loaded, total, fileSize, fileTotal);

    log2video('Caricati ' + fileSize + ' di ' + fileTotal);

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

    // uploadedArea.classList.add("onprogress");

    // progressArea.innerHTML = progressHTML;

    if(loaded == total){
      console.log('uploadForm progress', loaded, total, fileSize, fileTotal);
      // progressArea.innerHTML = "";
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
      // uploadedArea.classList.remove("onprogress");
      // uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }

  });


  // let data = new FormData(form);


  console.log('uploadForm', 'create form values ...');

  xhr.send(frm);


}

