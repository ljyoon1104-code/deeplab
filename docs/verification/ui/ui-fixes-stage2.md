# Deep Learning Lab UI 개선 2단계 — 확인된 레이아웃 수정

- 작업일: 2026-10-05
- 기준: [1단계 진단 및 원본 증거](ui-audit-stage1.md)의 UI-01~UI-07
- 결과: 지정된 표시 코드 10개 파일 수정. 아래 대표 화면을 실제 확인했으며, 모든 상태의 최종 비교 검증은 3단계에 남긴다.
- 환경: 기존 Codex In-app Browser 탭과 사용자 서버 `http://localhost:5173/deeplab/` 재사용. 서버 실행·종료 없음.
- 실제 CSS viewport: 데스크톱(D) 1440×900 / 모바일(M) 360×800. 문서 본문 너비는 각각 1425 / 345px. 브라우저 확대·축소 미사용, 종료 시 viewport override 해제.
- 적용되는 AGENTS.md를 찾지 못했으며 computer-use 스킬·로컬 앱·캡처 지침을 확인했다. 원본 보고서와 연결된 문제 캡처를 먼저 읽었다.

## 1. 문제별 수정과 확인

| ID | 확인한 원인 및 최소 수정 | 실제 화면 확인 | 3단계 재검증 |
|---|---|---|---|
| UI-04 | L05 S2 grid 자식 카드의 최소 너비와 숫자 input의 내재 너비가 폭을 밀어냄. 카드·입력행에 min-w-0, 입력에 w-0 + flex-1, 단위에 shrink-0 적용 | M A/B 양쪽 테두리·‘점’ 표시, 포커스, 오답 및 수정 후 정답 피드백 확인. D 2열 유지 | 피드백 유무별 동일 위치 전후 비교, 브라우저 숫자 입력 컨트롤 차이 |
| UI-02 | 뷰포트 md 전환이 실제 카드 너비와 무관하며 화살표도 동일 grid 폭을 차지함. SimpleFlow·FlowChain에 각각 이름 있는 컨테이너 쿼리 적용. 내부 폭 48rem 미만은 세로, 이상은 flex 가로. 화살표 축소 방지와 노드 폭 배분 | D L04 S5 세 사례 및 L07 S7의 INPUT/TARGET에서 문구·함수명 이탈 해소. 넓은 L07 세부 과정은 가로 유지. M 대표 세로 흐름 확인. D L04 S1·L07 S4 재사용 위치 확인 | 48rem 전환 전후 실제 카드 폭, M TARGET·전체 세부 흐름 끝부분 |
| UI-03 | 출력층 명칭의 가운데 좌표가 ⑤·⑥ 종점과 겹침. 명칭만 출력층 카드 왼쪽 위 (18,357)로 이동 | L04 S3 M 3/6, D 6/6에서 분리 확인. D S4 독립 그림도 동일 적용. 3/6→6/6 설명 이동 정상 | D/M 1/6·3/6·6/6, 이전·다시 보기, M S4와 답 공개 상태 |
| UI-05 | 고정 viewBox 전체 축소로 글자도 작아짐. 경사 그림은 가로 좌표·viewBox 폭을 절반으로 조정하고 최대 표시 폭·라벨 여백 조정. LossHistoryGraph는 680px 최소 폭, Attention은 기존 viewBox 폭을 최소 폭으로 유지하고 그림 내부만 스크롤 가능하게 함 | M 경사 그림 전체와 라벨, D 방향 화살표 확인. L06 S6 실제 1회 업데이트 그래프 D 및 M 양끝 확인. Attention D 관계 선택 및 M 좌우 접근 확인. 페이지 전체 가로 넘침 없음 | M Attention 두 번째 예시 양끝, 키보드 방향키·터치 스크롤, 미선택/오답 관계, L06 초기·반복 결과 전후 비교 |
| UI-01 | 중앙 안내가 flex 버튼을 압축함. 이 내비게이션의 버튼에만 shrink-0·whitespace-nowrap, 중앙 안내에 min-w-0 | M L07 S7의 ‘이전·완료’ 한 줄 및 전체 미완료 안내 표시. ‘이전’으로 S6 이동. D L11 S7 안내 표시 및 키보드 포커스 확인 | 완료 가능·완료됨 상태, D/M 동일 차시 비교 |
| UI-06 | flex의 직접 자식인 문장 조각과 strong이 서로 다른 flex 항목이 됨. 기존 문장 전체를 p 하나로 래핑 | L08 S6 모델 없음·빈 결과 상태 D/M에서 자연스러운 문장 줄바꿈 확인 | 살아 있는 모델이 있을 때 빈 결과→실제 결과 전환. 이번에는 실행하지 않음 |
| UI-07 | 선택 원 반지름 6보다 라벨 오프셋 4.5가 작음. 친구는 점 아래 중앙, 나머지는 점에서 8 간격으로 배치 | M 친구·우정, D 사람·냉장고 선택에서 원/라벨 분리 확인. D 설명 3/3 강조도 확인 | D/M 각각 네 선택 상태, 설명 이전·다시 보기 |

### UI-04 증거 및 입력 동작

- [M 포커스·입력행](ui-fixes-stage2/UI04-L05-S02-mobile-focus-error.jpg)
- [M 오답 피드백](ui-fixes-stage2/UI04-L05-S02-mobile-feedback.jpg), [M 수정·재제출](ui-fixes-stage2/UI04-L05-S02-mobile-retry.jpg)
- [D 두 열](ui-fixes-stage2/UI04-L05-S02-desktop-two-columns.jpg)
- 일반 UI에서 A=9, B=2, 사례 B 선택 후 오답 안내를 확인하고 A=10으로 수정하여 정답 안내를 확인했다. STEP 전체를 완료하거나 저장 답안을 주입하지 않았다.
- M에서 두 입력의 오른쪽 약 260.3px, 단위 오른쪽 287px, 카드 오른쪽 308px로 카드 안에 포함됐다. 입력 포커스 링도 확인한 화면에서 잘리지 않았다.

### UI-02 증거 및 재사용 위치

- [L04 S5 D 세 사례](ui-fixes-stage2/UI02-L04-S05-desktop-flows.jpg), [M 대표 카드](ui-fixes-stage2/UI02-L04-S05-mobile-flow.jpg)
- [L07 S7 D 세부·INPUT·TARGET](ui-fixes-stage2/UI02-L07-S07-desktop-input-target.jpg), [M INPUT](ui-fixes-stage2/UI02-L07-S07-mobile-input.jpg)
- [L04 S1 D 재사용](ui-fixes-stage2/UI02-L04-S01-desktop-shared-flow.jpg), [L07 S4 D 재사용](ui-fixes-stage2/UI02-L07-S04-desktop-shared-flow.jpg)
- D L07 세부 흐름 컨테이너는 980px, 각 노드는 약 126px였으며 측정한 노드의 clientWidth와 scrollWidth가 같았다. INPUT/TARGET 카드에서는 세로로 전환됐다.
- L07의 다른 위치에서 사용하는 기존 FlowArrow는 유지했다. MNIST 상태·변환·선택 코드는 변경하지 않았다.

### UI-03 증거

- [L04 S3 M 3/6](ui-fixes-stage2/UI03-L04-S03-mobile-middle.jpg)
- [L04 S3 D 6/6](ui-fixes-stage2/UI03-L04-S03-desktop-last.jpg)
- [L04 S4 D 독립 계산](ui-fixes-stage2/UI03-L04-S04-desktop-independent.jpg)
- 연결선·노드·가중치·편향·계산값·정답 가림·설명 단계 로직은 그대로다.

### UI-05 증거와 스크롤의 의미

- [경사 그림 M 최종](ui-fixes-stage2/UI05-L06-S04-mobile-final.jpg), [D 방향 표시](ui-fixes-stage2/UI05-L06-S04-desktop-direction.jpg)
- [실제 1회 업데이트 그래프 D](ui-fixes-stage2/UI05-L06-S06-desktop-one-update.jpg), [M 왼쪽 축](ui-fixes-stage2/UI05-L06-S06-mobile-left-axis.jpg), [M 오른쪽 마지막 점](ui-fixes-stage2/UI05-L06-S06-mobile-right-end.jpg)
- [Attention M 왼쪽](ui-fixes-stage2/UI05-L12-S04-mobile-attention.jpg), [M 오른쪽](ui-fixes-stage2/UI05-L12-S04-mobile-right.jpg), [D 선택 관계](ui-fixes-stage2/UI05-L12-S04-desktop-selected.jpg)
- 경사 그림의 의미는 동일하다. 오른쪽 현재 위치, 왼쪽 낮은 방향, 골짜기·화살표의 대응은 유지하고 가로 좌표만 같은 비율로 줄였다. 최종 경사 그림은 내부 스크롤 없이 전체를 보여 준다.
- L06 그래프는 실제 기존 계산 버튼으로 1회만 업데이트한 결과(loss 0.644→0.367)를 사용했다. MNIST 실행이 아니다. 기존 계산·축 값·점 좌표 산식은 수정하지 않았다.
- M Loss 그래프 표시 영역 237px / 내부 680px. 가로 스크롤 0→443px로 마지막 Epoch와 점에 접근했다. 눈금 글자의 실제 DOM 영역 높이는 약 19px, Epoch 약 20px였다(선언 font-size만 본 것이 아님).
- M Attention 표시 영역 225px / 내부 380·475px. 단어 글자 영역 약 19px, 관계 설명 약 20px. 좁은 카드에서는 그림 안만 좌우 이동하며 바깥 페이지는 넘치지 않는다. D의 두 번째 카드도 내부 최소 폭보다 조금 좁아 짧은 스크롤이 남는다.
- Attention의 기존 ‘비’ 선택을 해제·재선택했을 때 aria-pressed와 강조가 바뀌고 원래 관계로 돌아옴을 확인했다.
- 스크롤 영역에 접근 가능한 이름과 키보드 포커스 경계를 추가했다. 실제 방향키 스크롤과 터치 기기 검증은 3단계에 남긴다.
- 경사 그림의 초기 시도 캡처 `UI05-L06-S04-mobile-scroll-start/end.jpg`는 최종 수정 전 기록이다. 특히 End 키는 페이지 하단으로 이동했으므로 오른쪽 스크롤 성공 증거가 아니다. 최종 근거로 사용하지 않는다. SVG 변환 행렬 조회는 브라우저 읽기 API 미지원으로 두 차례 오류 후 중단했으며, 최종 판정은 실제 캡처와 지원되는 DOM 경계 측정만 사용했다.

### UI-01·06·07 증거

- 하단 버튼: [M 미완료 안내](ui-fixes-stage2/UI01-L07-S07-mobile-footer.jpg), [D 미완료 안내](ui-fixes-stage2/UI01-L11-S07-desktop-footer.jpg). D 이전 버튼 약 85.8×44px, focus-visible 3px 윤곽선 확인.
- Canvas 대기 문장: [M](ui-fixes-stage2/UI06-L08-S06-mobile-waiting.jpg), [D](ui-fixes-stage2/UI06-L08-S06-desktop-waiting.jpg). Canvas·예측 실행 없이 대기 카드만 확인했다.
- 임베딩: [M 친구](ui-fixes-stage2/UI07-L11-S05-mobile-friend.jpg), [M 우정](ui-fixes-stage2/UI07-L11-S05-mobile-friendship.jpg), [D 사람](ui-fixes-stage2/UI07-L11-S05-desktop-person.jpg), [D 냉장고·설명 마지막](ui-fixes-stage2/UI07-L11-S05-desktop-fridge-final.jpg). 실제 점 좌표와 상대 거리는 그대로다.

## 2. 수정 파일

소스 10개. 기존 변경 위에 다음 표시 부분만 추가했다.

1. `src/lessons/lesson05/Lesson05Steps.tsx` — 사례 A/B 카드·입력행 className
2. `src/lessons/lesson04/NeuralNetworkDiagram.tsx` — SimpleFlow 표시 className
3. `src/lessons/lesson07/Lesson07Steps.tsx` — FlowChain 표시 JSX·className만
4. `src/lessons/lesson04/TinyNetworkWalkthrough.tsx` — 출력층 SVG 명칭 좌표·앵커
5. `src/lessons/lesson06/LossLandscapeDiagram.tsx` — SVG 표시 좌표·비율·라벨
6. `src/lessons/lesson06/LossHistoryGraph.tsx` — 표시 너비·스크롤 래퍼
7. `src/lessons/lesson12/AttentionVisualizer.tsx` — 표시 너비·스크롤 래퍼
8. `src/components/BottomLessonNavigation.tsx` — 로컬 버튼·안내 폭 배분
9. `src/lessons/lesson08/Lesson08Steps.tsx` — 대기 문장 p 래핑 한 곳
10. `src/lessons/lesson11/EmbeddingVisualizer.tsx` — SVG 텍스트 위치·앵커

신규 진단 산출물: 이 보고서와 `docs/ui-fixes-stage2/`의 JPEG 31개(최종 전 중간 시도 2개 포함). 기존 Stage 1 캡처를 덮어쓰지 않았다.

## 3. 보호 범위와 검증 결과

- 시작 시 추적 수정 35개 / 미추적 상위 항목 7개. 끝에는 추적 수정 40개 / 미추적 상위 항목 7개다. 새로 수정 상태가 된 추적 파일은 BottomLessonNavigation, NeuralNetworkDiagram, LossLandscapeDiagram, LossHistoryGraph, AttentionVisualizer 5개다. TinyNetworkWalkthrough는 기존처럼 미추적 상태다.
- 작업 전 기록한 기존 파일 177개 중 허용된 소스 10개만 변경, 나머지 **167개 SHA-256 동일**. 기존 Stage 1 보고서·캡처, 다른 차시의 기존 수정, 개인 문서와 미추적 컴포넌트를 보존했다.
- 시작 시 소스 내용과 최종 내용을 직접 비교했다. 문항·정답·파서·허용 오차·이벤트·완료 조건·Context·저장 키·STEP ID·완료 버전·라우팅·패키지 설정 변경 없음.
- Lesson07Context, Lesson08Context, 데이터·로더·Tensor 변환·학습 엔진·실험 저장·DrawingCanvas·drawingPreprocess 등 MNIST 보호 파일은 그대로다. 학습·평가·Canvas 입력·예측을 실행하지 않았다.
- 일반 UI 이동과 대표 선택/입력은 방문·활동 기록을 갱신할 수 있으나 localStorage 삭제, 기록 초기화, 강제 완료, 가짜 모델 결과 주입은 하지 않았다.
- 캡처 직전 URL·차시 제목·STEP 제목·viewport를 확인했다. 전환 단계는 실제 상태 3/6·6/6·3/3을 확인한 경우에만 표시했다. 스크롤된 캡처의 상단 고정 영역 일부가 잘려 합성된 경우는 수정 결과/신규 앱 결함의 근거로 사용하지 않았다.
- `git diff --check`: 종료 코드 0, whitespace 오류 없음. 기존 LF→CRLF 안내 경고는 존재한다.
- `npm.cmd run build` **1회** 실행: `tsc -b`는 통과하여 Vite 단계에 진입했다. Vite 설정을 읽는 esbuild에서 상위 `../../..` 디렉터리 접근 거부 및 vite.config.ts 해석 실패로 종료 코드 1. **현재 실행 환경 권한으로 프로덕션 빌드 확인 불가.** 재실행·권한/실행 정책/Git 설정 변경 없음.
- 실제 화면 확인은 기존 개발 서버 기준이며 프로덕션 화면 검증을 대신하지 않는다.
- 설치·새 서버 실행·서브에이전트·commit·push·Actions·Pages 배포 없음.

## 4. 3단계와 별도 미해결 항목

3단계는 위 표의 남은 상태를 원본 Stage 1 캡처와 같은 크기·위치에서 비교한다. 이번 대표 확인을 전체 UI 검증 완료로 확대하지 않는다.

다음은 이번에 수정하거나 해결됐다고 판단하지 않았다.

- RNN 3/5 이후 선택 반영·진행 문제: 별도 재현 및 원인 확인 필요.
- React 중복 key 경고: 원인 조사·수정 안 함.
- MNIST 실시간 학습·Test·Canvas 예측 결과 화면: 살아 있는 모델이 없고 재학습 금지이므로 미확인.
- 완료 가능/완료됨, 아직 재현되지 않은 다른 활동 상태, 실제 터치 기기 및 reduced-motion 환경: 별도 확인 필요.
- 프로덕션 빌드: 위 환경 접근 제한이 해소된 실행 환경에서 확인 필요.
