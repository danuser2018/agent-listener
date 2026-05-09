# Solution Intent: Grabación y Transcripción Autónoma con Whisper

## 1. Visión del Producto
Desarrollar una aplicación de código abierto y fácil instalación que permita a un usuario usar su teléfono móvil Android como micrófono, enviar el audio al servidor local donde un ejecutable de la IA Whisper (`whisper.cpp`) transcribirá privadamente lo hablado y guardará el resultado en un archivo de texto `.txt` (excluyendo iOS del alcance).

## 2. Tecnologías y Herramientas Propuestas
- **Motor Backend:** Node.js, para ejecutar el servidor.
- **Framework Web (Backend):** `express` para manejar rápidamente las rutas estáticas de la UI y el endpoint REST (`/upload`).
- **Manejo de Formularios Multipart:** `multer` (middleware para Express) que facilita la recepción de archivos en bruto que vienen del FormData.
- **Procesamiento de Audio:** Instalación implícita de una dependencia de `ffmpeg` invocada por el backend para asegurar que la entrada a Whisper es completamente formato 16kHz WAV, independiente de los codecs del móvil.
- **Transcripción de Voz a Texto:** Incorporación a nivel terminal de `whisper.cpp` como motor de inferencia local de alta eficiencia. Se ejecutará llamando al binario vía `child_process` dentro de Node.js, aislando los datos de la web.
- **Seguridad (Contexto Seguro):** Dado que se accede desde una IP local (ej: `192.168.1.50`), la W3C bloquea la provisión del micrófono a menos que sea a través de HTTPS. Se propone usar librerías como `selfsigned` para auto-generar un certificado TLS durante el arranque del server de Node.
- **Frontend / Cliente:** HTML5, CSS vanilla, y Vanilla JavaScript enfocados en la API `MediaRecorder` para móviles modernos en browsers Blink/Gecko.
- **Salida / Archivo:** Un archivo local `.txt` conteniendo en crudo las cadenas de strings obtenidas, sin resguardar audio permanente, garantizando la privacidad solicitada.

## 3. Resolución de Requerimientos y Riesgos Críticos
### 3.1. Requerimiento: "Ser accesible desde el móvil" - El Problema de HTTPS
La política de navegadores modernos declara que APIs como `getUserMedia()` sólo están disponibles en contextos seguros (orígenes locales `localhost` o en páginas con certificados TLS/SSL válidos).
*   **Decisión técnica:** La aplicación Node creará un servidor HTTPS en vez de uno HTTP tradicional proporcionando certificados autofirmados transitorios generados al vuelo (con bibliotecas tales como `selfsigned`). Existirá una pantalla en el móvil con una advertencia de seguridad para aceptar este certificado. Alternativamente se puede implementar en el CLI de la aplicación una llamada a túneles reversos como Ngrok o LocalTunnel, pero añadiría un factor de tercero no local. La primera opción es priorizada por ser totalmente offline.

### 3.2. Requerimiento: "Transcripción con Whisper Offline a Texto"
*   **Decisión técnica:** El repositorio `whisper.cpp` exige que los audios entrantes posean una resolución formal de formato `WAV (16-bit, 16kHz, canál mono)`. Puesto que el formato capturado por los navegadores Android utiliza `WebM` o `OGG` habitualmente (vía WebCodecs Opus), Node.js grabará el archivo provisionalmente en `/tmp`. A continuación, el servidor invocará a la CLI dependiente de `ffmpeg` para convertirlo a un Wav compatible. Una vez transcrito por el subproceso hijo de `whisper`, extraeremos el canal estándar con la transcripción, procediendo Node.js a almacenar un archivo `<tiempo>.txt` de texto definitivo en la raíz. Al finalizar las lecturas temporales, el servidor estará programado para eliminar obligatoriamente los medios temporales (audio original y `.wav`) reduciendo a cero el footprint inseguro en disco local.

### 3.3. Requerimiento: "Fácil de instalar y usar"
*   **Decisión técnica:** El proyecto entero se dispondrá a través de un archivo `package.json` con scripts bien definidos. Solo requerirá tener Node.js instalado, y usar el comando `npm install` y posteriormente orientar su uso con `npm run start`. Para hacerlo increíblemente amigable, al ejecutar el script del servidor, este imprimirá en el terminal un Código QR con la URL configurada localmente para que la persona lo escanee rápidamente con la cámara de su móvil y evite tipear IPs.
