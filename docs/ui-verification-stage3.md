# UI 개선 3단계 — 실제 화면 재검증

검사일: 2026-10-05. **부분 검증 완료**. 확인한 상태에서 UI-01~07의 기존 표시 결함은 재현되지 않았다. 접근하지 못한 완료·예측 결과 상태까지 정상이라고 판정하지 않는다. 이번 단계의 추가 앱 코드 수정은 없다.

> **UI-03 후속 정정:** 위 문장과 아래 표는 당시 검사 기록이다. 이후 출력 원/함수 설명 및 은닉층 제목/연결 번호의 겹침을 실제로 재현했다. 기존 ‘확인 완료’ 판정은 이를 놓쳤으므로 충분하지 않았다. 이번 표시 수정과 재검증의 최신 근거는 **8절**에 추가하며, 과거 기록과 캡처는 삭제하지 않는다.

## 1. 환경과 증거 사용 기준

- [1단계 진단](ui-audit-stage1.md)과 [2단계 수정 기록](ui-fixes-stage2.md)의 증거를 재사용하고, 남은 상태만 추가 확인했다.
- 사용자 서버 `http://localhost:5173/deeplab/`, Codex in-app browser의 기존 탭/세션을 사용했다. 서버 실행·종료·재시작 없음.
- D: 실제 CSS viewport **1440×900**, M: **360×800**. 세로 스크롤바를 제외한 문서 clientWidth는 각각 1425/345px였다. 창 크기나 전체 페이지 높이를 viewport로 간주하지 않았다.
- 컨테이너 전환 확인에는 별도 폭 938/940/972/974px, 높이 900px를 사용했다. 아래 표에 실제 내부 폭도 기록했다.
- 캡처 직전 URL, 차시 제목, STEP 제목과 선택/설명 상태를 확인했다. 이번 최종 증거에 다른 STEP의 화면을 사용하지 않았다. 캡처는 viewport 단위 JPEG이며 기존 캡처를 덮어쓰지 않았다.
- 클릭·키보드는 브라우저 자동화 입력이다. **모바일 viewport에서 마우스로 조작했으며 실제 터치 확인은 아니다.**
- localStorage 삭제/주입, 완료 강제, 가짜 예측값 주입 없음. 정상 UI 조작에 따른 선택/활동 상태 변화만 발생했다. 차시 전체 풀이·완료는 하지 않았다.

## 2. UI-01~07 결과표

‘확인 완료’는 아래에 명시한 표시 상태의 범위에만 적용한다. 전체 앱 QA나 모든 브라우저의 통과를 의미하지 않는다.

| 문제 | 상태 | 확인한 크기·상태 및 결과 | 기존 문제 / 최종 증거 | 추가 수정 | 남은 미확인 조건 |
|---|---|---|---|---|---|
| UI-01 하단 버튼 | **부분 확인** | 같은 L07 S7의 D/M 미완료 상태에서 이전·완료 문구가 한 줄이고 중앙 안내가 유지됨. M 이전 이동과 D 포커스는 2단계 결과 재사용 | [원본](ui-audit-stage1/L01-S07-mobile.jpg) / [M 최종](ui-fixes-stage2/UI01-L07-S07-mobile-footer.jpg), [D 최종](ui-verification-stage3/UI01-L07-desktop-incomplete.jpg) | 없음 | 완료 가능·완료됨. 현재 세션 Home은 0/12 완료이며 상태 확보를 위한 전체 풀이/강제 변경을 하지 않음 |
| UI-02 카드 흐름 | **확인 완료** | L04 S5·L07 S7 D/M, INPUT/TARGET, 내부 폭 767/769px 전환. 세로/가로 전환 후 노드·화살표·순서 및 문자열 이탈 없음 | [L04 원본](ui-audit-stage1/R2-L04-S05-desktop-overlap.jpg), [L07 원본](ui-audit-stage1/R2-L07-S07-desktop-narrow-flow.jpg) / [L04 카드](ui-fixes-stage2/UI02-L04-S05-desktop-flows.jpg), [L07 경계](ui-verification-stage3/UI02-L07-boundary-769.jpg), [M TARGET](ui-verification-stage3/UI02-L07-mobile-target.jpg) | 없음 | 별도 발견 사항 없음. 모든 임의 폭/모든 사용처 검사는 아님 |
| UI-03 작은 신경망 | **확인 완료** | 안내 D/M 초기·중간·마지막, 이전·다시 보기 및 M 독립 그림에서 출력층 명칭과 선 분리. 미제출 중간값 ? 유지 | [원본](ui-audit-stage1/R2-L04-S03-desktop-final.jpg) / [D 중간](ui-verification-stage3/UI03-L04-desktop-middle.jpg), [M 마지막](ui-verification-stage3/UI03-L04-mobile-final.jpg), [M 독립](ui-verification-stage3/UI03-L04-mobile-independent.jpg) | 없음 | 독립 문제 정답 제출 후 값 공개는 추가로 풀지 않음. 전환 중 모든 순간 프레임은 미확인 |
| UI-04 입력칸 | **확인 완료** | M 빈 초기·포커스·오답·정답 피드백 및 D 두 열. 기존 오답→수정 재제출 검사를 재사용. 입력 테두리·값·점 단위의 카드 이탈 없음 | [원본](ui-audit-stage1/R2-L05-S02-mobile-clipped.jpg) / [M 초기](ui-verification-stage3/UI04-L05-mobile-empty-initial.jpg), [M 정답 포커스](ui-verification-stage3/UI04-mobile-correct-focus.jpg), [D 두 열](ui-fixes-stage2/UI04-L05-S02-desktop-two-columns.jpg) | 없음 | 다른 브라우저의 숫자 입력 컨트롤은 미확인 |
| UI-05 그래프·Attention | **부분 확인** | L06 경사 그림은 2단계 M 라벨/D 방향 증거 재사용. L06 초기와 실제 5회 결과, L12 두 그림 미선택/선택 상태 확인. 내부 좌우 끝 접근 및 실제 키보드 가로 스크롤 확인 | [경사 원본](ui-audit-stage1/R2-L06-S04-mobile-small-graph.jpg), [그래프 원본](ui-audit-stage1/R2-L06-S06-mobile-small-graph.jpg), [Attention 원본](ui-audit-stage1/R2-L12-S04-mobile-small-labels.jpg) / [5회 결과 D](ui-verification-stage3/UI05-L06-desktop-five-updates.jpg), [M 키보드](ui-verification-stage3/UI05-L06-mobile-keyboard-graph.jpg), [두 번째 Attention 오른쪽](ui-verification-stage3/UI05-L12-mobile-second-selected-right.jpg) | 없음 | 실제 터치 스크롤, 다른 브라우저 환경. 스크롤 중 일부 영역이 viewport 밖에 있는 것은 의도된 내부 스크롤이며 삭제/클리핑 결함으로 판정하지 않음 |
| UI-06 Canvas 안내 | **부분 확인** | 모델 없음·결과 대기 문장 D/M은 2단계 정상 증거 재사용. 이번 세션에서도 모델 준비 필요 안내와 예측 버튼 비활성 확인 | [원본](ui-audit-stage1/R2-L08-S06-mobile-placeholder.jpg) / [M 대기](ui-fixes-stage2/UI06-L08-S06-mobile-waiting.jpg), [D 대기](ui-fixes-stage2/UI06-L08-S06-desktop-waiting.jpg) | 없음 | 살아 있는 모델이 없어 실제 예측 전환·28×28 미리보기·예측 숫자·확률 막대 배치는 미확인. 재학습/자동 그리기 안 함 |
| UI-07 임베딩 | **확인 완료** | D/M 네 단어 선택을 2단계+이번 캡처로 비교. 선택 원과 이름 분리, 그림 경계 이탈 없음. 설명 1→2→3→2→1(다시 보기) 후 선택 점 유지 | [D 원본](ui-audit-stage1/R2-L11-S05-desktop-final.jpg), [M 원본](ui-audit-stage1/R2-L11-S05-mobile-middle.jpg) / [D 친구](ui-verification-stage3/UI07-L11-desktop-friend.jpg), [D 우정](ui-verification-stage3/UI07-L11-desktop-friendship.jpg), [M 사람](ui-verification-stage3/UI07-L11-mobile-person-full-plot.jpg), [M 냉장고·다시 보기](ui-verification-stage3/UI07-L11-mobile-replay-full-plot.jpg) | 없음 | 전환 순간의 모든 프레임 및 실제 터치 입력은 미확인 |

## 3. 남은 재검증의 구체적 결과

### UI-02: viewport가 아닌 컨테이너 경계

브라우저 root font는 16px, 48rem은 768px였다. 아래 내부 폭은 테두리·padding을 제외한 컨테이너 내용 영역이다.

| 위치 | CSS viewport | 실제 내부 폭 | 관찰한 배치 | 캡처 |
|---|---:|---:|---|---|
| L07 S7 기본/상세 흐름·INPUT·TARGET | 972×900 | 각각 767px | 세로 | [767px](ui-verification-stage3/UI02-L07-boundary-767.jpg) |
| 같은 네 흐름 | 974×900 | 각각 769px | 가로 | [769px](ui-verification-stage3/UI02-L07-boundary-769.jpg) |
| L07 S7 D INPUT/TARGET | 1440×900 | 각각 425px | 넓은 viewport에서도 좁은 카드 내부는 세로 | [2단계 D](ui-fixes-stage2/UI02-L07-S07-desktop-input-target.jpg) |
| L04 S5 세 카드 | 1440×900 | 각각 약 285px | 세로 | [2단계 D](ui-fixes-stage2/UI02-L04-S05-desktop-flows.jpg) |
| 동일 SimpleFlow를 쓰는 L04 S1 | 938×900 | 767px | 세로 | [767px](ui-verification-stage3/UI02-L04-shared-boundary-767.jpg) |
| 동일 SimpleFlow를 쓰는 L04 S1 | 940×900 | 769px | 가로 | [769px](ui-verification-stage3/UI02-L04-shared-boundary-769.jpg) |

L04 S5의 실제 3열 카드 폭은 768px에 도달하지 않으므로 CSS나 DOM을 강제로 늘리지 않았다. 정상 화면에서 같은 SimpleFlow를 사용하는 S1으로 전환 경계를 확인했다. M INPUT은 [2단계 증거](ui-fixes-stage2/UI02-L07-S07-mobile-input.jpg), TARGET은 이번 캡처로 보완했다. 표에 기록한 화면은 모두 문서 scrollWidth=clientWidth였다.

### UI-03·04: 설명·정답 가림·피드백

- L04 안내: [D 1/6](ui-verification-stage3/UI03-L04-desktop-initial.jpg), [D 3/6](ui-verification-stage3/UI03-L04-desktop-middle.jpg), [D 6/6(2단계)](ui-fixes-stage2/UI03-L04-S03-desktop-last.jpg). M은 [3/6(2단계)](ui-fixes-stage2/UI03-L04-S03-mobile-middle.jpg), [6/6](ui-verification-stage3/UI03-L04-mobile-final.jpg), 이전으로 5/6 이동 후 [다시 보기 1/6](ui-verification-stage3/UI03-L04-mobile-replay.jpg)을 확인했다.
- L04 S4 DOM에서 H1/H2 가중합·렐루 출력과 출력층 가중합은 `?`, 기존 제공 시그모이드 값만 `0.62`였다. 임의 답안 주입/가림 해제 없음. 독립 문제 제출 후 공개 상태는 이번 검증 범위에서 제외했다.
- L05 S2 A/B 오답·재제출은 [2단계 오답](ui-fixes-stage2/UI04-L05-S02-mobile-feedback.jpg)과 [수정 후 정답](ui-fixes-stage2/UI04-L05-S02-mobile-retry.jpg)을 재사용했다. 이번에는 기존 정답 상태 A=10/B=2에서 [포커스](ui-verification-stage3/UI04-mobile-correct-focus.jpg)와 [피드백](ui-verification-stage3/UI04-mobile-correct-feedback.jpg), 일반 화면 재진입 후 빈 초기 입력행을 추가 확인했다. MSE 판정 함수 및 이벤트는 수정하지 않았다.

### UI-05: 실제 반복 결과와 내부 스크롤

- 경사 그림의 현재 위치·라벨·방향: [M 최종](ui-fixes-stage2/UI05-L06-S04-mobile-final.jpg), [D 선택 방향](ui-fixes-stage2/UI05-L06-S04-desktop-direction.jpg)을 재사용했다.
- L06 S6의 초기 0회 그래프를 확인한 뒤 정상 UI의 **5회 연속 학습을 한 번** 실행했다. 표시값은 loss 0.644→0.120, 현재 5회, w1=0.852, w2=0.552, b=0.652, 예측=0.887. 실제 작은 뉴런 활동 결과이며 MNIST 실행이 아니다.
- [초기 그래프 M](ui-verification-stage3/UI05-L06-mobile-initial-graph.jpg), [5회 그래프 D](ui-verification-stage3/UI05-L06-desktop-five-updates.jpg), [M 마지막 점/5 눈금](ui-verification-stage3/UI05-L06-mobile-graph-right-end.jpg). 데스크톱에서 전체 축과 마지막 점이 표시됐고 모바일에서는 글자 축소 대신 내부 스크롤로 접근했다.
- Attention 두 예시: [D 미선택](ui-verification-stage3/UI05-L12-desktop-unselected.jpg), [D 선택(2단계)](ui-fixes-stage2/UI05-L12-S04-desktop-selected.jpg), [M 두 번째 미선택](ui-verification-stage3/UI05-L12-mobile-second-unselected.jpg), [M 선택 왼쪽](ui-verification-stage3/UI05-L12-mobile-second-selected-left.jpg), [오른쪽](ui-verification-stage3/UI05-L12-mobile-second-selected-right.jpg). 첫 예시의 M 기존 좌우 캡처도 재사용했다.

키보드 포커스 후 `ArrowRight`를 실제 입력하고 DOM의 스크롤 위치를 읽었다. 이어 일반 가로 스크롤 조작으로 오른쪽 끝과 왼쪽 끝을 확인했다. **아래 검사는 페이지 이동과 분리된 내부 스크롤이다.**

| 대상(M) | ArrowRight 전→후 scrollLeft | 내부 최대/양 끝 도달 | 페이지 scrollY 전→후 | 키보드 포커스 |
|---|---|---|---|---|
| L06 Loss 그래프 | 0→25px | 443px / 443→0 | 1121→1121 | focus-visible=true |
| L12 첫 Attention | 0→34px | 155px / 155→0 | 608→608 | focus-visible=true |
| L12 두 번째 Attention | 0→35px | 250px / 250→0 | 1227→1227 | focus-visible=true |

읽은 시점은 브라우저 스크롤 애니메이션 도중일 수 있으므로 한 번의 키가 반드시 위 고정 거리만큼 움직인다는 뜻은 아니다. 세 검사 모두 페이지 scrollX=0이었다. 실제 터치 제스처 도구는 지원되지 않아 미확인이다.

### UI-07: 네 선택 상태와 설명 복습

- 이번 D 친구/우정 + [기존 D 사람](ui-fixes-stage2/UI07-L11-S05-desktop-person.jpg)/[냉장고](ui-fixes-stage2/UI07-L11-S05-desktop-fridge-final.jpg), 이번 M 사람/냉장고 + [기존 M 친구](ui-fixes-stage2/UI07-L11-S05-mobile-friend.jpg)/[우정](ui-fixes-stage2/UI07-L11-S05-mobile-friendship.jpg)으로 각 크기에서 네 상태를 확인했다.
- M에서 냉장고 선택을 유지한 채 설명 다음→다음→이전→다시 보기로 1/3→2/3→3/3→2/3→1/3을 확인했다. 점 선택/좌표와 설명 이동이 분리되고 요소 중복·소실이 보이지 않았다.
- `UI07-L11-mobile-person.jpg`, `UI07-L11-mobile-refrigerator.jpg`는 선택 버튼·설명 맥락용이다. 스크롤 위치 때문에 그림 위쪽이 viewport 밖이므로 전체 그림 경계 판정에는 `*-full-plot.jpg`를 사용했다.

## 4. 별도 기능·도구 제한

### RNN: 이번에는 진행 문제 재현 안 됨

L12 S2의 기존 현재 활동 3/5 ‘못’에서 ‘부정과 관련된 표현 등장’을 한 번 선택했다. aria-pressed=true와 정상 피드백, ‘다음 단어’ 활성화를 확인했다. 이어 4/5 ‘부르지’에서 ‘노래 행동’, 5/5 ‘않아’에서 ‘앞의 표현과 함께 전체 문맥 확인 필요’를 선택해 마지막 장면까지 진행했다.

- [3/5 선택·다음 활성화](ui-verification-stage3/RNN-L12-step3-selection-enabled.jpg)
- [5/5 마지막 선택과 피드백](ui-verification-stage3/RNN-L12-final-selected.jpg)

마지막 장면에서 다음 단어가 비활성인 것은 더 진행할 단어가 없기 때문이다. 완료 확인 체크박스도 나타났다. STEP 완료나 차시 완료까지 수행하지 않았다. **이번 정상 경로에서 재현되지 않았다는 결과이며, 과거 현상의 원인이 해결됐다고 단정하지 않는다.** Context/완료 로직 수정 없음.

### Console·동작 줄이기·순간 전환

- 탭 Console의 warn/error 수집 결과는 시작과 검사 후 모두 빈 목록이었다. 이번 경로에서 중복 key 경고를 관찰하지 못했다. 과거 경고를 현재 오류로 확정하지도, 모든 상태에서 사라졌다고 주장하지도 않는다.
- L04/L11의 실제 이전·다음·다시 보기 이후 정착 화면에서 겹침/중복/소실을 관찰하지 않았다. 150ms 전환의 모든 순간 프레임은 연속 촬영하지 않았으므로 미확인이다.
- 도구가 reduced-motion 환경 전환과 실제 터치를 제공하지 않아 환경 적용 검사는 미확인이다. 코드만 확인한 사항: `TinyNetworkWalkthrough.tsx`, `RepresentationWalkthrough.tsx`의 `motion-reduce:transition-none`, `src/index.css`의 `prefers-reduced-motion: reduce`에서 자동 스크롤 및 애니메이션/전환 시간을 줄이는 규칙. 실제 환경 검증과 구분한다.
- 완료 가능·완료됨 버튼 상태는 기존 완료 기록이 없어 접근하지 않았다. 학습 모델이 없으므로 MNIST 결과 화면도 열지 않았다. 이 두 범위를 확인하려고 강제 상태/재학습을 사용하지 않았다.

## 5. 변경·보존·빌드

- **추가 앱 수정 파일: 없음.** 확인된 표시 상태에 최소 보완이 필요한 새 결함이 재현되지 않았다.
- 새 산출물만 작성: `docs/ui-verification-stage3.md`, `docs/ui-verification-stage3/`의 캡처 31개. 이전 보고서와 원본 캡처는 보존했다.
- 시작 시 추적 파일 수정 40개, 상위 미추적 항목 7개였다. 종료 시 `git status --short`의 기존 목록은 동일하다. `docs/`가 이미 미추적이어서 그 아래 새 보고서·캡처는 해당 항목에 포함된다.
- 시작 시 읽은 기존 파일 209개의 SHA-256과 종료 시 비교 결과: **내용 변경/누락 0개**. 기존 미커밋 소스·미추적 컴포넌트·문서·기존 캡처를 그대로 보존했다. 신규 파일은 위 검증 산출물뿐이다.
- 따라서 계산·문항·이벤트·완료 조건·Context·저장 키·버전·MNIST 데이터/로더/엔진/모델/Canvas/전처리·패키지/배포 설정에 이번 작업으로 인한 변경이 없다. 정상 UI 선택 기록 외 저장 상태를 강제 수정하지 않았다.
- 코드 수정이 없어 TypeScript 및 코드 diff 공백 검사를 재실행하지 않았다. 2단계의 TypeScript 통과 기록은 재사용하되 이번 실행으로 표기하지 않는다.
- **프로덕션 빌드 성공은 미확인.** 2단계에 기록된 Vite/esbuild 상위 경로 접근 거부를 재시도하지 않았다. 권한·실행 정책·Git 설정 변경 없음.
- commit, push, Actions, 배포, 설치, 모델 재학습 없음.

## 6. 남은 확인 조건

1. 정상 활동으로 이미 완료 가능한/완료된 차시 기록이 준비되면 UI-01의 두 상태만 D/M 비교.
2. 기존 세션에 살아 있는 MNIST 모델이 준비돼 있을 때만 UI-06 실제 예측 결과의 미리보기·확률·배치 확인. 이번 작업에서 모델 생성하지 않음.
3. 실제 터치 장치에서 UI-05의 내부 가로 스크롤, reduced-motion 환경을 적용할 수 있는 도구에서 대표 설명 전환 확인.
4. 필요 시 L04 독립 정답 제출 후 공개 상태, 과거 경고가 발생했던 정확한 경로를 별도 재현. 이번 결과만으로 해당 범위를 통과 처리하지 않음.

UI-01~07의 확인한 화면은 개선 상태를 유지했지만, 위 접근·도구 제한이 있으므로 **‘모든 UI 정상’ 판정은 하지 않는다.**

## 7. 잔여 항목 추가 확인

추가 확인일: 2026-10-05. 완료된 UI-02·03·04·07, RNN과 키보드 스크롤 검사는 반복하지 않았다. 아래는 남은 상태에 **접근할 수 있는지 확인한 결과**이며, 해당 UI가 새로 통과했다는 뜻은 아니다.

### 실제 환경과 접근 결과

- 기존 Codex in-app browser 탭과 사용자 서버 `http://localhost:5173/deeplab/`를 재사용했다. 최초 주소는 L04였으며, 정상 링크로 Home을 열고 L08 S6으로 이동했다. 서버·브라우저 세션을 재시작하지 않았다.
- 이번 접근 확인의 실제 CSS viewport는 **1280×720**이었다. 대상 완료·예측 상태가 없어 1440×900/360×800로 전환해 같은 대기 화면을 반복 검사하지 않았다. 따라서 이번 추가 확인에서 D/M 결과 상태를 검사했다고 기록하지 않는다.
- Home의 현재 표시: **0/12 차시 완료**, L08 **14%**, L09 **29%**, 나머지 **0%**. 이는 Home에서 읽은 표시 결과이며 차시를 전부 순회하거나 저장소를 직접 읽은 결과가 아니다. 이미 완료 가능하거나 완료된 차시를 찾지 못했다.
- L08 S6에서 다음 안내를 실제로 읽었다: ‘먼저 STEP 1과 STEP 2에서 실제 모델을 학습해 주세요.’, ‘저장된 실험 기록만으로는 현재 모델을 복원할 수 없습니다.’ **‘AI에게 물어보기’ 버튼은 disabled**였다. 저장된 실험 요약을 살아 있는 모델이나 실제 예측 결과로 간주하지 않았다.
- 현재 브라우저 도구의 제공 기능 목록은 브라우저 `visibility`, `viewport`, 탭 `pageAssets`, `webmcp`였다. 지원되는 입력 API에 실제 터치가 없고, reduced-motion 환경 적용 기능도 제공되지 않았다. 마우스·키보드로 대체 검사하지 않았다.
- 새로운 결과 상태를 확보하지 못했으므로 추가 캡처는 저장하지 않았다. 위 UI/DOM 읽기 결과와 기능 목록을 이번 실행 근거로 남기며, 기존 대기 화면 캡처는 앞 절의 링크를 그대로 사용한다.

### 잔여 항목별 판정과 최소 사용자 행동

| 항목 | 상태 | 실제 확인한 입력·상태 및 근거 | 미확인 범위와 필요한 최소 행동 |
|---|---|---|---|
| 완료 가능/완료됨 버튼 | **미확인** | 정상 마우스 링크로 Home을 열어 진행도 확인. 완료 0/12, 최대 진행률 29%로 추가 풀이가 많이 필요함. 완료 버튼을 누르지 않음 | 평소 학습으로 완료 가능한 차시가 준비된 브라우저에서 마지막 STEP을 열어 주세요. D 1440×900/M 360×800에서 버튼 글자·폭·포커스를 확인하고 한 번 완료한 뒤 안내 배치와 이전 STEP 이동을 확인해야 함 |
| L06 그래프·L12 Attention 실제 터치 | **미확인** | 도구의 실제 터치 미지원. 해당 차시 재진입이나 기존 키보드 검사 반복 없음 | 실제 터치 장치에서 각 그림 내부를 좌우 양 끝으로 밀고, 페이지를 세로로 이동한 뒤 선택·설명 버튼을 조작해 주세요. 마우스 드래그나 키보드 결과로 대체하지 않음 |
| Canvas 실제 예측 결과 | **미확인** | L08 S6의 모델 필요 안내와 예측 버튼 비활성 확인. 그리기·학습·예측 실행 없음 | 다음 정상 학습 후 같은 세션을 유지한 채 숫자 하나를 그려 예측을 한 번 실행해 주세요. 그 결과를 D/M에서 재사용하여 원본 Canvas·28×28 미리보기·예측 숫자·최고 확률·0~9 막대·안내의 배치를 확인해야 함. 숫자 정답 여부는 UI 판정 기준이 아님 |
| 동작 줄이기 실제 환경 | **미확인** | 도구에서 `prefers-reduced-motion: reduce` 적용을 지원하지 않음. 기존 CSS 정적 확인을 실제 통과로 올리지 않음 | 환경을 지원하는 브라우저/OS에서 동작 줄이기를 적용한 뒤 대표 설명 한 곳의 이전·다음·다시 보기를 확인해 주세요. 단계·강조가 남고 겹침/소실이 없으며 답안·완료 상태가 바뀌지 않아야 함. 검사 후 변경한 설정은 복원 |
| 현재 코드의 프로덕션 빌드 | **미확인** | 기존 동일 실행 환경에서 Vite 상위 경로 접근 거부가 기록됨. 명령 재실행 없음. 현재 코드와 일치하는 새 사용자 성공 로그도 제공되지 않음 | 사용자 터미널에서 프로젝트 폴더의 `npm.cmd run build`를 **한 번** 실행하고 전체 결과를 알려 주세요. TypeScript 통과뿐 아니라 Vite 종료 성공까지 확인해야 함 |

**학습 기록 안내:** 정상 완료 버튼을 실제로 누르면 해당 차시의 완료 기록과 Home 진행도가 정상적으로 갱신될 수 있다. 이번에는 완료 버튼을 누르지 않았고 기존 기록을 초기화하지 않았다. 검증을 위해 완료·예측 결과를 강제로 만들지 않았다.

### 추가 작업의 보존 범위와 결론

- 이번에 수정한 파일은 **이 보고서의 추가 절뿐**이다. 앱 코드·설정·데이터·계산·채점·완료 조건·저장 구조·MNIST 기능은 수정하지 않았다. 기존 문서 본문과 캡처는 보존했다.
- 시작 시 Git의 기존 추적 수정 40개와 상위 미추적 항목 7개를 확인했다. 이를 삭제·되돌리기·스테이징하지 않았다. `docs/`는 기존 미추적 항목으로 이 보고서 보완을 포함한다.
- 브라우저 검사 설정을 이번에는 변경하지 않아 복원할 변경이 없다. localStorage/내부 상태 주입·삭제 없음. 정상 화면 이동 외 활동 답안 제출이나 완료 처리 없음.
- 재학습·설치·TypeScript/빌드 재실행·권한/실행 정책/Vite 변경·commit·push·Actions·배포 없음.
- 새로 재현된 UI 결함은 없다. 다만 위 결과 상태에는 접근하지 못했으므로 **잔여 5개 항목을 미확인으로 유지**한다. 전체 UI 검증 완료로 판정하지 않는다. 빌드가 추후 성공하더라도 실제 화면의 미확인을 대신하지 않는다.

## 8. UI-03 추가 발견·그림 배치 수정 및 재검증

### 발견과 실제 사용 위치

2026-10-05 사용자 제보 후 STEP 3·4의 실제 사용 연결을 확인했다. 두 STEP은 `Lesson04Steps.tsx`의 `TinyNetworkExercise`를 통해 **`TinyNetworkWalkthrough.tsx`**를 사용한다. 페이지 상단의 별도 `NeuralNetworkDiagram` 요약 그림이 아니라, 여섯 연결 번호와 계산을 보여 주는 이 SVG가 수정 대상이다.

이번 메시지에서는 첨부 이미지 파일 자체를 열람할 수 없었다. 따라서 첨부 이미지를 직접 대조했다고 주장하지 않으며, 사용자가 지적한 장면을 로컬 서버의 STEP 4에서 D/M으로 재현해 수정 전 근거를 확보했다.

| 발견 | 수정 전 원인과 실제 결과 | 수정 방식 |
|---|---|---|
| 출력 원과 함수 설명 겹침 | 원 중심 y=376/r=24의 하단 y=400과 설명 기준선 y=407의 차이가 7뿐이었다. 글자는 기준선 위로 올라오므로 실제 글자 영역이 원 테두리와 겹쳤다 | 출력 카드 높이를 늘리고 제목·뉴런·설명의 세 공간 분리. 원 중심 y=468, 설명 기준선 y=526으로 배치 |
| 은닉층 제목·③·선 간격 부족 | 은닉층 카드 y=183, 제목 기준선 y=200, 번호③ 중심 y=181/r=11 및 연결선 종점 y=203이 밀집해 제목과 번호/선이 붙어 보였다 | 은닉층 제목 y=224, 뉴런 중심 y=270으로 분리. 번호③을 층 사이 공간으로 이동하고 선은 제목 양옆 통로를 통해 같은 뉴런에 연결 |
| 층의 역할 공간 구분 부족 | 작은 카드 안에 제목·원·활성화 설명을 함께 압축 | 입력/은닉/출력 카드 높이·간격을 확대하고 연결 번호는 층 사이에 배치. 출력층 제목을 가운데 별도 행에 배치 |

수정 전 증거: [STEP 4 D](ui-verification-stage3/ui03-followup/S04-desktop-before.jpg), [STEP 4 M](ui-verification-stage3/ui03-followup/S04-mobile-before.jpg). 두 캡처에서 시그모이드 설명과 원, 은닉층 제목과 ③의 밀집을 직접 확인했다. 이전 검증은 출력층 **명칭**과 선의 분리에 치우쳐 이 결함을 놓쳤다.

### 수정 범위와 보호

- 앱 수정 파일은 `src/lessons/lesson04/TinyNetworkWalkthrough.tsx` **1개뿐**이다. 여섯 연결의 표시 좌표·선 경로, SVG 카드/라벨/노드 배치와 표시 스타일만 변경했다.
- SVG viewBox 폭 280과 실제 최대 폭 320px은 유지하고 높이만 420→552로 늘렸다. `h-auto`, `self-start`를 명시해 높이 증가가 전체 그림 축소로 이어지지 않게 했다. 제목/활성화 설명 글꼴은 14→16으로 늘렸으며 다른 글자를 축소하거나 삭제하지 않았다.
- 실제 렌더링 측정: D SVG **320×630.84px**, M SVG **237×467.22px**. 함수 설명의 계산된 font-size는 16px이고 SVG 폭 비율을 고려한 크기는 D 약 18.3px/M 약 13.5px이다. 모바일에서 폭을 줄여 문제를 숨기지 않았다.
- 원의 기하학적 bounding box 하단과 설명 글자 box 상단의 간격은 D 약 **17.9px**, M 약 **12.8px**. 테두리 두께를 감안해도 눈에 보이는 여백이 남는 것을 캡처에서 확인했다.
- 번호별 from/to/weight와 active 강조 조건을 그대로 유지했다. 수정 전 파일과 비교해 **SVG 블록 및 연결 기하 좌표를 제외한 내용은 동일**했다. 학습 문구, 계산 함수, 정답 가림 조건, 설명 state/event, 채점/완료·저장 로직은 변경하지 않았다.
- 학습 데이터/Context/다른 차시/MNIST/패키지/설정 변경 없음. 기존 미커밋·미추적 변경 위에 이 그림 수정만 추가했다.

### 실제 화면 상태별 확인

사용자 서버 `http://localhost:5173/deeplab/#/lesson/04`를 그대로 사용했다. D는 CSS **1440×900**, M은 **360×800**. 캡처 전에 차시·STEP 및 설명 상태를 읽고 그림 전체가 보이도록 정상 스크롤했다. 아래 캡처를 직접 보며 제목·번호·선·뉴런·함수 설명 사이의 겹침을 확인했다.

| STEP/상태 | 데스크톱 캡처 | 모바일 캡처 | 실제 결과 |
|---|---|---|---|
| STEP 3 초기 1/6 | [D 초기](ui-verification-stage3/ui03-followup/S03-desktop-initial-after.jpg) | [M 초기](ui-verification-stage3/ui03-followup/S03-mobile-initial-after.jpg) | ①·② 강조, 제목·뉴런·설명 분리 |
| STEP 3 중간 3/6 | [D 중간](ui-verification-stage3/ui03-followup/S03-desktop-middle-after.jpg) | [M 중간](ui-verification-stage3/ui03-followup/S03-mobile-middle-after.jpg) | 렐루 설명 강조 후에도 배치 유지 |
| STEP 3 H2/③·④ 강조 5/6 | [D H2](ui-verification-stage3/ui03-followup/S03-desktop-H2-highlight-after.jpg) | [M H2](ui-verification-stage3/ui03-followup/S03-mobile-H2-highlight-after.jpg) | 굵어진 선·③·④와 은닉층 제목이 겹치지 않음 |
| STEP 3 마지막 6/6 | [D 마지막](ui-verification-stage3/ui03-followup/S03-desktop-final-after.jpg) | [M 마지막](ui-verification-stage3/ui03-followup/S03-mobile-final-after.jpg) | ⑤·⑥ 강조가 출력 제목/활성화 설명을 통과하지 않음 |
| STEP 3 이전·다음·다시 보기 | [D 복습 후](ui-verification-stage3/ui03-followup/S03-desktop-controls-replayed-after.jpg) | [M 다시 보기](ui-verification-stage3/ui03-followup/S03-mobile-replay-after.jpg) | M 6→5→6→1, D 1→2→1→1 정상. 네 답안 입력은 전후 모두 빈 값 유지 |
| STEP 4 정답 제출 전 | [D 미제출](ui-verification-stage3/ui03-followup/S04-desktop-unsubmitted-full-after.jpg) | [M 미제출](ui-verification-stage3/ui03-followup/S04-mobile-unsubmitted-full-after.jpg) | 중간값 다섯 곳 `?`, 제공된 시그모이드 출력만 0.62. 그림과 설명 간격 유지 |
| STEP 4 정상 제출 후 | [D 정답 공개](ui-verification-stage3/ui03-followup/S04-desktop-submitted-after.jpg) | [M 제출 후 그림](ui-verification-stage3/ui03-followup/S04-mobile-submitted-after.jpg) | 실제 입력→제출로 공개된 값과 피드백 확인. 출력 원/시그모이드 설명 겹침 없음 |

STEP 4는 설명 장면 전환 버튼이 없는 독립 계산 그림이므로 초기·중간·마지막 상태를 인위적으로 만들지 않았다. 대신 같은 실제 결과의 정답 제출 전/후를 D/M에서 확인했다.

정상 제출한 입력은 H1 가중합 **2**, 렐루 출력 **2**, H2 가중합 **0**, 렐루 출력 **0**, 출력층 가중합 **0.5**이다. 제출 전 `?` 다섯 곳이 정답 제출 후 **2/2/0/0/0.5**로 바뀌었고, 각 필드의 ‘✓ 맞음’과 ‘정답입니다’ 피드백을 관찰했다. 시그모이드 출력은 전후 모두 기존 계산값 **0.62**였다. 결과 해석 문제나 차시 완료를 강제하지 않았다. 정상 입력·제출 외 localStorage/내부 상태 변경 없음.

초기 스크롤 위치에서 그림의 위쪽이 고정 헤더 뒤에 있었던 `S04-mobile-unsubmitted-after.jpg`, `S04-desktop-unsubmitted-after.jpg`는 전체 그림 판정 근거로 쓰지 않았다. 표에는 정상 스크롤로 전체를 확보한 `*-full-after.jpg`를 연결했다. D/M 모두 문서 scrollWidth=clientWidth(1425/345px)였으며 새 가로 넘침은 보이지 않았다.

### 검사 결과와 미확인 범위

- **수정 완료·지정된 실제 화면 검증 완료:** 위 표의 D/M, 강조/복습 및 독립 제출 전후 상태. 보고서 UI-03의 최신 결론은 이 범위에 한정한다.
- `tsc.cmd -b` **1회 실행, 종료 코드 0**. `git diff --check` **1회 실행, 종료 코드 0**, 공백 오류 없음. Git은 기존 파일의 LF→CRLF 변환 경고만 출력했다. 미추적 대상 컴포넌트도 별도로 읽어 행 끝 공백이 없음을 확인했다.
- 기존 Vite 상위 경로 권한 오류는 재시도하지 않았다. **프로덕션 빌드는 여전히 미확인**이다. 권한·설정 변경, commit·push·배포 없음.
- 미확인: 첨부 이미지 파일 자체와의 픽셀 단위 일치, 지정하지 않은 화면 폭/브라우저, 전환의 모든 순간 프레임·실제 터치·reduced-motion 환경. 이번 수정이 해당 범위를 통과했다는 의미는 아니다.
- 새 캡처는 `docs/ui-verification-stage3/ui03-followup/`에만 추가했고, 기존 캡처와 과거 판정은 보존했다. 이번 발견으로 기존 판정의 한계를 명시적으로 정정했다.
