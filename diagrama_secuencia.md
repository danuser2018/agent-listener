# Diagrama de Secuencia: Grabación y Transcripción

El siguiente diagrama detalla la iteración entre el usuario (desde su teléfono móvil Android), el cliente web (Navegador) y el servidor Node.js instalado en el ordenador local para llevar a cabo el inicio, grabación, envío, transcripción con whisper.cpp y guardado del archivo de texto final.

```mermaid
sequenceDiagram
    actor Usuario
    participant Navegador as Navegador Móvil
    participant API as Servidor Node.js
    participant FS as File System local

    Note over Usuario, API: Fase de Inicio de la App
    Usuario->>Navegador: Ingresa URL del Servidor (https://IP:PORT)
    Navegador->>API: GET / (petición de index)
    API-->>Navegador: Retorna HTML, JS, CSS
    Navegador-->>Usuario: Muestra interfaz

    Note over Usuario, FS: Fase de Grabación
    Usuario->>Navegador: Pulsa "Grabar"
    Navegador->>Navegador: Ejecuta navigator.mediaDevices.getUserMedia({audio: true})
    Navegador-->>Usuario: Pide permisos
    Usuario->>Navegador: Permite acceso
    Navegador->>Navegador: Inicia MediaRecorder instanciando stream
    Usuario-->>Navegador: Habla (emite audio)
    
    Usuario->>Navegador: Pulsa "Detener"
    Navegador->>Navegador: Finaliza MediaRecorder y genera el Blob .ogg
    Navegador->>API: HTTP POST /upload (FormData que contiene el chunk audio)
    API->>FS: Guarda audio temporal
    API->>API: Transcodifica a 16kHz WAV (vía ffmpeg)
    API->>API: child_process: Ejecuta whisper.cpp procesando WAV
    API->>FS: fs.writeFile (guarda resultado en .txt)
    FS-->>API: Notifica escritura de texto finalizada
    API-->>Navegador: HTTP 200 OK (Confirmación de transcripción)
    Navegador-->>Usuario: Muestra mensaje "Texto transcrito con éxito"
