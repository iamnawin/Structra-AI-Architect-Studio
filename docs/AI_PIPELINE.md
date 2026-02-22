# AI Pipeline Stages

The ArchAI pipeline is a multi-stage process that transforms user intent into architectural reality.

## Stage 1: Input Parsing & Intent Extraction
*   **Tool**: Gemini 3.1 Pro.
*   **Input**: Natural language prompt + Structured form data.
*   **Output**: Normalized JSON of architectural requirements.

## Stage 2: Blueprint Vectorization (Optional)
*   **Tool**: Gemini 2.5 Flash Image + OpenCV.
*   **Input**: Raster image of a blueprint.
*   **Process**: Detect lines (walls), openings (doors/windows), and text (room labels).
*   **Output**: GeoJSON-like structure of the floorplan.

## Stage 3: Spatial Planning (The "Architect" Brain)
*   **Tool**: Gemini 3.1 Pro (Function Calling).
*   **Input**: Requirements + Vectorized Blueprint (if any).
*   **Process**: Generate a valid layout that respects setbacks, room adjacencies, and Vastu.
*   **Output**: Refined Vector Floorplan (JSON).

## Stage 4: 3D Geometry Synthesis
*   **Tool**: Procedural script (Node.js/Python).
*   **Input**: Vector Floorplan.
*   **Process**: Extrude walls, place 3D components (furniture, fixtures) from a library.
*   **Output**: glTF model.

## Stage 5: Photorealistic Rendering
*   **Tool**: Gemini 2.5 Flash Image (Image-to-Image / Inpainting).
*   **Input**: 3D Model Screenshot + Style Prompt.
*   **Process**: Apply textures, lighting, and environment.
*   **Output**: 4K Renders.

## Stage 6: VR/AR Export
*   **Tool**: WebXR / Panorama Generator.
*   **Output**: 360-degree stereo panoramas for mobile VR or interactive glTF for desktop.

## Stage 7: Documentation & BOQ
*   **Tool**: Gemini 3.1 Pro.
*   **Input**: Final Design Data.
*   **Process**: Calculate material quantities (concrete, bricks, flooring) and generate a PDF report.
