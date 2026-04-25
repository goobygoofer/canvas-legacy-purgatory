const socket = io("/camera");

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  const video = document.getElementById("video");
  video.srcObject = stream;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  socket.emit("register", "camera");

  setInterval(() => {
    if (video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      socket.emit("frame", blob);
    }, "image/jpeg", 0.6);

  }, 100); // ~10fps
}

startCamera();