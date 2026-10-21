# 역전파 숫자 예제 제작 원본

2026-10-22에 `.tmp-docs`의 재생성 가능한 렌더와 편집 원본을 구별하여, 다음 세 파일을 영구 보관 위치로 옮겨 보존했습니다. 문서 내용이나 계산값은 수정하지 않았습니다.

| 보존 파일 | 역할과 출력 위치 |
| --- | --- |
| [build_backprop_guide.py](build_backprop_guide.py) | 숫자 예제·공식표 Word 생성 코드. 실행하면 프로젝트 `output/앱_역전파_숫자예제.docx`에 저장합니다. |
| [build_original_examples.py](build_original_examples.py) | 분수·첨자를 Word 수식으로 작성하는 생성 코드. 실행하면 프로젝트 `output/document-build/original_examples_typeset.docx`에 저장합니다. |
| [original_examples_typeset.docx](original_examples_typeset.docx) | 기존 편집 원본의 바이트 동일 보존본입니다. 생성 코드를 실행해도 이 보존본을 덮어쓰지 않습니다. |

두 코드는 설명과 예제 숫자가 코드 안에 포함되어 있으며, 외부 교과서/PPT/PDF나 삭제 대상 렌더 이미지를 입력으로 읽지 않습니다. Python의 `python-docx`를 사용하는 기존 제작 코드입니다. 프로젝트 루트는 코드 자신의 위치로 찾도록 조정했습니다. 작업 폴더를 바꾸거나 `.tmp-docs`를 비워도 임시 경로를 입력으로 요구하지 않습니다.

현재 수업용 결과물은 프로젝트의 `output/pdf/`와 `output/앱_역전파_숫자예제.docx`에 별도로 유지합니다. 이 정리에서는 문서를 다시 생성하거나 PDF로 변환하지 않았습니다. 필요할 때 위 코드로 Word를 만든 뒤 기존 문서 도구로 PDF·검수 이미지를 재생성할 수 있습니다.

원본 복사 시의 해시는 [보존 목록](../../verification/current-release-20261022/preservation-manifest.json)에 기록했습니다. Python 코드의 이후 변경은 프로젝트 루트/출력 위치와 필요한 출력 폴더 생성뿐이며, 편집 원본은 변경하지 않았습니다.
