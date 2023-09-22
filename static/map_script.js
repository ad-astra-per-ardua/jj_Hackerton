var userMarkerPosition;
var mapContainer = document.getElementById('map');
var mapOption = {
    center: new kakao.maps.LatLng(37.50802, 127.062835),
    level: 3
};
var map = new kakao.maps.Map(mapContainer, mapOption);

var infowindow = new kakao.maps.InfoWindow({zIndex:1});

function createMarkerWithInfo(restaurant, map) {
    const position = new kakao.maps.LatLng(restaurant.latitude, restaurant.longitude);
    const marker = new kakao.maps.Marker({
        position: position,
        title: restaurant.name
    });

    // 마커에 클릭 이벤트를 등록합니다.
    console.log("Creating marker with info");
    kakao.maps.event.addListener(marker, 'click', function() {
    const content = `
        <div style="padding:5px;">
            이름: ${restaurant.name} <br>
            메뉴: ${restaurant.menu} <br>
            주소: ${restaurant.address} <br>
            <button onclick="getDirectionsToRestaurant({name: '${restaurant.name}', latitude: ${restaurant.latitude}, longitude: ${restaurant.longitude}})">네이버 길찾기</button>
        </div>
    `;
    infowindow.setContent(content);
    infowindow.open(map, marker);
});

    marker.setMap(map);
}

function showAllRestaurants() {
    fetch(`/api/get_all_restaurants/`)
    .then(response => response.json())
    .then(data => {
        const restaurants = data.restaurants;
        for (const restaurant of restaurants) {
            createMarkerWithInfo(restaurant, map);
        }
    });
}

function addMarkerByAddress(address) {
    fetch(`/api/geocode/?address=${address}`)
    .then(response => response.json())
    .then(data => {
        if (data.latitude && data.longitude) {
            document.getElementById("latitudeResult").innerText = data.latitude;
            document.getElementById("longitudeResult").innerText = data.longitude;

            const position = new kakao.maps.LatLng(data.latitude, data.longitude);
            const marker = new kakao.maps.Marker({
                position: position
            });
            marker.setMap(map);
        } else {
            alert("주소를 변환할 수 없습니다.");
        }
    });
}

var userMarker;
function showUserLocation() {
    if (!navigator.geolocation) {
        alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.");
        return;
    }

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        userMarkerPosition = new kakao.maps.LatLng(latitude, longitude);

        if (userMarker) {
            userMarker.setPosition(userMarkerPosition);
        } else {
            userMarker = new kakao.maps.Marker({
                position: userMarkerPosition,
                image: new kakao.maps.MarkerImage(
                    'https://icons.iconarchive.com/icons/emey87/trainee/16/Gps-icon.png',
                    new kakao.maps.Size(24, 24),
                    { offset: new kakao.maps.Point(12, 12) }
                ),
                draggable: true
            });
            userMarker.setMap(map);
            kakao.maps.event.addListener(userMarker, 'dragend', function() {
                userMarkerPosition = userMarker.getPosition();
            });
        }
        map.setCenter(userMarkerPosition);
    }

    function error() {
        alert("위치 정보를 가져올 수 없습니다.");
    }
    navigator.geolocation.getCurrentPosition(success, error);
}

function getDirectionsToRestaurant(restaurant) {
    if (userMarkerPosition) {
        const startLat = userMarkerPosition.getLat();
        const startLng = userMarkerPosition.getLng();
        const endLat = restaurant.latitude;
        const endLng = restaurant.longitude;

        fetch(`/create_naver_directions_link/?start_latitude=${startLat}&start_longitude=${startLng}&end_latitude=${endLat}&end_longitude=${endLng}`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response: ", data);
            if (data.result === 'success') {
                window.open(data.link, '_blank');
            } else {
                alert('길찾기를 실패했습니다.');
            }
        });
    } else {
        alert("사용자 위치를 먼저 설정해주세요.");
    }
}


function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            // 현재 위치를 출발지로 설정
            start_x = pos.lng;
            start_y = pos.lat;
            // 경로를 찾는 함수 호출
            findRoute(start_x, start_y, end_x, end_y);
        });
    }
}

function findRoute(start_x, start_y, end_x, end_y) {
    // Django의 route_link 함수를 호출
    $.ajax({
        url: "/route_link/",
        type: "GET",
        data: {
            start_x: start_x,
            start_y: start_y,
            end_x: end_x,
            end_y: end_y
        },
        success: function(data) {
            if (data.result === "success") {
                // 경로 정보를 활용하는 코드 (예: 지도에 경로 표시)
            } else {
                // 에러 처리
            }
        }
    });
}
// 페이지 로드가 완료되면 실행
$(document).ready(function() {
    // 목적지는 미리 설정되어 있다고 가정 (예: 서울역)
    end_x = 126.972559;
    end_y = 37.555062;

    // 현재 위치를 가져와서 경로를 찾는 함수 호출
    getCurrentLocation();
});