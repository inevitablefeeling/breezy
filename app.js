const video = document.querySelector("#camera-video");
const placeholder = document.querySelector("#preview-placeholder");
const startButton = document.querySelector("#start-camera");
const grid = document.querySelector("#composition-grid");
const gridToggle = document.querySelector("#grid-toggle");
const settingsGrid = document.querySelector("#settings-grid");
const settingsSheet = document.querySelector("#settings-sheet");
const photoSheet = document.querySelector("#photo-sheet");
const toast = document.querySelector("#toast");
const canvas = document.querySelector("#capture-canvas");
const context = canvas.getContext("2d");
const flash = document.querySelector("#camera-flash");
const cameraStatus = document.querySelector("#camera-status");
const guideChip = document.querySelector("#guide-chip");
const guideText = document.querySelector("#guide-text");
const clock = document.querySelector("#clock");

let stream = null;
let facingMode = "environment";
let currentZoom = 1;
let lastPhotoUrl = null;
let lastPhotoBlob = null;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit", minute: "2-digit"
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 15000);

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Open Breezy on an HTTPS connection to use the camera.");
    return;
  }

  if (stream) stream.getTracks().forEach(track => track.stop());

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    video.srcObject = stream;
    await video.play();
    video.style.display = "block";
    placeholder.hidden = true;
    cameraStatus.textContent = "CAMERA ACTIVE";
    showToast("You're ready to shoot");
    guideChip.classList.add("visible");
    guideText.textContent = "Move slowly. Find your frame.";
    setTimeout(() => guideChip.classList.remove("visible"), 3200);
    applyZoom();
  } catch (error) {
    console.error("Camera error:", error);
    const message = error.name === "NotAllowedError"
      ? "Allow camera access in your browser settings."
      : "Couldn't open the camera. Try again.";
    showToast(message);
  }
}

startButton.addEventListener("click", openCamera);

function setGrid(enabled) {
  grid.classList.toggle("visible", enabled);
  gridToggle.classList.toggle("is-on", enabled);
  settingsGrid.checked = enabled;
}
gridToggle.addEventListener("click", () => setGrid(!grid.classList.contains("visible")));
settingsGrid.addEventListener("change", event => setGrid(event.target.checked));

document.querySelector("#settings-open").addEventListener("click", () => settingsSheet.showModal());
settingsSheet.querySelector(".close-button").addEventListener("click", () => settingsSheet.close());

function applyZoom() {
  // Digital preview zoom is a visual crop; capture output uses the same crop.
  video.style.transform = `scale(${currentZoom})`;
}
document.querySelectorAll(".zoom-option").forEach(button => {
  button.addEventListener("click", () => {
    currentZoom = Number(button.dataset.zoom);
    document.querySelectorAll(".zoom-option").forEach(item => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    applyZoom();
  });
});

document.querySelector("#flip-camera").addEventListener("click", async () => {
  facingMode = facingMode === "environment" ? "user" : "environment";
  currentZoom = 1;
  document.querySelectorAll(".zoom-option").forEach(item => item.classList.toggle("is-selected", item.dataset.zoom === "1"));
  if (stream) await openCamera();
  else showToast("Camera switches when you open the camera.");
});

function capturePhoto() {
  if (!stream || video.readyState < 2 || !video.videoWidth) {
    showToast("Open the camera before taking a photo.");
    return;
  }

  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const cropWidth = sourceWidth / currentZoom;
  const cropHeight = sourceHeight / currentZoom;
  const sx = (sourceWidth - cropWidth) / 2;
  const sy = (sourceHeight - cropHeight) / 2;

  canvas.width = Math.round(cropWidth);
  canvas.height = Math.round(cropHeight);
  context.save();
  if (facingMode === "user") {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, sx, sy, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
  context.restore();

  canvas.toBlob(blob => {
    if (!blob) {
      showToast("Couldn't capture that photo. Try again.");
      return;
    }
    lastPhotoBlob = blob;
    if (lastPhotoUrl) URL.revokeObjectURL(lastPhotoUrl);
    lastPhotoUrl = URL.createObjectURL(blob);
    document.querySelector("#last-photo-thumb").src = lastPhotoUrl;
    document.querySelector("#last-photo-thumb").hidden = false;
    document.querySelector(".thumb-placeholder").hidden = true;
    document.querySelector("#photo-preview").src = lastPhotoUrl;

    flash.classList.remove("fire");
    void flash.offsetWidth;
    flash.classList.add("fire");
    if (navigator.vibrate) navigator.vibrate(18);
    showToast("Captured. Keep that moment.");
  }, "image/jpeg", 0.94);
}
document.querySelector("#take-photo").addEventListener("click", capturePhoto);

document.querySelector("#open-last-photo").addEventListener("click", () => {
  if (!lastPhotoUrl) {
    showToast("Your latest photo will appear here.");
    return;
  }
  photoSheet.showModal();
});
document.querySelector("#photo-close").addEventListener("click", () => photoSheet.close());

document.querySelector("#download-photo").addEventListener("click", () => {
  if (!lastPhotoBlob) return;
  const url = URL.createObjectURL(lastPhotoBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `breezy-${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  showToast("Photo ready to save");
});

document.querySelectorAll(".mode-option").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-option").forEach(item => item.classList.remove("is-active"));
    button.classList.add("is-active");
    if (button.dataset.mode !== "PHOTO") {
      showToast(`${button.dataset.mode[0]}${button.dataset.mode.slice(1).toLowerCase()} mode is coming later.`);
      document.querySelector('[data-mode="PHOTO"]').classList.add("is-active");
      button.classList.remove("is-active");
    }
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    video.style.display = "none";
    placeholder.hidden = false;
    cameraStatus.textContent = "READY WHEN YOU ARE";
  }
});

// Register the offline shell. Camera access still requires a secure origin (HTTPS).
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.warn("Service worker registration failed:", error);
    });
  });
}
