export type Matrix = readonly (readonly number[])[]

function validateMatrix(matrix: Matrix, name: string) {
  const topic = name === '필터' ? '필터는' : `${name}은`
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error(`${topic} 비어 있지 않은 2차원 배열이어야 합니다.`)
  }
  const width = matrix[0]?.length ?? 0
  if (width === 0) throw new Error(`${name}의 행은 비어 있을 수 없습니다.`)
  if (matrix.some((row) => !Array.isArray(row) || row.length !== width)) {
    throw new Error(`${name}의 모든 행 길이는 같아야 합니다.`)
  }
  if (matrix.some((row) => row.some((value: unknown) => typeof value !== 'number' || !Number.isFinite(value)))) {
    throw new Error(`${name}에는 유한한 숫자만 사용할 수 있습니다.`)
  }
  return { rows: matrix.length, columns: width }
}

export function convolveAt(
  input: Matrix,
  kernel: Matrix,
  startRow: number,
  startColumn: number,
): number {
  const inputSize = validateMatrix(input, '입력')
  const kernelSize = validateMatrix(kernel, '필터')
  if (kernelSize.rows > inputSize.rows || kernelSize.columns > inputSize.columns) {
    throw new Error('필터는 입력보다 클 수 없습니다.')
  }
  if (!Number.isInteger(startRow) || !Number.isInteger(startColumn) || startRow < 0 || startColumn < 0) {
    throw new Error('필터 시작 위치는 0 이상의 행·열 정수여야 합니다.')
  }
  if (startRow + kernelSize.rows > inputSize.rows || startColumn + kernelSize.columns > inputSize.columns) {
    throw new Error('선택한 시작 위치에서는 필터가 입력 영역을 벗어납니다.')
  }

  let sum = 0
  for (let row = 0; row < kernelSize.rows; row += 1) {
    for (let column = 0; column < kernelSize.columns; column += 1) {
      sum += input[startRow + row][startColumn + column] * kernel[row][column]
    }
  }
  return sum
}

export function convolve2D(input: Matrix, kernel: Matrix): number[][] {
  const inputSize = validateMatrix(input, '입력')
  const kernelSize = validateMatrix(kernel, '필터')
  if (kernelSize.rows > inputSize.rows || kernelSize.columns > inputSize.columns) {
    throw new Error('필터는 입력보다 클 수 없습니다.')
  }
  const outputRows = inputSize.rows - kernelSize.rows + 1
  const outputColumns = inputSize.columns - kernelSize.columns + 1
  return Array.from({ length: outputRows }, (_, row) =>
    Array.from({ length: outputColumns }, (_, column) => convolveAt(input, kernel, row, column)),
  )
}

export function maxPool2D(input: Matrix, poolSize: number): number[][] {
  const inputSize = validateMatrix(input, '특성 맵')
  if (!Number.isInteger(poolSize) || poolSize <= 0) {
    throw new Error('poolSize는 0보다 큰 정수여야 합니다.')
  }
  if (inputSize.rows % poolSize !== 0 || inputSize.columns % poolSize !== 0) {
    throw new Error('풀링 영역은 입력의 가로·세로 크기를 정확히 나눌 수 있어야 합니다.')
  }

  return Array.from({ length: inputSize.rows / poolSize }, (_, outputRow) =>
    Array.from({ length: inputSize.columns / poolSize }, (_, outputColumn) => {
      let maximum = Number.NEGATIVE_INFINITY
      for (let row = 0; row < poolSize; row += 1) {
        for (let column = 0; column < poolSize; column += 1) {
          maximum = Math.max(
            maximum,
            input[outputRow * poolSize + row][outputColumn * poolSize + column],
          )
        }
      }
      return maximum
    }),
  )
}
