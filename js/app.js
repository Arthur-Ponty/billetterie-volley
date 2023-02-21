/**
 * Register the service worker for the webapp
 */
try {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register("/qr_scan_volley/sw.js");
    };   
} catch (error) {
    console.error("Service Worker not supported");
}

var qrcode = window.qrcode;

const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

const qrResult = document.getElementById("qr-result");
const outputData = document.getElementById("outputData");
const btnScanQR = document.getElementById("button");
const loader = document.querySelector(".container-loader");

let scanning = false;
let endpoint_app = "";

/**
 * The callback of the qr code
 * Launch when a qr code is decrypted
 * @param {string} res The result of the qr code 
 */
qrcode.callback = async res => {
    if (res) {
        qrResult.classList.remove("error", "valid", "already");
        loader.classList.remove("hidden");
        endpoint_app = prepareEndpoint(res);
        await ajaxCallEndpoint();

        video.srcObject.getTracks().forEach(track => {
            track.stop();
        });
        scanning = false;
        qrResult.hidden = false;
        btnScanQR.hidden = false;
        canvasElement.hidden = true;
    }
};

/**
 * When we click on the button
 * We launch the camera of the device of the user
 */
btnScanQR.onclick = () => {
    navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
        scanning = true;
        qrResult.hidden = true;
        btnScanQR.hidden = true;
        canvasElement.hidden = false;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.srcObject = stream;
        video.play();
        tick();
        scan();
    });
};

/**
 * We redraw the canvas every tick
 */
function tick() {
    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

    scanning && requestAnimationFrame(tick);
}

/**
 * We try to decode a qr code, 
 * If qr code not found, then we wait 300ms and retry
 */
function scan() {
    try {
        qrcode.decode();
    } catch (e) {
        setTimeout(scan, 300);
    }
}

/**
 * We prepare the url of the endpoint
 */
function prepareEndpoint(result_qr) {
    let endpoint = "";

    first_split = result_qr.split("?");
    endpoint = first_split[0] + "wp-json/tribe/tickets/v1/qr?";

    second_split = first_split[1].split("&");

    endpoint += second_split[1] + "&";
    endpoint += second_split[2] + "&";
    endpoint += second_split[3] + "&";
    endpoint += "api_key=7ed7e5b9";

    return endpoint;
}

/**
 * We call the site with the endpoint
 */
async function ajaxCallEndpoint() {
    await fetch(endpoint_app, {method: 'GET'})
    .then(response => response.json())
    .then(data => {
        if(data.attendee.checked_in) {
            qrResult.classList.add("already");
        } else {
            qrResult.classList.add("valid");
        }
        outputData.innerText = data.msg;
    })
    .catch(error => {
        qrResult.classList.add("error");
        outputData.innerText = "Quelque chose s'est mal passé, merci de réessayer.";
    });
    loader.classList.add("hidden");
}
