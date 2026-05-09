const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const recordingMark = document.getElementById('recordingMark');
const messages = document.getElementById('messages');

let mediaRecorder;
let audioChunks = [];

async function init() {
    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
}

async function startRecording() {
    messages.innerText = '';
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const mimeToTry = 'audio/ogg; codecs=opus';
        const finalOptions = MediaRecorder.isTypeSupported(mimeToTry)
            ? { mimeType: mimeToTry }
            : undefined;

        mediaRecorder = new MediaRecorder(stream, finalOptions);

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const mimeType = mediaRecorder.mimeType || 'audio/ogg';
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            audioChunks = []; // reset
            await uploadAudio(audioBlob);

            // Re-enable start button
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusText.innerText = 'Listo para grabar';
            recordingMark.classList.remove('recording');

            // release tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();

        // UI Updates
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.innerText = 'Grabando...';
        recordingMark.classList.add('recording');

    } catch (err) {
        console.error('Error accessing microphone:', err);
        messages.innerText = 'Error: No se pudo acceder al micrófono.';
        messages.style.color = '#ef4444';
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        statusText.innerText = 'Procesando...';
    }
}

async function uploadAudio(blob) {
    statusText.innerText = 'Subiendo al servidor...';
    const formData = new FormData();
    formData.append('audio', blob, 'recording.ogg');

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            messages.innerText = result.message || 'Audio subido correctamente';
            messages.style.color = '#22c55e';
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        console.error('Error uploading:', err);
        messages.innerText = 'Error al subir el audio';
        messages.style.color = '#ef4444';
    } finally {
        statusText.innerText = 'Listo para grabar';
    }
}

document.addEventListener('DOMContentLoaded', init);
