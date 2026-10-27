# Testing & Mutation Standards: Deterministic Verification

## Core Directive
Never assert completion without fresh, concrete verification evidence. A passing test is the baseline; mutation testing proves that the test suite actually catches defects and cannot be satisfied by mock trickery or tautological assertions.

## 1. Mutation Score Thresholds
For high-risk boundaries, code must withstand mutation testing with rigorous survival thresholds:

| Domain Boundary | Mutation Score Target | Rationale |
| :--- | :--- | :--- |
| **Input Sanitization & Zod Schemas** | **$\ge 90\%$** | Malformed payloads, NaN heights, and buffer overflows must fail deterministically. |
| **Binary Serialization & Deserialization (`fflate`)** | **$\ge 90\%$** | Corrupted archives or state bitflips must throw clear validation errors without crashing WebGL. |
| **Terrain Math & State Buffer Transforms** | **$\ge 85\%$** | Brush radii, Gaussian falloffs, height clamping, and boundary clamping must prevent out-of-bounds vertex indexing. |
| **UI State & Tool Transitions** | **$\ge 80\%$** | Active tool switching, mud locking, and palette changes must retain state coherence. |

## 2. The Three External Verification Judges (Non-Negotiable)
Before claiming any feature is complete or opening a PR, the agent must run the three verification judges:

### Judge 1: Frame-Time & GPU Performance Judge (`r3f-perf` + Playwright)
- **Harness:** Run automated Playwright script dragging `Water` and `Side Push` brushes for 120 frames with 10,000 *Halim* grass instances active.
- **Pass Threshold:** `window.__R3F_PERF__.fps >= 55` and frame delta $\le 20\text{ms}$.
- **Evidence Requirement:** Output raw FPS and memory counter log in verification report.

### Judge 2: Binary Compression & Payload Security Judge (Vitest)
- **Harness:** Feed a dirty $256\times256\times4$ state buffer + $1024\times1024$ painted brick canvas + 100 prop transforms into `serializeKilla()`.
- **Pass Threshold:** Output `Uint8Array.byteLength <= 35_000` (35 KB), decompression takes $< 15\text{ms}$, and Zod rejects `props.length > 250` or out-of-bounds coordinates.
- **Evidence Requirement:** Vitest test report with raw byte counts and timing measurements.

### Judge 3: Zero GPU Resource Leak Judge
- **Harness:** Trigger "Roll New Terrain", Spline Extrude, and "Generate Poster" 20 times in an automated test loop.
- **Pass Threshold:** `gl.info.memory.textures` and `gl.info.memory.geometries` return to their exact baseline integer after each reset (`dispose()` calls verified).
- **Evidence Requirement:** Memory counter diff showing zero leaked textures or buffer geometries.

## 3. Test-Driven Development (TDD) Protocol
1. **Red:** Write a failing test specifying the exact behavior before modifying code. Run it and verify the exact expected failure.
2. **Green:** Write the minimal code necessary to make the test pass. Do not add speculative logic.
3. **Refactor:** Clean up duplication and enforce senior dev minimalism while keeping tests green.
4. **Mutate:** Verify that mutating conditionals, boundary signs ($<$ vs $\le$), and arithmetic operators triggers test failures.
