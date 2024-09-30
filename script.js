// Function to extract basic navigator information and device details
function getUserFingerPrint(appId, userId, pubId) {
  const language = navigator.language;
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor;
  const maxTouchPoints = navigator.maxTouchPoints;
  const hardwareConcurrency = navigator.hardwareConcurrency;
  const deviceMemory = navigator.deviceMemory;

  // Extract screen information
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const colorDepth = window.screen.colorDepth;

  // Audio context information
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const channelCount = audioContext.destination.maxChannelCount;

  // WebGL information
  let webglVendor, webglRenderer, webglVersion, shadingLanguageVersion;

  function getBasicWebGLInfo() {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (gl) {
      webglVendor = gl.getParameter(gl.VENDOR);
      webglRenderer = gl.getParameter(gl.RENDERER);
      webglVersion = gl.getParameter(gl.VERSION);
      shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    }
  }

  getBasicWebGLInfo();

  const deviceInfo = {
    language,
    platform,
    userAgent,
    vendor,
    maxTouchPoints,
    hardwareConcurrency,
    deviceMemory,
    screenWidth,
    screenHeight,
    colorDepth,
    sampleRate,
    channelCount,
    webglVendor,
    webglRenderer,
    webglVersion,
    shadingLanguageVersion,
    appId,
    userId,
    pubId,
  };

  return deviceInfo;
}

// Function to send data to the API
function sendDataToApi(dataObj, apiUrl, secretKey) {
  const enc = new TextEncoder();

  crypto.subtle
    .importKey(
      "raw",
      enc.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    .then((key) => {
      return crypto.subtle.sign(
        "HMAC",
        key,
        enc.encode(JSON.stringify(dataObj))
      );
    })
    .then((signatureBuffer) => {
      const signature = btoa(
        String.fromCharCode(...new Uint8Array(signatureBuffer))
      );

      return fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body: JSON.stringify(dataObj),
      });
    })
    .catch((error) => {
      console.error("Error sending data:", error);
    });
}

// Main function to collect fingerprint data and send it
function collectAndSendFingerPrint(params) {
  const { appId, userId, pubId, apiUrl, secretKey } = params;

  // If any required parameter is missing, log an error
  if (!appId || !userId || !pubId || !apiUrl || !secretKey) {
    console.error("Missing required parameters!");
    return;
  }

  // Collect device details
  const deviceInfo = getUserFingerPrint(appId, userId, pubId);

  // Send the data to API
  sendDataToApi(deviceInfo, apiUrl, secretKey);
}
