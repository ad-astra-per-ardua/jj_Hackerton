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
    kakao.maps.event.addListener(marker, 'click', function() {
        const content = `
            <div style="padding:5px;">
                이름: ${restaurant.name} <br>
                메뉴: ${restaurant.menu} <br>
                가격: ${restaurant.price} <br>
                주소: ${restaurant.address} <br>
                <button onclick="getDirectionsToRestaurant({name: '${restaurant.name}', latitude: ${restaurant.latitude}, longitude: ${restaurant.longitude}})">길찾기</button>
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
        const startName = encodeURIComponent("내 위치");
        const endName = encodeURIComponent(restaurant.name);

        // Use Naver's map URL for directions
        const link = `https://map.naver.com/v5/directions/${startLat},${startLng},${startName}/${endLat},${endLng},${endName}`;
        window.location.href = link;
    } else {
        alert("사용자 위치를 먼저 설정해주세요.");
    }
}

