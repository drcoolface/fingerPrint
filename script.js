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
  audioContext.close(); // Close the AudioContext

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
async function sendDataToApi(dataObj, apiUrl, secretKey) {
  try {
    const enc = new TextEncoder();

    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Sign the data object
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(JSON.stringify(dataObj))
    );

    // Convert signature to base64
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    // Send data to API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      body: JSON.stringify(dataObj),
    });

    // Check for a successful response
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    console.log("Data successfully sent!");
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

// Main function to collect fingerprint data and send it
async function collectAndSendFingerPrint(params) {
  const { appId, userId, pubId, apiUrl, secretKey } = params;


  if (!appId || !userId || !pubId || !apiUrl || !secretKey) {
    console.error("Missing required parameters!");
    return;
  }

  // Collect device details
  const deviceInfo = getUserFingerPrint(appId, userId, pubId);

  // Send the data to API
  await sendDataToApi(deviceInfo, apiUrl, secretKey);
}

// Example usage:
// collectAndSendFingerPrint({
//     appId: 'app-id-123',
//     userId: 'user-id-456',
//     pubId: 'pub-id-789',
//     apiUrl: 'https://your-api-url.com/device-details',
//     secretKey: 'your-secret-key'
// });
