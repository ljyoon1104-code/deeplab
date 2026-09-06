# MNIST 데이터 출처

## Dataset

MNIST Handwritten Digit Database

## Original dataset

- Yann LeCun
- Corinna Cortes
- Christopher J. C. Burges
- Derived from NIST handwritten digit datasets

## CSV conversion

- Joseph Redmon
- MNIST in CSV

## Source page

https://pjreddie.com/projects/mnist-in-csv/

원본 CSV 다운로드:

- Train: https://data.pjreddie.com/files/mnist_train.csv
- Test: https://data.pjreddie.com/files/mnist_test.csv

## Educational subset

Deep Learning Lab에서 웹 실습을 위해 원본 Train과 Test에서 숫자 0~9를 균형 있게 추출한 교육용 subset입니다.

- 원본 Train과 원본 Test를 합치거나 다시 분할하지 않았습니다.
- Train은 숫자별 50/100/200/500개를 사용하여 500/1,000/2,000/5,000개 subset을 만들었습니다.
- Test는 원본 Test에서 숫자별 50개, 총 500개를 사용했습니다.
- 고정 seed 20260904로 클래스별 Fisher-Yates shuffle을 한 번만 수행하고 앞부분을 사용했습니다.
- JSON의 pixel은 정규화하지 않은 원본 0~255 정수입니다.
- Kaggle 배포본이나 Kaggle API는 사용하지 않았습니다.
