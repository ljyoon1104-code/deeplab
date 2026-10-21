# 현재 배포·반응형·수식 검증 기록

2026-10-22 파일 정리 시 최신 `output` 기록에서 요약 6개와 대표 화면 5개를 선별 보존했습니다. 아래는 각 검사 당시의 결과이며, 파일 정리 후 새 검사를 통과했다는 뜻은 아닙니다. 과거 보고서 원문은 수정하지 않았습니다.

## 배포 기록

- 운영 주소: <https://ljyoon1104-code.github.io/deeplab/>
- 배포 브랜치·커밋: `main` · `dec9eb4fd556dbccb586d80a30877a4d2849091c`
- [성공한 배포 실행](https://github.com/ljyoon1104-code/deeplab/actions/runs/39627617272) · [당시 배포 검증 원문](records/deployment-result.md)
- HTML·JS·CSS·새 그림·MNIST 데이터의 빌드 동일성, 12차시 진입, 1440×900·768×1024·360×800 대표 화면, 오답 수정·STEP 완료 기록 복원을 확인했습니다. 실제 모델 학습이나 전체 84 STEP 완주를 다시 수행한 배포 검사는 아닙니다.
- [운영 새 뉴런 그림](evidence/deployed-neuron-pc.png)

## 반응형 검증

- [최종 검사 요약](records/responsive-final-checks.json) · [기능 계약 검사](records/responsive-contract-results.json)
- 당시 1~6차시 42 STEP은 320×568·768×1024·1440×900, 7~12차시 42 STEP은 320×568에서 확인했습니다. Home과 ANN은 PC·태블릿·휴대폰 및 중간 너비 16종을 검사했습니다. 모든 답안 상태를 모든 크기로 시험한 것은 아닙니다.
- 당시 필수 답안 **115개**, 제출 활동 **106개**를 유지했습니다. 세 순전파 계산, 세 역전파 실습, 평균 손실의 오답 행 수정, STEP 왕복, 실제 MNIST 학습·평가와 실험 기록 복원을 확인했습니다.
- 태블릿 역전파: [수정 전](evidence/backprop-tablet-before.png) · [수정 후](evidence/backprop-tablet-after.png)

## 수식·표·연결 기호 검증

- [실제 화면 검사](records/formula-ui-verification.json) · [컴포넌트·계약 검사](records/formula-contract-render-results.json) · [빌드 결과](records/formula-build-result.json)
- ReLU 조건별 MathML, 음수·0·양수 출력, 활성화/손실 사용 표, 세 신경망의 2·6·10개 연결 기호와 선택 유지, 순전파·역전파 기호 일치, 정답 가림을 확인했습니다.
- [휴대폰 ReLU 수식](evidence/relu-mobile.png) · [전체 연결 기호](evidence/forward-symbols-pc.png)

## 보존 범위와 한계

- 원본 최신 기록은 `output/deploy-20261022`, `output/responsive-20261021`, `output/formula-label-followup-20261021`에도 유지합니다. 이 폴더에는 재검사 도구를 중복 복사하지 않고 당시 결과·대표 증거만 보관했습니다.
- 이전 115답안·106제출 기준의 완주 기록은 `output/concept-math-20261021`에 유지합니다. 2026-10-17의 전체 차시 검증 원문과 증거는 [기존 검증 안내](../learning-restructure-20261017/README.md)에 있습니다.
- 실제 터치 기기, 브라우저 200% 확대, 모든 답안 조합·과거 기록 조합은 위 대표 검사에서 확인하지 않았습니다. 화면 크기 에뮬레이션은 실제 터치·브라우저 확대 검증이 아닙니다.
- 복사 파일의 원래 위치와 SHA-256은 [보존 목록](preservation-manifest.json)을 참고하세요. 문서 생성 코드의 경로 수정 내역은 [숫자 예제 제작 원본 안내](../../learning-materials/backprop-numeric/README.md)에 있습니다.
