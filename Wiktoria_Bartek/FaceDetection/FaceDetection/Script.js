const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => (video.srcObject = stream))
        .catch((err) => console.error(err));
}
video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);

    // Set the z-index and position properties
    canvas.style.zIndex = '1'; // Adjust the value as needed
    canvas.style.position = 'absolute';

    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
        );
        canvas
            .getContext('2d')
            .clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        resizedDetections.forEach((face) => {
            const leftEye = face.landmarks.getLeftEye();
            const rightEye = face.landmarks.getRightEye();
            const heartSize = 20;

            const context = canvas.getContext('2d'); // Get the 2D context here

            // Draw the heart shape at each eye position
            heartShape(context, leftEye.x, leftEye.y, heartSize);
            heartShape(context, rightEye.x, rightEye.y, heartSize);
        });

        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
});

function heartShape(context, x, y, size) {
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(
        x + size / 2,
        y - size / 2,
        x + size * 1.5,
        y - size / 2,
        x + size * 2,
        y
    );
    context.bezierCurveTo(
        x + size * 2.5,
        y + size / 2,
        x + size,
        y + size * 2,
        x,
        y + size * 3
    );
    context.bezierCurveTo(
        x - size,
        y + size * 2,
        x - size * 2.5,
        y + size / 2,
        x - size * 2,
        y
    );
    context.bezierCurveTo(
        x - size * 1.5,
        y - size / 2,
        x - size / 2,
        y - size / 2,
        x,
        y
    );

    context.fillStyle = 'red'; // You can change the color
    context.fill();
    context.closePath();
}
