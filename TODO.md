# SimpleCanvasLibrary TypeScript Port TODO

## Core Library

- [x] Port `GameCanvas` class and main logic
- [x] Port `Sprite` class and logic
- [x] Preserve all JSDoc comments for documentation
- [x] Add type annotations for all parameters and return values

## GameCanvas Methods

- [x] `run`
- [x] `addDrawing`
- [x] `removeDrawing`
- [x] `restoreDrawing`
- [x] `replaceDrawing`
- [x] `addHandler`
- [x] `removeHandler`
- [x] `addClickHandler`
- [x] `removeClickHandler`
- [x] `addResizeHandler`
- [x] `removeResizeHandler`
- [x] `getSize`

## Event Handling

- [x] Mouse events: click, dblclick, mousedown, mousemove, mouseup
- [x] Keyboard events: keyup, keydown, keypress
- [x] Resize observer logic

## Drawing Logic

- [x] Drawing queue and metadata
- [x] Drawing callback parameters: ctx, width, height, elapsed, timestamp, stepTime, remove

## Sprite Features

- [x] Image loading and ready state
- [x] Frame/animation logic
- [x] `copy` method
- [x] Drawing with rotation, frame selection, and animation
- [x] Update callback

## Utility

- [x] Size type
- [x] `testLibrary` function (for demo/testing)

## Documentation

- [x] Preserve all JSDoc comments for HTML doc generation
- [x] Infuse GameCanvas with your original JSDoc: detailed constructor docs, method docs, and embedded examples.
      Add JSDoc to Sprite with original examples.
      Add TypeDoc to generate HTML docs from TS JSDoc.
      Add a docs script and a docs output folder.
      Add a couple of demos beyond basic animation (click handler, resize).

## Demos & Distribution

- [x] Create a `demos/` directory with example demos
  - [x] ✨ NEW: Created automated demo system - each demo is just a JS file and HTML is auto-generated
  - [x] ✨ NEW: Demo source code is displayed alongside the running demo to ensure accuracy
  - [x] ✨ NEW: Demos are generated from `demo-scripts/` directory with metadata in JSDoc comments
- [x] Port and expand `testLibrary` as a demo in `demos/`
- [ ] Set up GitHub Pages for live demos and docs
- [x] Configure build to output a single distributable JS file (for CodePen, etc.)
- [x] Document how to use the library in CodePen/JSFiddle

---

Check off each item as you complete it. Add new features or demos as needed!
