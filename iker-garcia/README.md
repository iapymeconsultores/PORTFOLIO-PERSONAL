# Iker García · Portfolio

Portfolio personal con una ruleta 3D de proyectos (Three.js), animaciones de entrada (Anime.js) y un recorrido guiado por los doce proyectos que recuerda lo visto en cada navegador.

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a la rama `main` del repositorio.
2. En el repositorio: Settings → Pages → Source: "Deploy from a branch", rama `main`, carpeta `/ (root)`.
3. La web queda en `https://iapymeconsultores.github.io/PORTFOLIO-PERSONAL/iker-garcia/`.

## Estructura
- `index.html`: página, estilos y fichas de cada proyecto (etiquetas `<template id="case-...">`).
- `js/main.js`: ruleta, interacción y panel. La lista de proyectos está al principio (`PROJECTS`).
- `vendor/`: Three.js r169 y Anime.js 4.0.2 (licencia MIT), incluidos para no depender de CDNs.
- `img/`: fotos, portadas y capturas. `img/exp/` guarda los logos de la experiencia laboral.
- `demos/`: prototipo de la herramienta de Gorobel, con datos ficticios. Se abre dentro del portfolio.

## Atajos
- `L`: cambia entre ruleta e índice.
- `T`: cambia el tema claro u oscuro.
- Flechas: giran la ruleta o pasan de proyecto con el panel abierto.

Para probarla en local hace falta un servidor (los módulos JS no cargan con `file://`): `python3 -m http.server` dentro de la carpeta.
