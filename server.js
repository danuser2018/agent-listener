const https = require('https');
const express = require('express');
const multer = require('multer');
const selfsigned = require('selfsigned');
const qrcode = require('qrcode-terminal');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const util = require('util');
const execFileAsync = util.promisify(execFile);

const app = express();
const PORT = 3000;

// Configurar multer
const uploadDir = path.join(__dirname, 'recordings');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `recording-${Date.now()}.ogg`);
    }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/upload', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No audio file received' });
    }

    try {
        const inputPath = req.file.path;
        console.log(`Audio temporal guardado: ${inputPath}`);

        const timestamp = Date.now();
        const wavPath = path.join(uploadDir, `temp-${timestamp}.wav`);
        const whisperOutPathBase = path.join(uploadDir, `transcription-${timestamp}`);
        const finalTxtPath = `${whisperOutPathBase}.txt`;

        console.log("Desruidificando y transcodificando audio a 16kHz WAV con ffmpeg...");
        await execFileAsync(ffmpeg, ['-y', '-i', inputPath, '-af', 'afftdn,highpass=f=200,lowpass=f=3000', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wavPath]);

        console.log("Transcribiendo audios mediante whisper.cpp...");
        const whisperBin = path.join(__dirname, 'whisper.cpp', 'main');
        const whisperModel = path.join(__dirname, 'whisper.cpp', 'models', 'ggml-base.bin');

        await execFileAsync(whisperBin, [
            '-m', whisperModel,
            '-f', wavPath,
            '-l', 'es',
            '-otxt',
            '-of', whisperOutPathBase
        ]);

        console.log(`Transcripción completa: ${finalTxtPath}`);

        // Limpiando archivos temporales
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

        res.status(200).json({ success: true, message: 'Texto transcrito con éxito' });
    } catch (err) {
        console.error("Error intermedio:", err);
        res.status(500).json({ success: false, message: 'Fallo al procesar o transcribir el audio' });
    }
});

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const pems = selfsigned.generate([{ name: 'commonName', value: 'agent-listener-audio' }], { days: 365 });

const server = https.createServer({
    key: pems.private,
    cert: pems.cert
}, app);

server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIpAddress();
    const url = `https://${ip}:${PORT}`;
    console.log(`Server listening on ${url}`);
    console.log('Escanea el siguiente QR para abrir la app en el móvil:\n');
    qrcode.generate(url, { small: true });
});
