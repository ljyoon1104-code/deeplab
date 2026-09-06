# Deep Learning Lab

신경망의 원리로 배우는 고등학교 학생용 딥러닝 교육 웹앱입니다.

현재 P01 프로젝트 기반과 Lesson 01~12가 구현되어 있습니다. 홈에서 전체 차시를 확인할 수 있으며, 딥러닝 기초 원리, 실제 MNIST 모델 실습, 컴퓨터 비전·생성형 AI·음성 인식·자연어 처리에 이어 Lesson 12에서는 RNN 상태 전달, Attention, Transformer, 다음 단어 예측과 LLM의 관계를 조작하며 학습할 수 있습니다.

## Windows에서 실행하기

1. 저장소 루트의 `실행.bat`를 더블클릭합니다.
2. 필요한 패키지가 없으면 최초 한 번 자동으로 설치합니다.
3. 개발 서버가 준비되면 브라우저에서 `http://localhost:5173/deeplab/`이 열립니다.
4. 같은 서버가 이미 실행 중이면 기존 서버를 그대로 사용합니다.

명령줄에서 직접 실행하려면 Node.js 20.19 이상을 설치한 뒤 다음 명령을 사용합니다.

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

빌드 명령은 `tsc -b && vite build`이며, Vite 기본 경로는 `/deeplab/`입니다. 앱 라우팅에는 `HashRouter`를 사용합니다.
