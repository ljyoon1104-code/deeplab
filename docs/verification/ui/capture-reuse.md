# 중복 캡처 대응 기록

정리일: 2026-10-17

SHA-256이 완전히 같은 네 쌍에서 대표 파일을 하나씩 보존하고 중복본 네 개를 제거했습니다. 비슷하게 보인다는 이유로 파일을 합치지 않았습니다. 아래 경로는 이 문서가 있는 폴더를 기준으로 합니다.

| 정리한 중복본의 이전 경로 | 보존한 대표 파일 | 보고서에서의 사용 맥락 |
| --- | --- | --- |
| `ui-verification-stage3/ui03-followup/S04-desktop-before.jpg` | [STEP 4 데스크톱 독립 계산](ui-fixes-stage2/UI03-L04-S04-desktop-independent.jpg) | 2단계 독립 계산 화면과 후속 수정 전 증거 |
| `ui-verification-stage3/ui03-followup/S04-mobile-before.jpg` | [STEP 4 모바일 독립 계산](ui-verification-stage3/UI03-L04-mobile-independent.jpg) | 3단계 독립 계산 화면과 후속 수정 전 증거 |
| `ui-verification-stage3/ui03-followup/S03-desktop-controls-replayed-after.jpg` | [STEP 3 데스크톱 초기 화면](ui-verification-stage3/ui03-followup/S03-desktop-initial-after.jpg) | 초기 화면과 이전·다음·다시 보기 후 동일 화면 |
| `ui-verification-stage3/ui03-followup/S03-mobile-replay-after.jpg` | [STEP 3 모바일 초기 화면](ui-verification-stage3/ui03-followup/S03-mobile-initial-after.jpg) | 초기 화면과 다시 보기 후 동일 화면 |

대표 파일의 SHA-256은 위 표 순서대로 다음과 같습니다. 제거 전 각 중복본이 대표 파일과 같은 해시임을 확인했습니다.

```text
aba5ff684b0706283992e9a45b61afa18be9bd6ea6d936da07358c56428e4787
e9723f440c2546c7e3dd379e38fe1a199d3c1d1eaeb62d9a48eb5647b1e43e37
639ea863d7a0c7f8b7893e2dc4bf056c662a38e43ced4de0557c341fcf7e107f
7f2d7557cdcc3f61f3b1359b1ed6a486d37ac575e8b93a340efc970f6596d70a
```

[3단계 검증 보고서](ui-verification-stage3.md)의 네 캡처 링크를 대표 파일로 변경했습니다. 과거 진단의 한계, 조작 순서, 결과 기록은 보존했습니다. 초기·다시 보기 화면의 이미지가 같다는 사실만으로 조작 과정이 입증되지는 않으며, 해당 과정은 당시 보고서의 기록입니다.

수정 전후가 다른 캡처, 미제출·제출 후 화면, 가림이나 스크롤 한계를 설명하는 캡처는 그대로 보관합니다. 교재 참고 자료와 학습 문서도 이번 정리 대상에서 제외했습니다.

[전체 자료 안내](../../README.md)
