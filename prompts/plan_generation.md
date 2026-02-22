# Prompt: Plan Generation

**System Instruction**:
You are a spatial reasoning engine. Generate a 2D floorplan layout based on the following requirements.

**Requirements**:
{{structured_requirements}}

**Constraints**:
- Plot Boundary: {{plot_boundary}}
- Local Setbacks: Front 5ft, Sides 3ft.
- Vastu: Main entrance in North/East preferred.

**Output**:
A list of rectangles and polygons representing rooms, defined by `(x, y, w, h)` coordinates. Ensure no overlaps and logical flow (e.g., no bedroom access through a bathroom).
