# WebRTC VTT

WebRTC VTT is a project that aims to provide a simple way to create a virtual tabletop for playing tabletop RPGs online. It is built on top of WebRTC and uses the [PeerJS](https://peerjs.com/) library to handle the WebRTC connections.
It's build using SvelteKit and TypeScript.

## Development
❗❗It is currently in a very early stage of development and is not yet ready for use.❗❗

WebRTC curently not implemented

### Features
❗❗ Only local at the moment ❗❗
- [ ] Map
  - [ ] Drag and drop
    - [x] Move tokens
    - [x] Upload
    - [ ] Delete
  - [x] Move map
  - [x] Zoom
  - [ ] Fog of war
  - [ ] Dynamic lighting
- [ ] Character sheets
    - [ ] D&D 5e
    - [ ] Custom
- [ ] Dice roller
- [x] Chat

## Installation
To install the project, you need to have [Node.js](https://nodejs.org/en/) installed. Then you can clone the repository and install the dependencies:
```bash
git clone
cd webrtc-vtt
npm install
```

## Usage
To start the development server, run:
```bash
npm run dev
```
This will start the server on port 5173. You can then access the app at https://localhost:5173.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[GPL-3](LICENSE)

## Acknowledgements
This project is heavily inspired by [Foundry VTT](https://foundryvtt.com/), [Roll20](https://www.roll20.net) and [Owlbear Rodeo](https://owlbear.rodeo)