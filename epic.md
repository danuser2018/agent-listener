# Aplicación para grabar audio del micrófono y transcribirlo a un archivo de texto
## Descripción

Quiero una aplicación que me permita grabar audio del micrófono y transcribirlo a un archivo de texto

## Requisitos

- Debe permitir grabar audio del micrófono.
- Debe permitir transcribir el audio y guardar el resultado en un archivo de texto.
- Debe permitir detener la grabación.

## Criterios de aceptación

- La aplicación debe permitir grabar audio del micrófono.
- La aplicación debe permitir transcribir el audio y guardar el resultado en un archivo de texto.
- La aplicación debe permitir detener la grabación.

## Notas

- La aplicación debe ser multiplataforma.
- La aplicación debe ser de código abierto.
- La aplicación debe ser gratuita.
- La aplicación debe ser fácil de usar.
- La aplicación debe ser fácil de instalar.
- La aplicación debe ser fácil de desinstalar.
- Propongo utilizar node como tecnología tanto para el desarrollo como para despliegue del servidor, que debe funcionar localmente. 
- El usuario utilizará preferentemente el micrófono del móvil para grabar el audio. Por lo tanto, la aplicación debe ser accesible desde un móvil android. Iphone queda fuera del scope.
- Para la transcripción se propone el uso de la herramienta whisper de openai. Por motivos de confidencialidad, se debe ejecutar localmente. Se puede utilizar la librería whisper.cpp para ello.