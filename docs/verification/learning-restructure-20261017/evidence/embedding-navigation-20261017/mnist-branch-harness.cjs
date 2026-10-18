/* Controlled branch tests, not browser QA or measured MNIST model accuracy.
 * Product modules are compiled in memory, never rewritten. No browser storage,
 * network, package installation, model training, or user records are accessed.
 * React SSR checks real JSX; a minimal hook adapter checks handler/state branches.
 * It does not reproduce React DOM, effect scheduling, StrictMode, or GPU behavior.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '../..');
const results = [];

function load(relative, overrides = {}) {
  const filename = path.join(root, relative);
  const { outputText, diagnostics } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  assert.equal(diagnostics.filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} };
  const localRequire = (id) => {
    if (Object.hasOwn(overrides, id)) return overrides[id];
    if (!id.startsWith('.')) return require(id);
    const base = path.resolve(path.dirname(filename), id);
    const file = ['.ts', '.tsx'].map(extension => base + extension).find(fs.existsSync);
    if (!file) throw new Error(`Unexpected import in controlled test: ${id}`);
    return load(path.relative(root, file), overrides);
  };
  const readOnlyStorage = { getItem: () => null, setItem: () => { throw new Error('Storage writes are prohibited'); }, removeItem: () => { throw new Error('Storage deletion is prohibited'); } };
  new Function('require', 'module', 'exports', 'window', 'localStorage', outputText)(
    localRequire, module, module.exports,
    { setInterval, clearInterval }, readOnlyStorage,
  );
  return module.exports;
}

function hooks() {
  const slots = [];
  let cursor = 0;
  return {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
        return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
      },
      useRef(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = { current: initial };
        return slots[index];
      },
      useCallback: callback => callback,
      useMemo: calculate => calculate(),
      useEffect: () => {},
    },
    render(component, props) { cursor = 0; return component(props); },
  };
}

const textOf = node => node == null || typeof node === 'boolean' ? '' : Array.isArray(node) ? node.map(textOf).join('') : typeof node === 'object' ? textOf(node.props?.children) : String(node);
function descendants(node, predicate, found = []) {
  if (!node || typeof node !== 'object') return found;
  if (Array.isArray(node)) { node.forEach(child => descendants(child, predicate, found)); return found; }
  if (predicate(node)) found.push(node);
  descendants(node.props?.children, predicate, found);
  return found;
}
function button(tree, label) {
  const matches = descendants(tree, node => (node.type === 'button' || node.type?.name === 'Button') && textOf(node).trim() === label);
  assert.equal(matches.length, 1, `Unique button: ${label}`);
  return matches[0];
}
const NullComponent = () => null;
function steps(lab, react = React) {
  return load('src/lessons/lesson08/Lesson08Steps.tsx', {
    react,
    './Lesson08Context': { useLesson08Lab: () => lab() },
    '../lesson07/MnistCanvas': { MnistCanvas: NullComponent },
    './DrawingCanvas': { default: NullComponent },
    './TrainingMetricChart': { default: NullComponent },
  });
}

async function providerRetry(failureKind) {
  const adapter = hooks();
  let fail = failureKind;
  let saved = [];
  let disposedTensors = 0, disposedModels = 0, disposedOptimizers = 0;
  const maybeFail = name => { if (fail === name) throw new Error(`controlled-${name}-failure`); };
  const fakeEngine = {
    loadTensorFlow: async () => { maybeFail('engine'); return { getBackend: () => 'controlled-fixture', nextFrame: async () => {} }; },
    createTrainingTensors: () => {
      maybeFail('conversion');
      return { trainXs: { dispose: () => disposedTensors++ }, trainYs: { dispose: () => disposedTensors++ } };
    },
    createTrainableModel: () => {
      maybeFail('model');
      return { model: { dispose: () => disposedModels++, stopTraining: false }, optimizer: { dispose: () => disposedOptimizers++ } };
    },
    fitModel: async (_tf, _model, _xs, _ys, epochs, onBatch, onEpoch) => {
      maybeFail('training');
      return Array.from({ length: epochs }, (_, index) => {
        const metric = { epoch: index + 1, loss: 2, accuracy: 0.1 };
        onBatch({ currentEpoch: index + 1, batchInEpoch: 1, batchesPerEpoch: 1, completedBatches: index + 1, totalBatches: epochs, loss: 2, accuracy: 0.1 });
        onEpoch(metric);
        return metric;
      });
    },
  };
  const { Lesson08LabProvider } = load('src/lessons/lesson08/Lesson08Context.tsx', {
    react: adapter.react,
    '../lesson07/mnistLoader': {
      isMnistDatasetSize: value => [500, 1000, 2000, 5000].includes(value),
      loadMnistDataset: async () => { maybeFail('data'); return { count: 1, samples: [] }; },
      loadMnistMetadata: async () => ({ datasetVersion: 'CONTROLLED-NOT-MNIST' }),
    },
    './experimentStorage': {
      loadExperimentRecords: () => saved,
      saveExperimentRecord: record => { saved = [record, ...saved.filter(item => item.id !== record.id)]; return saved; },
    },
    './mnistTestLoader': { loadMnistTestDataset: async () => { throw new Error('No real evaluation in provider fixture'); } },
    './mnistTrainingEngine': fakeEngine,
  });
  const current = () => adapter.render(Lesson08LabProvider, { children: null }).props.value;
  await current().startTraining();
  let lab = current();
  assert.equal(lab.status, 'error');
  assert.equal(lab.error.kind, failureKind === 'conversion' ? 'training' : failureKind);
  assert.match(lab.error.detail, /controlled-/);
  assert.equal(lab.isBusy, false);
  assert.equal(lab.modelReady, false);
  assert.equal(lab.trainingResult, null);
  assert.equal(saved.length, 0, 'Failed attempt must not create experiment');
  const errorStep = steps(() => lab).Lesson08Step2({ active: true, isComplete: false, onComplete: () => assert.fail('No completion in error state') });
  assert.equal(button(errorStep, '실제 모델 학습 시작').props.disabled, false);
  assert.match(renderToStaticMarkup(errorStep), /role="alert"/);
  const cleanupAfterFailure = { disposedTensors, disposedModels, disposedOptimizers };
  if (['model','training'].includes(failureKind)) assert.equal(disposedTensors, 2);
  if (failureKind === 'training') { assert.equal(disposedModels, 1); assert.equal(disposedOptimizers, 1); }
  fail = null;
  await current().startTraining();
  lab = current();
  assert.equal(lab.status, 'trained');
  assert.equal(lab.error, null);
  assert.equal(lab.isBusy, false);
  assert.equal(lab.modelReady, true);
  assert.equal(lab.trainingResult.completedEpochs, lab.epochs);
  assert.equal(saved.length, 1, 'Only successful retry writes the isolated in-memory fixture record');
  assert.equal(lab.trainingResult.backend, 'controlled-fixture');
  results.push({ test: `Provider ${failureKind} failure → retry`, outcome: 'pass', errorButton: 'enabled', failedRecordCount: 0, retryRecordCount: saved.length, cleanupAfterFailure, boundary: 'actual Provider/STEP 2 code; custom hooks and injected fake dependencies, no actual training' });
}

async function engineChecks() {
  let imports = 0;
  const fakeTensorflow = { ready: async () => { if (++imports === 1) throw new Error('controlled-engine-ready-failure'); } };
  const cachingEngine = load('src/lessons/lesson08/mnistTrainingEngine.ts', { '@tensorflow/tfjs': fakeTensorflow });
  await assert.rejects(cachingEngine.loadTensorFlow(), /controlled-engine-ready-failure/);
  await cachingEngine.loadTensorFlow();
  await cachingEngine.loadTensorFlow();
  assert.equal(imports, 2, 'Failed promise reset, successful promise cached');
  results.push({ test: 'Actual loadTensorFlow promise retry/cache', outcome: 'pass', readyAttempts: imports });

  const engine = load('src/lessons/lesson08/mnistTrainingEngine.ts');
  let badLogs = true;
  const fitFixture = { fit: async (_xs, _ys, options) => {
    options.callbacks.onEpochBegin(0);
    await options.callbacks.onBatchEnd(0, { loss: badLogs ? NaN : 2, acc: 0.1 });
    await options.callbacks.onEpochEnd(0, { loss: 2, acc: 0.1 });
  } };
  await assert.rejects(engine.fitModel({ nextFrame: async () => {} }, fitFixture, { shape: [2, 784] }, {}, 1, () => {}, () => {}), /유한한 숫자/);
  badLogs = false;
  const history = await engine.fitModel({ nextFrame: async () => {} }, fitFixture, { shape: [2, 784] }, {}, 1, () => {}, () => {});
  assert.equal(history.length, 1);
  results.push({ test: 'Actual fitModel rejects invalid metrics and accepts fresh valid invocation', outcome: 'pass', boundary: 'fit callback fixture, not model training' });

  const tf = require('@tensorflow/tfjs');
  await tf.setBackend('cpu');
  await tf.ready();
  const tensorCount = tf.memory().numTensors;
  const samples = [0, 1].map(label => ({ id: `UNIT-TEST-${label}`, label, pixels: Array(784).fill(label * 255) }));
  let badShape = true;
  const predictionFixture = { predict: () => tf.tensor2d(badShape ? [[1]] : samples.map(sample => Array.from({ length: 10 }, (_, digit) => digit === sample.label ? 1 : 0))) };
  await assert.rejects(engine.evaluateModel(tf, predictionFixture, samples), /shape/);
  assert.equal(tf.memory().numTensors, tensorCount, 'Evaluation failure disposes input/output');
  badShape = false;
  const evaluation = await engine.evaluateModel(tf, predictionFixture, samples);
  assert.equal(evaluation.wrong, 0);
  assert.equal(evaluation.correct, 2);
  assert.equal(evaluation.sampleCount, 2);
  assert.equal(tf.memory().numTensors, tensorCount, 'Evaluation success disposes input/output');
  results.push({ test: 'Actual evaluateModel error → valid zero-error fixture and Tensor cleanup', outcome: 'pass', samples: 2, wrong: 0, boundary: 'synthetic two-sample prediction fixture with real TF CPU tensors, NOT a trained model or MNIST accuracy' });
  return evaluation;
}

function zeroErrorComponent(evaluation) {
  // First render uses actual React hooks + actual React SSR.
  const lab = { evaluation, modelReady: true };
  const component = steps(() => lab).Lesson08Step5;
  const initialHtml = renderToStaticMarkup(React.createElement(component, { active: true, isComplete: false, onComplete: () => {} }));
  assert.match(initialHtml, /이번 실제 테스트에서는 오분류가 없었습니다/);
  assert.match(initialHtml, /가짜 오분류를 만들지 않습니다/);
  assert.doesNotMatch(initialHtml, /AI는 왜 이 숫자를 헷갈렸을까요/);
  assert.match(initialHtml, /disabled=""[^>]*>STEP 5 활동 완료/);

  // Then execute actual checkbox/click handlers with isolated in-memory hook slots.
  const adapter = hooks();
  const hookedComponent = steps(() => lab, adapter.react).Lesson08Step5;
  let completions = 0;
  const render = () => adapter.render(hookedComponent, { active: true, isComplete: false, onComplete: () => completions++ });
  let tree = render();
  assert.equal(button(tree, 'STEP 5 활동 완료').props.disabled, true);
  let checkbox = descendants(tree, node => node.type === 'input' && node.props.type === 'checkbox');
  assert.equal(checkbox.length, 1);
  checkbox[0].props.onChange({ target: { checked: true } });
  tree = render();
  assert.equal(button(tree, 'STEP 5 활동 완료').props.disabled, false);
  assert.equal(completions, 0, 'Checkbox itself must not complete');
  button(tree, 'STEP 5 활동 완료').props.onClick();
  assert.equal(completions, 1);
  descendants(tree, node => node.type === 'input' && node.props.type === 'checkbox')[0].props.onChange({ target: { checked: false } });
  tree = render();
  assert.equal(button(tree, 'STEP 5 활동 완료').props.disabled, true);
  assert.equal(completions, 1, 'Unchecking does not erase earlier completion');
  results.push({ test: 'Actual STEP 5 zero-error JSX + confirmation/finish handlers', outcome: 'pass', actualReactSSR: true, confirmRequired: true, automaticCompletion: false, boundary: 'synthetic fixture; state transition via custom hook adapter, not browser interaction/layout' });
}

(async () => {
  for (const kind of ['data', 'engine', 'conversion', 'model', 'training']) await providerRetry(kind);
  const evaluation = await engineChecks();
  zeroErrorComponent(evaluation);
  console.log(JSON.stringify({ label: 'CONTROLLED TESTS ONLY — not live MNIST results', results, untouched: ['product source', 'browser origins', 'localStorage', 'existing experiments', 'packages/config'] }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
