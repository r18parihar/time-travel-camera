const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const eraSelect = document.getElementById("era-select");
const transformBtn = document.getElementById("transform-btn");
const inputPreview = document.getElementById("input-preview");
const outputImage = document.getElementById("output-image");
const loader = document.getElementById("loader");
const statusMessage = document.getElementById("status-message");
const downloadBtn = document.getElementById("download-btn");

let selectedFile = null;

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.classList.remove("error", "success");
  if (type) {
    statusMessage.classList.add(type);
  }
}

function updateTransformButton() {
  transformBtn.disabled = !selectedFile;
}

dropZone.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  handleFile(file);
});

function handleFile(file) {
  if (!file) return;
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    setStatus("Only JPG and PNG images are allowed.", "error");
    selectedFile = null;
    inputPreview.removeAttribute("src");
    updateTransformButton();
    return;
  }

  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    inputPreview.src = event.target.result;
  };
  reader.readAsDataURL(file);
  setStatus("Image loaded. Choose an era and click Transform.", "success");
  updateTransformButton();
}

transformBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  loader.classList.remove("hidden");
  outputImage.classList.remove("visible");
  downloadBtn.disabled = true;
  setStatus("Transforming your photo through time...", "");

  const formData = new FormData();
  formData.append("image", selectedFile);
  formData.append("era", eraSelect.value);

  try {
    const response = await fetch("http://localhost:5000/api/time-travel", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Transformation failed. Please try again.");
    }

    const data = await response.json();
    if (!data || !data.image) {
      throw new Error("No image returned from server.");
    }

    outputImage.src = data.image;
    outputImage.classList.add("visible");
    downloadBtn.disabled = false;
    setStatus("Transformation complete! You can download your result.", "success");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Unexpected error. Please try again.", "error");
  } finally {
    loader.classList.add("hidden");
  }
});

downloadBtn.addEventListener("click", () => {
  if (!outputImage.src) return;
  const a = document.createElement("a");
  a.href = outputImage.src;
  a.download = `time-travel-${eraSelect.value}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
