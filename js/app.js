if('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./js/sw.js");
};

var qrcode = window.qrcode;

const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

const qrResult = document.getElementById("qr-result");
const outputData = document.getElementById("outputData");
const btnScanQR = document.getElementById("btn-scan-qr");

let scanning = false;
let endpoint_app = "";

qrcode.callback = async res => {
    if (res) {
        endpoint_app = prepareEndpoint(res);
        await ajaxCallEndpoint();

        video.srcObject.getTracks().forEach(track => {
            track.stop();
        });
        scanning = false;
        qrResult.hidden = false;
        canvasElement.hidden = true;
        btnScanQR.hidden = false;
    }
};

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

function tick() {
    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

    scanning && requestAnimationFrame(tick);
}

function scan() {
    try {
        qrcode.decode();
    } catch (e) {
        setTimeout(scan, 300);
    }
}

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

async function ajaxCallEndpoint() {
    await fetch(endpoint_app, {method: 'GET'})
    .then(response => response.json())
    .then(data => { outputData.innerText = data.msg; });
}
