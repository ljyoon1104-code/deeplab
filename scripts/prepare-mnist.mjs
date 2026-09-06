import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import {
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SEED = 20260904
const IMAGE_WIDTH = 28
const IMAGE_HEIGHT = 28
const PIXEL_COUNT = IMAGE_WIDTH * IMAGE_HEIGHT
const EXPECTED_SOURCE_COUNTS = { train: 60_000, test: 10_000 }
const TRAIN_PER_CLASS = [50, 100, 200, 500]
const TEST_PER_CLASS = 50
const GENERATION_DATE = '2026-09-06'
const DATASET_VERSION = 'deeplab-mnist-balanced-v1'
const CLASSES = Array.from({ length: 10 }, (_, label) => label)

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')

function parseArguments(argv) {
  const options = {
    train: path.join(projectRoot, 'data-source', 'mnist', 'mnist_train.csv'),
    test: path.join(projectRoot, 'data-source', 'mnist', 'mnist_test.csv'),
    out: path.join(projectRoot, 'public', 'data', 'mnist'),
    generatedOn: GENERATION_DATE,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') {
      printHelp()
      process.exit(0)
    }

    if (!['--train', '--test', '--out', '--generated-on'].includes(argument)) {
      throw new Error(`알 수 없는 인수입니다: ${argument}`)
    }

    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`${argument} 뒤에 값을 입력해야 합니다.`)
    }
    index += 1

    if (argument === '--generated-on') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error('--generated-on은 YYYY-MM-DD 형식이어야 합니다.')
      }
      options.generatedOn = value
    } else {
      options[argument.slice(2)] = path.resolve(process.cwd(), value)
    }
  }

  return options
}

function printHelp() {
  console.log(`MNIST 교육용 subset 생성기

사용법:
  node scripts/prepare-mnist.mjs [옵션]

옵션:
  --train <경로>         원본 Train CSV 경로
  --test <경로>          원본 Test CSV 경로
  --out <경로>           결과 폴더 경로
  --generated-on <날짜>  metadata 생성 일자(YYYY-MM-DD)
  -h, --help             도움말

기본 원본 폴더:
  data-source/mnist/

고정 seed:
  ${SEED}`)
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function classDistribution(samples) {
  const distribution = Object.fromEntries(CLASSES.map((label) => [label, 0]))
  for (const sample of samples) {
    distribution[sample.label] += 1
  }
  return distribution
}

function formatDistribution(distribution) {
  return CLASSES.map((label) => `${label}:${distribution[label]}`).join(', ')
}

function parseInteger(token, context) {
  const normalized = token.trim()
  assert(normalized !== '', `${context}: 빈 값은 허용되지 않습니다.`)
  assert(/^-?\d+$/.test(normalized), `${context}: 정수로 변환할 수 없습니다: "${token}"`)
  const value = Number(normalized)
  assert(Number.isSafeInteger(value), `${context}: 안전한 정수 범위를 벗어났습니다.`)
  return value
}

async function readCsv(csvPath, split) {
  const groups = CLASSES.map(() => [])
  const input = createReadStream(csvPath, { encoding: 'utf8' })
  input.on('error', (error) => {
    input.destroy(error)
  })
  const lines = createInterface({ input, crlfDelay: Infinity })
  let rowNumber = 0

  try {
    for await (const line of lines) {
      rowNumber += 1
      assert(line.trim() !== '', `${split} CSV ${rowNumber}행: 빈 행을 발견했습니다.`)

      const values = line.split(',')
      assert(
        values.length === PIXEL_COUNT + 1,
        `${split} CSV ${rowNumber}행: label 1개와 pixel ${PIXEL_COUNT}개가 필요하지만 필드가 ${values.length}개입니다.`,
      )

      const label = parseInteger(values[0], `${split} CSV ${rowNumber}행 label`)
      assert(
        label >= 0 && label <= 9,
        `${split} CSV ${rowNumber}행: label ${label}은 0~9 범위를 벗어났습니다.`,
      )

      const pixels = new Uint8Array(PIXEL_COUNT)
      for (let pixelIndex = 0; pixelIndex < PIXEL_COUNT; pixelIndex += 1) {
        const pixel = parseInteger(
          values[pixelIndex + 1],
          `${split} CSV ${rowNumber}행 pixel ${pixelIndex}`,
        )
        assert(
          pixel >= 0 && pixel <= 255,
          `${split} CSV ${rowNumber}행 pixel ${pixelIndex}: ${pixel}은 0~255 범위를 벗어났습니다.`,
        )
        pixels[pixelIndex] = pixel
      }

      groups[label].push({
        id: `${split}-${String(rowNumber).padStart(6, '0')}`,
        label,
        pixels,
        split,
      })
    }
  } catch (error) {
    lines.close()
    input.destroy()
    throw error
  }

  assert(
    rowNumber === EXPECTED_SOURCE_COUNTS[split],
    `${split} CSV: ${EXPECTED_SOURCE_COUNTS[split].toLocaleString('en-US')}행을 예상했지만 ${rowNumber.toLocaleString('en-US')}행입니다.`,
  )

  return { groups, count: rowNumber }
}

function createSeededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

function groupSeed(split, label) {
  const splitSalt = split === 'train' ? 0x13579bdf : 0x2468ace0
  return (SEED ^ splitSalt ^ Math.imul(label + 1, 0x9e3779b1)) >>> 0
}

function shuffleGroupOnce(group, split, label) {
  const random = createSeededRandom(groupSeed(split, label))
  for (let index = group.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[group[index], group[swapIndex]] = [group[swapIndex], group[index]]
  }
}

function validateSourceGroups(groups, split, requiredPerClass) {
  assert(groups.length === 10, `${split}: 클래스 그룹이 정확히 10개여야 합니다.`)
  for (const label of CLASSES) {
    const group = groups[label]
    assert(
      group.length >= requiredPerClass,
      `${split}: 숫자 ${label} sample이 ${group.length}개뿐입니다. 최소 ${requiredPerClass}개가 필요합니다.`,
    )
    for (const sample of group) {
      assert(sample.split === split, `${sample.id}: 원본 split 정보가 ${split}과 다릅니다.`)
      assert(sample.label === label, `${sample.id}: 그룹 label과 sample label이 다릅니다.`)
      assert(sample.pixels.length === PIXEL_COUNT, `${sample.id}: pixel 수가 ${PIXEL_COUNT}개가 아닙니다.`)
    }
  }
}

function selectBalanced(groups, perClass) {
  return CLASSES.flatMap((label) => groups[label].slice(0, perClass))
}

function validateSelectedSamples(samples, { split, count, perClass, fileName }) {
  assert(samples.length === count, `${fileName}: sample 수가 ${count}개가 아닙니다.`)
  const ids = new Set()
  const distribution = classDistribution(samples)

  for (const sample of samples) {
    assert(sample.split === split, `${fileName}: ${sample.id}의 원본 split이 ${split}이 아닙니다.`)
    assert(sample.id.startsWith(`${split}-`), `${fileName}: ${sample.id}의 ID split 접두사가 잘못되었습니다.`)
    assert(!ids.has(sample.id), `${fileName}: 중복 ID ${sample.id}를 발견했습니다.`)
    ids.add(sample.id)
    assert(sample.label >= 0 && sample.label <= 9, `${fileName}: label 범위를 벗어났습니다.`)
    assert(sample.pixels.length === PIXEL_COUNT, `${fileName}: ${sample.id}의 pixel 수가 잘못되었습니다.`)
    for (const pixel of sample.pixels) {
      assert(Number.isInteger(pixel), `${fileName}: ${sample.id}에 정수가 아닌 pixel이 있습니다.`)
      assert(pixel >= 0 && pixel <= 255, `${fileName}: ${sample.id}에 범위를 벗어난 pixel이 있습니다.`)
    }
  }

  for (const label of CLASSES) {
    assert(
      distribution[label] === perClass,
      `${fileName}: 숫자 ${label}가 ${distribution[label]}개입니다. ${perClass}개여야 합니다.`,
    )
  }

  return { ids, distribution }
}

function validateNestedSelections(trainSelections) {
  for (let index = 0; index < TRAIN_PER_CLASS.length - 1; index += 1) {
    const smallerCount = TRAIN_PER_CLASS[index] * 10
    const largerCount = TRAIN_PER_CLASS[index + 1] * 10
    const largerIds = new Set(trainSelections.get(largerCount).map((sample) => sample.id))
    for (const sample of trainSelections.get(smallerCount)) {
      assert(
        largerIds.has(sample.id),
        `Train subset 포함 관계 오류: ${sample.id}가 train-${String(largerCount).padStart(4, '0')}에 없습니다.`,
      )
    }
  }
}

function validateTrainTestSeparation(trainSamples, testSamples) {
  const trainIds = new Set(trainSamples.map((sample) => sample.id))
  for (const sample of testSamples) {
    assert(!trainIds.has(sample.id), `Train과 Test에 같은 ID ${sample.id}가 있습니다.`)
    assert(sample.split === 'test', `${sample.id}: Test sample의 원본 split 정보가 잘못되었습니다.`)
  }
}

function datasetJson(split, samples) {
  return {
    dataset: 'MNIST',
    split,
    count: samples.length,
    imageWidth: IMAGE_WIDTH,
    imageHeight: IMAGE_HEIGHT,
    pixelRange: [0, 255],
    samples: samples.map((sample) => ({
      id: sample.id,
      label: sample.label,
      pixels: Array.from(sample.pixels),
    })),
  }
}

async function writeAtomic(filePath, content) {
  const temporaryPath = `${filePath}.tmp`
  try {
    await writeFile(temporaryPath, content, 'utf8')
    await rm(filePath, { force: true })
    await rename(temporaryPath, filePath)
  } catch (error) {
    await rm(temporaryPath, { force: true })
    throw error
  }
}

async function sha256(filePath) {
  const hash = createHash('sha256')
  const input = createReadStream(filePath)
  for await (const chunk of input) {
    hash.update(chunk)
  }
  return hash.digest('hex')
}

function createMetadata({ trainSource, testSource, fileReports, sourceHashes, generatedOn }) {
  return {
    datasetName: 'MNIST Handwritten Digit Database',
    datasetVersion: DATASET_VERSION,
    image: {
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      pixelCount: PIXEL_COUNT,
    },
    classes: CLASSES,
    original: {
      train: {
        count: trainSource.count,
        classDistribution: classDistribution(trainSource.groups.flat()),
      },
      test: {
        count: testSource.count,
        classDistribution: classDistribution(testSource.groups.flat()),
      },
    },
    availableTrainSubsets: TRAIN_PER_CLASS.map((perClass) => perClass * 10),
    testSubsetCount: TEST_PER_CLASS * 10,
    pixelRange: [0, 255],
    pixelStorage: '원본 0~255 정수값, 정규화하지 않음',
    seed: SEED,
    files: Object.fromEntries(
      fileReports.map((report) => [
        report.fileName,
        {
          split: report.split,
          sampleCount: report.count,
          classDistribution: report.distribution,
        },
      ]),
    ),
    nestedSubsetMethod:
      '원본 Train을 숫자 0~9로 그룹화하고 각 그룹을 고정 seed로 한 번만 Fisher-Yates shuffle한 뒤, 그룹별 앞 50/100/200/500개를 사용한다. 따라서 작은 Train subset의 모든 sample은 큰 subset에 포함된다.',
    testSubsetMethod:
      '원본 Test를 숫자 0~9로 그룹화하고 Train과 독립적으로 고정 seed shuffle한 뒤 각 숫자의 앞 50개를 사용한다.',
    sources: {
      originalDataset: {
        name: 'MNIST Handwritten Digit Database',
        creators: ['Yann LeCun', 'Corinna Cortes', 'Christopher J. C. Burges'],
        note: 'Derived from NIST handwritten digit datasets',
      },
      csvConversion: {
        converter: 'Joseph Redmon',
        name: 'MNIST in CSV',
        sourcePage: 'https://pjreddie.com/projects/mnist-in-csv/',
        trainUrl: 'https://data.pjreddie.com/files/mnist_train.csv',
        testUrl: 'https://data.pjreddie.com/files/mnist_test.csv',
      },
      downloadedFiles: {
        train: {
          fileName: path.basename(sourceHashes.train.path),
          sha256: sourceHashes.train.sha256,
        },
        test: {
          fileName: path.basename(sourceHashes.test.path),
          sha256: sourceHashes.test.sha256,
        },
      },
    },
    generationDate: generatedOn,
  }
}

function createSourceDocument() {
  return `# MNIST 데이터 출처

## Dataset

MNIST Handwritten Digit Database

## Original dataset

- Yann LeCun
- Corinna Cortes
- Christopher J. C. Burges
- Derived from NIST handwritten digit datasets

## CSV conversion

- Joseph Redmon
- MNIST in CSV

## Source page

https://pjreddie.com/projects/mnist-in-csv/

원본 CSV 다운로드:

- Train: https://data.pjreddie.com/files/mnist_train.csv
- Test: https://data.pjreddie.com/files/mnist_test.csv

## Educational subset

Deep Learning Lab에서 웹 실습을 위해 원본 Train과 Test에서 숫자 0~9를 균형 있게 추출한 교육용 subset입니다.

- 원본 Train과 원본 Test를 합치거나 다시 분할하지 않았습니다.
- Train은 숫자별 50/100/200/500개를 사용하여 500/1,000/2,000/5,000개 subset을 만들었습니다.
- Test는 원본 Test에서 숫자별 50개, 총 500개를 사용했습니다.
- 고정 seed ${SEED}로 클래스별 Fisher-Yates shuffle을 한 번만 수행하고 앞부분을 사용했습니다.
- JSON의 pixel은 정규화하지 않은 원본 0~255 정수입니다.
- Kaggle 배포본이나 Kaggle API는 사용하지 않았습니다.
`
}

function validateGeneratedDataset(data, expected) {
  assert(data.dataset === 'MNIST', `${expected.fileName}: dataset 값이 MNIST가 아닙니다.`)
  assert(data.split === expected.split, `${expected.fileName}: split 값이 잘못되었습니다.`)
  assert(data.count === expected.count, `${expected.fileName}: count 값이 잘못되었습니다.`)
  assert(data.imageWidth === IMAGE_WIDTH, `${expected.fileName}: imageWidth가 잘못되었습니다.`)
  assert(data.imageHeight === IMAGE_HEIGHT, `${expected.fileName}: imageHeight가 잘못되었습니다.`)
  assert(
    Array.isArray(data.pixelRange) && data.pixelRange[0] === 0 && data.pixelRange[1] === 255,
    `${expected.fileName}: pixelRange가 잘못되었습니다.`,
  )
  assert(Array.isArray(data.samples), `${expected.fileName}: samples가 배열이 아닙니다.`)
  assert(data.samples.length === expected.count, `${expected.fileName}: samples 길이가 잘못되었습니다.`)

  const ids = new Set()
  const distribution = Object.fromEntries(CLASSES.map((label) => [label, 0]))
  for (let index = 0; index < data.samples.length; index += 1) {
    const sample = data.samples[index]
    assert(sample && typeof sample === 'object', `${expected.fileName}: sample ${index}가 객체가 아닙니다.`)
    assert(
      typeof sample.id === 'string' && new RegExp(`^${expected.split}-\\d{6}$`).test(sample.id),
      `${expected.fileName}: sample ${index}의 ID 형식이 잘못되었습니다.`,
    )
    assert(!ids.has(sample.id), `${expected.fileName}: 중복 ID ${sample.id}를 발견했습니다.`)
    ids.add(sample.id)
    assert(
      Number.isInteger(sample.label) && sample.label >= 0 && sample.label <= 9,
      `${expected.fileName}: ${sample.id}의 label이 0~9 정수가 아닙니다.`,
    )
    distribution[sample.label] += 1
    assert(
      Array.isArray(sample.pixels) && sample.pixels.length === PIXEL_COUNT,
      `${expected.fileName}: ${sample.id}의 pixels 길이가 ${PIXEL_COUNT}가 아닙니다.`,
    )
    for (const pixel of sample.pixels) {
      assert(
        Number.isInteger(pixel) && pixel >= 0 && pixel <= 255,
        `${expected.fileName}: ${sample.id}에 0~255 정수가 아닌 pixel이 있습니다.`,
      )
    }
  }

  for (const label of CLASSES) {
    assert(
      distribution[label] === expected.perClass,
      `${expected.fileName}: 숫자 ${label} 분포가 ${expected.perClass}개가 아닙니다.`,
    )
  }
  return { ids, distribution }
}

function assertSamplesEqual(left, right, context) {
  assert(left.label === right.label, `${context}: 같은 ID의 label이 다릅니다.`)
  assert(left.pixels.length === right.pixels.length, `${context}: 같은 ID의 pixels 길이가 다릅니다.`)
  for (let index = 0; index < left.pixels.length; index += 1) {
    assert(left.pixels[index] === right.pixels[index], `${context}: 같은 ID의 pixel 값이 다릅니다.`)
  }
}

async function verifyWrittenFiles(outputDirectory, outputSpecifications) {
  const largestSpecification = outputSpecifications.find(
    (specification) => specification.fileName === 'train-5000.json',
  )
  const largestData = JSON.parse(
    await readFile(path.join(outputDirectory, largestSpecification.fileName), 'utf8'),
  )
  const largestValidation = validateGeneratedDataset(largestData, largestSpecification)
  const largestSamples = new Map(largestData.samples.map((sample) => [sample.id, sample]))

  const verificationReports = []
  for (const specification of outputSpecifications) {
    const filePath = path.join(outputDirectory, specification.fileName)
    const data =
      specification.fileName === largestSpecification.fileName
        ? largestData
        : JSON.parse(await readFile(filePath, 'utf8'))
    const validation =
      specification.fileName === largestSpecification.fileName
        ? largestValidation
        : validateGeneratedDataset(data, specification)

    if (specification.split === 'train') {
      for (const sample of data.samples) {
        const largestSample = largestSamples.get(sample.id)
        assert(
          largestSample,
          `${specification.fileName}: ${sample.id}가 train-5000.json에 포함되지 않았습니다.`,
        )
        assertSamplesEqual(sample, largestSample, `${specification.fileName}의 ${sample.id}`)
      }
    } else {
      for (const id of validation.ids) {
        assert(!largestValidation.ids.has(id), `Train과 Test 출력에 같은 ID ${id}가 있습니다.`)
      }
    }

    const fileStat = await stat(filePath)
    verificationReports.push({
      ...specification,
      distribution: validation.distribution,
      sizeBytes: fileStat.size,
    })
  }

  return verificationReports
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  console.log('[1/5] 원본 CSV 구조와 값을 검사합니다.')

  const [trainSource, testSource, trainHash, testHash] = await Promise.all([
    readCsv(options.train, 'train'),
    readCsv(options.test, 'test'),
    sha256(options.train),
    sha256(options.test),
  ])

  validateSourceGroups(trainSource.groups, 'train', Math.max(...TRAIN_PER_CLASS))
  validateSourceGroups(testSource.groups, 'test', TEST_PER_CLASS)
  console.log(
    `  Train ${trainSource.count.toLocaleString('en-US')}개 | ${formatDistribution(classDistribution(trainSource.groups.flat()))}`,
  )
  console.log(
    `  Test  ${testSource.count.toLocaleString('en-US')}개 | ${formatDistribution(classDistribution(testSource.groups.flat()))}`,
  )

  console.log('[2/5] 숫자별 그룹을 고정 seed로 한 번씩 섞습니다.')
  for (const label of CLASSES) {
    shuffleGroupOnce(trainSource.groups[label], 'train', label)
    shuffleGroupOnce(testSource.groups[label], 'test', label)
  }

  const trainSelections = new Map(
    TRAIN_PER_CLASS.map((perClass) => [perClass * 10, selectBalanced(trainSource.groups, perClass)]),
  )
  const testSelection = selectBalanced(testSource.groups, TEST_PER_CLASS)

  const outputSpecifications = [
    ...TRAIN_PER_CLASS.map((perClass) => ({
      fileName: `train-${String(perClass * 10).padStart(4, '0')}.json`,
      split: 'train',
      count: perClass * 10,
      perClass,
      samples: trainSelections.get(perClass * 10),
    })),
    {
      fileName: 'test-0500.json',
      split: 'test',
      count: TEST_PER_CLASS * 10,
      perClass: TEST_PER_CLASS,
      samples: testSelection,
    },
  ]

  console.log('[3/5] 선택 결과의 균형, split과 포함 관계를 검사합니다.')
  const initialReports = outputSpecifications.map((specification) => {
    const validation = validateSelectedSamples(specification.samples, specification)
    return { ...specification, distribution: validation.distribution }
  })
  validateNestedSelections(trainSelections)
  validateTrainTestSeparation(trainSelections.get(5_000), testSelection)

  console.log('[4/5] 배포용 JSON과 출처 문서를 생성합니다.')
  await mkdir(options.out, { recursive: true })
  for (const specification of outputSpecifications) {
    const filePath = path.join(options.out, specification.fileName)
    await writeAtomic(filePath, JSON.stringify(datasetJson(specification.split, specification.samples)))
  }

  const metadata = createMetadata({
    trainSource,
    testSource,
    fileReports: initialReports,
    sourceHashes: {
      train: { path: options.train, sha256: trainHash },
      test: { path: options.test, sha256: testHash },
    },
    generatedOn: options.generatedOn,
  })
  await writeAtomic(path.join(options.out, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  await writeAtomic(path.join(options.out, 'SOURCE.md'), createSourceDocument())

  console.log('[5/5] 생성된 파일을 다시 읽어 무결성을 확인합니다.')
  const verificationReports = await verifyWrittenFiles(options.out, outputSpecifications)
  const supportingFiles = await Promise.all(
    ['metadata.json', 'SOURCE.md'].map(async (fileName) => ({
      fileName,
      sizeBytes: (await stat(path.join(options.out, fileName))).size,
    })),
  )

  console.log('\nMNIST 교육용 subset 준비 완료')
  console.log(`고정 seed: ${SEED}`)
  for (const report of verificationReports) {
    console.log(
      `${report.fileName}: ${report.count.toLocaleString('en-US')}개 | ${formatDistribution(report.distribution)} | ${report.sizeBytes.toLocaleString('en-US')} bytes`,
    )
  }
  for (const report of supportingFiles) {
    console.log(`${report.fileName}: ${report.sizeBytes.toLocaleString('en-US')} bytes`)
  }
  console.log('검사 통과: label, pixels, ID 중복, split 분리, nested 포함 관계, 동일 ID 내용 일치')
}

main().catch((error) => {
  console.error(`\n[MNIST 준비 실패] ${error.message}`)
  process.exitCode = 1
})
