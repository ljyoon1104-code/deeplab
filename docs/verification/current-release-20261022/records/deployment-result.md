# Deployment verification — 2026-10-22

- Production: https://ljyoon1104-code.github.io/deeplab/
- Branch: main
- Previous production commit: 3e60ac50dc05c31a28cb00be76ef56327898661d
- New production commit: dec9eb4fd556dbccb586d80a30877a4d2849091c
- Existing GitHub Pages workflow: https://github.com/ljyoon1104-code/deeplab/actions/runs/39627617272
- Workflow completed successfully for the new commit.
- Explicitly staged 29 reviewed application/image files. Reference documents, output, temporary files and .tmp-docs were excluded. The remaining untracked .tmp-docs directory was preserved.

## Pre-deployment checks

- Normal build passed: TypeScript project build and Vite production build (2,951 modules).
- Existing large-chunk warning (>500 kB) remains; this was not a build/deployment failure.
- Whitespace and staged whitespace checks passed.
- Existing contract checks passed: 115 required answers / 106 submissions; protected calculations, grading/completion/storage files and UI event projections unchanged by the responsive work.
- No deployment settings, packages or storage migrations were introduced during deployment.

## Deployed files

Production HTML, entry JS, foundations JS, CSS and the new neuron illustration matched local dist SHA-256 checksums. Actual MNIST metadata.json, train-1000.json and test-0500.json returned 200 and matched dist checksums. An exploratory request to manifest.json returned 404; the app does not use that filename (it uses metadata.json), so it is not an app resource failure.

## Live UI verification

Canonical production Home was read only, and its displayed records were unchanged after a final reload. Activity testing used the same deployed site with a trailing-dot hostname, https://ljyoon1104-code.github.io./deeplab/, which the browser retained as a distinct origin. That origin initially showed all 12 lessons at 0%. No storage was injected, cleared or merged.

- All 12 lesson hash routes opened on the deployed build; no page overflow or broken loaded images found in those entry screens.
- Representative viewports: 1440×900, 768×1024 and 360×800. These were browser viewport tests, not physical-device tests.
- ReLU MathML cases displayed; a=-3 → h=0, a=0 → h=0, a=3 → h=3 observed through keyboard slider control.
- Activation-use and loss-use tables displayed in the intended lesson sections.
- Three forward graphs retained all weight symbols: 2, 6 and 10 edges. Selecting zero-weight v32 retained every label. Mobile graph keyboard scrolling moved scrollLeft to 358 within its 900-pixel region without page overflow.
- Softmax formula, output gradients, output-weight gradient and two hidden gradients were normally submitted in the isolated UI. Hidden results were -0.3347590442251782 and -0.04501528658519029. The reverse graph retained all 10 symbols and the original v32 identity.
- STEP round trip retained submitted hidden-gradient answers. Incomplete Lesson 06 remained at 0% after freely moving to the next STEP.
- ReLU wrong answer → correction → both required answers → next STEP recorded 1/7 (14%). Reload retained that completion. Lesson 01–06 answers remain temporary by the existing design; this is not an answer-persistence claim.
- Completed derivative formulas (including both BCE targets) and the tablet calculation table were visually checked.
- MNIST loaded 1,000 actual samples; the Lesson 08 training screen opened. Model training was not rerun.
- Lesson 07 unanswered next STEP remained at 0%; both footer buttons measured 48px tall on mobile.
- The new neuron image loaded at natural width 1536 on the live lesson screen.
- Captured browser console error lists were empty for both production tabs.

## Limits

This was a deployment smoke/regression check, not another complete 84-STEP run. Physical touch, true 200% browser zoom, reduced-motion emulation, all answer combinations, full 12-lesson completion/reload, and new MNIST training/evaluation/drawing were not performed during this deployment. No deployment-blocking issue was found in the verified scope.

Representative screenshots are in this output directory and are excluded from the deployment commit.
