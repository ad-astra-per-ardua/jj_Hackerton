# hackerton
[![CodeQL](https://github.com/d982h8st7/hackerton/actions/workflows/CodeQL.yaml/badge.svg)](https://github.com/d982h8st7/hackerton/actions/workflows/CodeQL.yaml) [![Codacy Security Scan](https://github.com/d982h8st7/hackerton/actions/workflows/codacy.yml/badge.svg)](https://github.com/d982h8st7/hackerton/actions/workflows/codacy.yml)
## 제주 스마트관광 빅데이터 해커톤 장려상 수상
### 본인 구현 파트
- 착한식당API와 관광지API를 Crawling해와 데이터 전처리과정을 거치고, DB에 Parsing해서 넣음.
- Naver Geocoding API를 이용하여 도로명 주소를 위도,경도값으로 변환하여 DB에 Update.
- 처음 웹 로딩시, 여행지와 DB에 있는 음식점을 모두 로딩하여 지도에 Marker로 표시.
- 위치 받아오는 버튼 클릭시, 사용자의 위치를 받아와 Haversine Formula를 이용하여 최단거리 3개를 list에 표시.
- 사용자의 마커를 Draggable하게 만들어서 기준위치를 유동적으로 변화할수있게 만듦.
- 목적지의 마커를 누르면 해당 음식점 상세보기 혹은 길 안내하기 표시가 뜸.
- 길 안내하기 클릭시 해당 음식점의 변환된 위,경도값을 불러와 Naver Dynamicmap15 API를 이용하여 해당 목적지까지의 네이버 길찾기 서비스를 제공.
- 화면크기가 일정사이즈 이하일시 모바일임을 감지하고, 모바일 길찾기로 redirecting하는 로직 추가.


### 기획단계에 있었지만, 시간상 구현을 마치지못한것.
- 네이버 쇼핑몰의 리뷰 10만개의 Tokenizer한 긍정,부정반응을 학습한 NLP모델을 사용하여, 해당 음식점의 유저평가와 AI의 긍정,평범,부정 평가를 추가
- 상기한 NLP모델로 해당리뷰가 악성리뷰인지 자체적으로 검증을 하고 조치를 취함으로서 항상 높은 신뢰성의 리뷰를 유지할수있음
