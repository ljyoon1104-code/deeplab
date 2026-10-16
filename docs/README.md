# 프로젝트 자료 안내

보고서·캡처·교재 참고 자료·학습 문서를 용도별로 보관합니다. 검증 결과와 학습 문서는 유지하고, 파일 내용이 완전히 같은 캡처는 대표 파일을 함께 참조하도록 정리했습니다.

## 설계와 개선 계획

- [학습 개선 1단계 설계서](planning/learning-redesign-stage1.md)

## 검증 보고서와 캡처

보고서가 있는 검증은 보고서와 캡처를 함께 보관했습니다. 캡처만 있는 항목을 전체 검증 완료의 근거로 해석하지 않습니다.

| 자료 | 위치 |
| --- | --- |
| UI 1단계 진단 | [보고서](verification/ui/ui-audit-stage1.md) · [캡처](verification/ui/ui-audit-stage1/) |
| UI 2단계 수정 | [보고서](verification/ui/ui-fixes-stage2.md) · [캡처](verification/ui/ui-fixes-stage2/) |
| UI 3단계 검증과 후속 확인 | [보고서](verification/ui/ui-verification-stage3.md) · [캡처](verification/ui/ui-verification-stage3/) |
| 9~12차시 학습 내용 점검 | [캡처](verification/ui/learning-audit-09-12-20261013/) |
| 전체 차시 완주·복원 검사 | [보고서](verification/full-ui-verification-20261017/verification.md) · [캡처](verification/full-ui-verification-20261017/) |
| 중복 key·복습 안내 확인 | [캡처](verification/key-review-verification-20261017/) |
| 운영 배포 화면 확인 | [캡처](verification/deployment-20261017/) |
| Edge 로컬 기록 초기화·5173 포트 고정 | [보고서](verification/local-reset-20261017/verification.md) · [캡처](verification/local-reset-20261017/) |

보고서는 각 검증 시점의 기록입니다. 이후 수정된 문제에 대한 과거 진단도 원문 그대로 보존했습니다. 전체 완주 보고서의 확인 범위는 83/84 STEP·11/12차시이며, 이번 파일 정리가 검증 범위를 늘리지는 않습니다.

[중복 캡처 대응 기록](verification/ui/capture-reuse.md)에 정리한 파일 4개와 보존한 대표 파일의 관계를 남겼습니다. 서로 다른 화면·상태의 캡처와 검증 한계를 설명하는 자료는 유지했습니다.

## 교재 참고 자료

- [GAN·음성 인식·자연어 처리 교재 대조 자료](references/gan-nlp-review-20261016/): 교과서·지도서의 추출 JSON, 페이지 이미지, PPT 추출 JSON, 비교용 추출 자료입니다. 원본 교과서·PPT 파일을 대체하지 않습니다.
- 원본 교재는 기존 외부 자료 위치에 있으며 이번 정리에서 이동하지 않았습니다.

## 학습 문서와 제작 자료

- [Deep Learning Lab 학습 내용 전체 정리](<learning-materials/Deep Learning Lab 학습 내용 전체 정리.docx>) — Word 문서
- [CNN·GAN·자연어 처리 그림 설명](learning-materials/cnn-gan-nlp/CNN_GAN_%EC%9E%90%EC%97%B0%EC%96%B4%EC%B2%98%EB%A6%AC_%EA%B7%B8%EB%A6%BC%EC%9C%BC%EB%A1%9C_%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0.pdf) — PDF 문서
- [PDF 생성 코드](learning-materials/cnn-gan-nlp/build_ai_guide.py)
- [PDF 페이지 검수 이미지와 기존 해시 기록](learning-materials/cnn-gan-nlp/_qa/)

PDF 생성 코드는 PDF 및 `_qa` 폴더와 함께 이동했습니다. 코드가 자신의 위치를 기준으로 경로를 계산하므로 세 항목은 함께 보관합니다. 이번에는 문서를 다시 생성하지 않았습니다.

## 기존 주소와 앱 파일

- 기존 `docs/` 보고서 4개와 `output/full-ui-verification-20261017/verification.md`에는 새 위치 안내를 남겼습니다.
- `docs/`의 보고서·캡처·교재 참고 자료·학습 문서는 Git 제외 대상이 아닙니다. 새 영구 자료도 이 폴더에 보관합니다.
- `output/`의 생성물은 Git에서 제외하며, 위의 기존 보고서 주소 안내 파일만 예외로 유지합니다. 제외 규칙은 파일 자체를 삭제하지 않습니다.
- 보고서 안의 과거 작업 경로와 당시 상태 설명은 기록이므로 원문을 유지했습니다. 현재 위치는 이 안내를 기준으로 찾습니다.
- 앱 소스·배포 설정·실습 데이터·MNIST 원본 데이터·실행 도구는 이번 정리 대상에 포함하지 않았습니다. 브라우저의 학습 기록도 변경하지 않았습니다.
