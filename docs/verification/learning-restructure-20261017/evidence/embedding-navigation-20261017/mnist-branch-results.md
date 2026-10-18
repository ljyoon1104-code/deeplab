# MNIST 오류 재시도·오분류 0개 분기 — 통제 테스트

실행: `node output/embedding-navigation-20261017/mnist-branch-harness.cjs` · 종료 코드 0.

**실제 MNIST 실행 결과가 아닙니다.** 제품 모듈을 메모리에서 변환하여 별도 Node 프로세스에서 실행했습니다. 합성 표본·예측 및 의존성 fixture를 사용하며 브라우저, 사용자 origin, localStorage, 기존 실험에 접근하지 않습니다. 제품 소스·설정·패키지를 변경하지 않았습니다.

| 검증 대상 | 실제 실행한 코드와 통제 범위 | 결과 |
| --- | --- | --- |
| 데이터/엔진/변환/모델/학습 실패 후 재시도 | `Lesson08LabProvider`의 실제 함수. 실패 의존성과 상태 hook은 테스트 어댑터 | 각 오류 종류·상세 표시, busy 해제, 모델 미준비, 실패 실험 0개, 재시도 성공 후 오류 해제·격리된 메모리 기록 1개. 5경로 모두 통과 |
| 오류 상태의 다시 실행 버튼 | 실제 `Lesson08Step2` JSX와 React SSR | 오류 alert 존재, 학습 시작 버튼 활성화 |
| 실패 자원 정리 | Provider의 실제 catch/finally, 추적 가능한 테스트 자원 | 모델 생성 실패 후 입력 Tensor 2개, 학습 실패 후 Tensor 2개·모델 1개·optimizer 1개 정리 확인 |
| 엔진 로딩 실패 후 재요청 | 실제 `loadTensorFlow`, `ready()` 실패 fixture | 실패 Promise 제거 후 재요청 성공. 성공 Promise는 재사용 |
| 학습 지표 오류 후 새 호출 | 실제 `fitModel`, fit callback fixture | NaN 지표 거절 후 새로운 정상 호출에서 1개 Epoch 기록 반환 |
| 평가 shape 오류 후 정상 평가 | 실제 `evaluateModel`, 기존 TF.js CPU Tensor, 합성 2표본·예측 fixture | 잘못된 shape 거절. 실패/성공 후 Tensor 수가 시작값과 같음. 정상 fixture에서 정답 2개/오분류 0개 계산 |
| 오분류 0개 기본 표시 | 실제 `Lesson08Step5`, 실제 React hooks·서버 렌더 | 0개 안내와 가짜 오분류를 만들지 않는 문구 표시. 오류 카드/이유 선택은 없음. 완료 버튼 비활성 |
| 0개 확인→완료 | 같은 STEP 5 함수의 실제 checkbox/click handler, 독립 hook 어댑터 | 확인 체크 후 완료 버튼 활성. 체크만으로 자동 완료하지 않음. 완료 클릭 1회에 콜백 1회. 체크 해제는 완료 콜백을 취소하지 않음 |

## 구분과 한계

- 합성 2표본의 0개 오분류는 **100% MNIST 정확도나 학습된 모델의 성능 근거가 아닙니다**. 해당 표시 분기의 재현 가능한 입력일 뿐입니다.
- Provider 상태·핸들러 테스트는 자체 hook 어댑터를 사용합니다. 실제 React DOM/StrictMode/effect 스케줄링·브라우저 오류 화면·네트워크 복구·GPU 복구 검증이 아닙니다.
- 실제 JSX의 React SSR은 수행했지만 브라우저 화면 크기·줄바꿈·터치 검증은 수행하지 않았습니다.
- 사용자 또는 기존 테스트 기록에 오류/예측/완료 상태를 주입하지 않았습니다. 실험 저장은 테스트 프로세스의 배열로 대체했습니다.
- Node에서 출력된 TF.js의 네이티브 백엔드 설치 권고는 성능 안내이며 실패가 아닙니다. 설치하지 않았습니다.
- 실제 취소·재학습 UI 확인은 별도의 브라우저 검증 결과와 구분해야 합니다.

