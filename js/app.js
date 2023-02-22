/**
 * Register the service worker for the webapp
 */
try {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register("/billetterie-volley/sw.js");
    };
} catch (error) {
    console.error("Service Worker not supported");
}

import QrScanner from "./qr-scanner.min.js";

const video = document.getElementById("qr-video");
const outputData = document.getElementById("outputData");
const button = document.getElementById("button");
const camList = document.getElementById("cam-list");
const qrResult = document.getElementById("qr-result");
const loader = document.querySelector(".container-loader");

let endpoint_app = "";
let hasListCamera = false;

/**
 * Create the scanner
 */
const scanner = new QrScanner(video, result => setResult(result), {
    onDecodeError: error => {
        outputData.innerText = error;
    },
    highlightScanRegion: true,
    highlightCodeOutline: true
});


/**
 * The callback of the qr code
 * Launch when a qr code is decrypted
 * @param {string} res The result of the qr code 
 */
async function setResult(result) {
    if (result) {
        console.log(result.data);
        scanner.stop();
        qrResult.classList.remove("error", "valid", "already");
        loader.classList.remove("hidden");
        outputData.innerText = '';
        endpoint_app = prepareEndpoint(result.data);
        await ajaxCallEndpoint();

        video.hidden = true;
        qrResult.hidden = false;
        button.hidden = false;
    }
}

/**
 * Start the scanner on click on the button
 */
button.addEventListener("click", () => {
    video.hidden = false;
    qrResult.hidden = true;
    button.hidden = true;

    // We get all the camera of the phone to add it to the list
    scanner.start().then(() => {
        if(!hasListCamera) {
            QrScanner.listCameras(true).then(cameras => cameras.forEach(camera => {
                let option = document.createElement('option');
                option.value = camera.id;
                option.text = camera.label;
                camList.add(option);
            }));
            hasListCamera = true;
        }
    });
})

camList.addEventListener("change", (event) => {
    scanner.setCamera(event.target.value);
});

/**
 * We prepare the url of the endpoint
 */
function prepareEndpoint(result_qr) {
    let endpoint = "";

    let first_split = result_qr.split("?");
    endpoint = first_split[0] + "/wp-json/tribe/tickets/v1/qr?";

    let second_split = first_split[1].split("&");

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
    await fetch(endpoint_app, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.attendee.checked_in) {
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
