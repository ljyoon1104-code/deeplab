import { useEffect, useState } from 'react'
import { ArrowDown, DoorClosed, Factory, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { GENERATION_CATEGORIES } from './lesson10Data'

const petSource = `${import.meta.env.BASE_URL}images/lesson09/pets-source-v1.png`
let brightnessPreview: Promise<string> | undefined

// 원본 RGB에 고정 연산만 적용합니다. 모델 실행이나 생성 결과가 아닙니다.
function loadBrightnessPreview() {
  if (!brightnessPreview) {
    brightnessPreview = new Promise<string>((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = image.naturalWidth
          canvas.height = image.naturalHeight
          const context = canvas.getContext('2d')
          if (!context) throw new Error('이미지를 처리할 Canvas를 준비하지 못했습니다.')
          context.drawImage(image, 0, 0)
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
          for (let i = 0; i < pixels.data.length; i += 4) {
            for (let channel = 0; channel < 3; channel++) {
              pixels.data[i + channel] = Math.min(255, pixels.data[i + channel] + 40)
            }
          }
          context.putImageData(pixels, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } catch (error) { reject(error) }
      }
      image.onerror = () => reject(new Error('동물 사진을 불러오지 못했습니다.'))
      image.src = petSource
    }).catch(error => { brightnessPreview = undefined; throw error })
  }
  return brightnessPreview
}

export function GenerationPhotoComparison({ active }: { active: boolean }) {
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!active) return
    let ignore = false
    loadBrightnessPreview().then(value => { if (!ignore) setResult(value) }).catch(reason => {
      if (!ignore) setError(reason instanceof Error ? reason.message : '사진 처리를 마치지 못했습니다.')
    })
    return () => { ignore = true }
  }, [active, attempt])

  return <section className="mt-5 rounded-2xl border border-slate-200 p-4 sm:p-5" aria-label="동물 사진으로 비교하는 세 동작">
    <h3 className="font-black">안내 예 · 무엇을 입력받아 어떤 결과를 만들까요?</h3>
    <figure className="mt-3 grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <img src={petSource} alt="큰 고양이와 작은 고양이, 강아지가 함께 있는 설명용 생성 이미지" className="w-full rounded-xl" />
      <figcaption className="text-sm leading-6">Lesson 09의 <strong>사전에 AI로 제작한 설명용 이미지</strong>입니다. 앱에서 방금 생성했거나 실제 GAN을 학습한 결과가 아닙니다. 아래에서 입력과 결과의 차이를 비교하세요.</figcaption>
    </figure>
    <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
      {GENERATION_CATEGORIES.map((category, index) => <article key={category.id} className="min-w-0 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <h4 className="font-black">{index + 1}. {category.label}</h4>
        <p className="mt-2 text-sm leading-6">{category.detail}</p>
        <p className="mt-3 rounded-lg bg-white p-3 text-sm"><strong>입력</strong><br />{index === 1 ? '“고양이 두 마리와 강아지가 함께 있는 새 그림을 만들어 줘.”라는 설명' : '위의 동물 사진'}</p>
        <ArrowDown className="mx-auto my-2 text-violet-600" aria-hidden="true" />
        {index === 0 ? <div className="rounded-lg bg-white p-3"><p className="font-bold">결과 예: 고양이가 포함됨</p><p className="mt-2 text-sm leading-6">사진의 상태를 판단합니다. 사진에는 여러 동물이 있으므로 여기서는 <strong>고양이 포함 여부</strong>만 묻습니다. 모델을 실행한 결과가 아닌 안내 답입니다.</p></div>
          : index === 1 ? <div className="rounded-lg bg-white p-3"><p className="font-bold">결과 형태: 새로운 그림</p><p className="mt-2 text-sm leading-6">설명에 맞춰 학습한 패턴으로 그림을 구성합니다. 위 공통 사진은 이런 결과의 예입니다.</p></div>
            : <div className="rounded-lg bg-white p-3">{result ? <img src={result} alt="원본의 각 RGB 값에 40을 더하고 255로 제한한 실제 밝기 변환 결과" className="w-full rounded-lg" /> : <p role="status" className="text-sm leading-6">{error || '원본 사진의 픽셀 밝기를 계산하는 중…'}</p>}{error && <Button className="mt-2" variant="secondary" onClick={() => { setError(''); setAttempt(value => value + 1) }}>사진 다시 불러오기</Button>}<p className="mt-2 text-sm leading-6">결과: RGB 각 값에 40을 더하되 255를 넘지 않게 합니다. 위치·크기·투명도는 유지합니다. <strong>실제 픽셀 연산</strong>이지만, 새 내용을 구성하는 모델은 사용하지 않습니다.</p></div>}
      </article>)}
    </div>
    <p className="mt-4 text-sm leading-6">GAN은 생성형 AI를 구현하는 방법 중 하나입니다. 모든 생성형 AI가 GAN은 아닙니다. 이제 아래 아홉 사례에서 <strong>지정한 동작만</strong> 분류하세요.</p>
  </section>
}

export function SpeechCandidateClues({ selected, correct }: { selected: string; correct: boolean }) {
  return <div className="mb-4 grid gap-3 text-sm leading-6" aria-label="문장 후보에 연결되는 단서">
    <div className="grid items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 sm:grid-cols-[auto_1fr]">
      <DoorClosed size={48} className="text-cyan-800" aria-hidden="true" />
      <p><strong>같은 예시, 이번에는 일부가 불분명합니다.</strong><br />엘리베이터 문이 닫히기 직전입니다. 글로 나타낸 소리 단서: “문이 <span className="rounded border-2 border-dashed border-amber-600 px-1">[불분명]</span>니다.”</p>
    </div>
    <dl className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-200 p-3"><dt className="font-bold">① 소리에서 얻는 단서</dt><dd>길이·높낮이·시간에 따른 변화. 여기서는 실제 녹음을 분석하지 않습니다.</dd></div>
      <div className={`rounded-lg border p-3 ${selected ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}><dt className="font-bold">② 주변 문맥 {selected && '· 선택 후보와 대조'}</dt><dd>문이 움직이는 상황과 앞뒤 말 “문이 …니다”를 선택한 동작의 의미와 함께 살펴보세요.</dd></div>
      <div className="rounded-lg border-2 border-dashed border-amber-600 bg-amber-50 p-3"><dt className="font-bold">③ 불확실한 부분</dt><dd>소음 때문에 동작을 나타내는 소리가 불분명합니다. 문맥이 있어도 언제나 복원할 수 있는 것은 아닙니다.</dd></div>
    </dl>
    <p className="rounded-lg bg-slate-100 p-3" aria-live="polite">{selected ? <>{correct ? '✓ 정답으로 제출한 후보:' : '선택 후보:'} <strong>{selected === 'close' ? '문이 닫힙니다.' : '문이 다칩니다.'}</strong> → {correct ? '문장 후보 판단을 마쳤습니다. 아래에서 음향·문맥·불확실성의 단서를 구분하세요.' : '강조된 문맥과 연결해 판단한 뒤 제출하세요.'}</> : '두 후보 중 하나를 선택하면 문맥과 대조할 위치가 표시됩니다. 아직 정답 판정 전입니다.'}</p>
  </div>
}

const speechConditions = {
  'quiet-command': { Icon: DoorClosed, situation: '조용한 교실', scope: '시작 · 멈춤 · 다음 세 명령', data: '소수 명령의 사례. 문장 확대 계획 없이 규칙을 직접 관리하는 조건.' },
  'daily-speech': { Icon: Users, situation: '여러 사람이 대화', scope: '다양한 발음·속도의 일상 문장', data: '여러 사람이 말한 음성 사례를 학습에 사용할 수 있는 조건.' },
  'noisy-term': { Icon: Factory, situation: '소음이 큰 공장', scope: '현장 전문 용어와 다양한 발음', data: '현장 소음·전문 용어가 담긴 데이터를 수집해 학습·평가할 수 있는 조건.' },
} as const

export function SpeechSituation({ id }: { id: keyof typeof speechConditions }) {
  const { Icon, situation, scope, data } = speechConditions[id]
  return <div className="mt-3 rounded-xl bg-white p-3" aria-label="방법 선택에 사용할 사례 조건">
    <div className="flex items-center gap-3"><Icon size={40} className="shrink-0 text-cyan-700" aria-hidden="true" /><p className="text-sm font-bold">① 입력 상황 · {situation}<span className="mt-1 block text-xs font-normal text-slate-600">상황 설명용 그림 · 실제 녹음 아님</span></p></div>
    <ArrowDown className="mx-auto my-2 text-cyan-700" size={20} aria-hidden="true" />
    <dl className="grid gap-3 text-sm leading-6 sm:grid-cols-2"><div><dt className="font-bold">② 인식해야 할 범위</dt><dd>{scope}</dd></div><div><dt className="font-bold">③ 사용할 수 있는 데이터</dt><dd>{data}</dd></div></dl>
  </div>
}

export function Lesson10Recap() {
  return <section aria-label="두 활용 분야 핵심 복습">
    <h3 className="text-xl font-black">소구간 1 · 두 활용 분야 짧게 복습</h3>
    <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
      {[
        { title: 'GAN · 두 신경망의 학습', steps: ['생성 입력 → 생성자가 데이터 생성', '생성 데이터 + 실제 데이터 → 감별자가 판단', '판단 결과 → 두 신경망의 가중치 조정', '↶ 생성·감별·학습 반복'], note: '학습 후에는 주로 학습된 생성자로 콘텐츠를 만듭니다. GAN은 생성형 AI의 한 방법입니다.' },
        { title: '음성 인식 · 말소리를 텍스트로', steps: ['말소리 “문이 닫힙니다.”', '주파수 등 여러 특징 분석 → 말소리 단위 추정', '단어·문장 후보 판단', '텍스트 “문이 닫힙니다.”'], note: '이후 텍스트의 의미 처리와 답변 생성에는 자연어 처리가 연결될 수 있습니다.' },
      ].map(item => <figure key={item.title} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4"><figcaption className="font-black">{item.title}</figcaption><ol className="mt-3 grid gap-2">{item.steps.map((step, index) => <li key={step}>{index > 0 && <ArrowDown className="mx-auto mb-2 text-violet-700" size={18} aria-hidden="true" />}<p className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6"><strong>{index + 1}. </strong>{step}</p></li>)}</ol><p className="mt-3 text-sm leading-6">{item.note}</p></figure>)}
    </div>
    <p className="mt-3 text-sm leading-6">위 두 그림은 서로 다른 활용 분야의 개념도이며 하나의 연속 처리 과정이 아닙니다. 실제 모델의 실행 결과나 서비스별 정답 조합을 나타내지 않습니다.</p>
  </section>
}
