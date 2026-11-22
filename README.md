# THERMOSCOPE — Interactive Blackbody Radiation Lab

A lightweight, browser-based physics simulation focused on blackbody radiation. The project uses HTML, CSS, and vanilla JavaScript and runs without a backend or external chart library.


## Features
- Overview dashboard
- Live blackbody temperature simulation
- Planck spectrum graph
- Temperature comparison for three sources
- Wien displacement law calculator (including reverse wavelength-to-temperature calculation)
- Stefan–Boltzmann calculator
- Temperature comparison calculator
- Responsive interface

## Run locally
1. Extract the folder.
2. Open `index.html` in a browser. If your browser restricts local ES modules, run it with a local server such as VS Code Live Server.

## Physics modules
- `js/physics.js`: constants and Planck, Wien, Stefan–Boltzmann, spectrum, and color calculations
- `js/chart.js`: dependency-free canvas charts
- `js/simulation.js`: temperature controls and live simulation
- `js/compare.js`: spectrum comparison
- `js/calculator.js`: physics calculators
- `js/navigation.js`: section navigation
- `js/main.js`: app initialization

No experiments, Learn Physics, or quiz sections are included.
