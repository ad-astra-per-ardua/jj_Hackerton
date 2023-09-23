var userMarkerPosition;
var markerClicked = false;
var mapContainer = document.getElementById('map');
var mapDiv = document.getElementById('map');
var mapOptions = {
    center: new naver.maps.LatLng(33.499621,126.531188),
    zoom:10
}
var map = new naver.maps.Map('map',mapOptions);


var trafficLayer = new naver.maps.TrafficLayer({
    interval : 300000
})
var btn = $('#traffic')


var openedInfowindow = null;

function createMarkerWithInfo(restaurant, map) {
    const position = new naver.maps.LatLng(restaurant.latitude, restaurant.longitude);
    const marker = new naver.maps.Marker({
        position: position,
        title: restaurant.name,
        map: map
    });

    // 인포 윈도우 컨텐츠
    const content = `
        <div style="text-align: center; border-radius: 10px 10px 10px 10px;padding: 10px;">
            <img src="${restaurant.image}" alt="${restaurant.name}" width="100">
            <h3 style="font-size: 16px;padding-bottom: 5px;margin: 10px 0;">${restaurant.name}</h3>
            <p style="font-size:12px; color: #333">메뉴: ${restaurant.menu}</p>
            <p style="font-size:12px; color: #333">주소: ${restaurant.address}</p>
            <p style="font-size:12px; color: #333">전화번호: ${restaurant.phone}</p>
            <button onclick="getDirectionsToRestaurant({name: '${restaurant.name}', latitude: ${restaurant.latitude}, longitude: ${restaurant.longitude}})">길찾기</button>
        </div>
    `;

    const infowindow = new naver.maps.InfoWindow({
        content: content
    });

    naver.maps.Event.addListener(marker, 'click', function() {
        if (openedInfowindow) {  // 이미 열린 정보창이 있다면
            openedInfowindow.close();  // 그 정보창을 닫는다
        }
        infowindow.open(map, marker);  // 새 정보창을 연다
        openedInfowindow = infowindow;  // 새로 열린 정보창을 저장한다
    });
}

// 지도를 클릭했을 때의 이벤트
naver.maps.Event.addListener(map, 'click', function() {
    if (openedInfowindow) {  // 이미 열린 정보창이 있다면
        openedInfowindow.close();  // 그 정보창을 닫는다
        openedInfowindow = null;  // 열린 정보창 변수를 초기화한다
    }
});




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

            const position = new naver.maps.LatLng(data.latitude, data.longitude);
            const marker = new naver.maps.Marker({
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
        userMarkerPosition = new naver.maps.LatLng(latitude, longitude);

        if (userMarker) {
            userMarker.setPosition(userMarkerPosition);
        } else {
            userMarker = new naver.maps.Marker({
                position: userMarkerPosition,
                map: map,
                icon: {
                    url: 'https://icons.iconarchive.com/icons/emey87/trainee/16/Gps-icon.png',
                    scaledSize: new naver.maps.Size(25, 25)
                },
                draggable: true
            });
            naver.maps.Event.addListener(userMarker, 'dragend', function() {
                userMarkerPosition = userMarker.getPosition();
            });
        }
        map.setCenter(userMarkerPosition);
        map.setZoom(17)
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

                polylinePath = [];

                data.data.route.traoptimal[0].path.forEach( (data, index) => {
                    polylinePath.push( new naver.maps.LatLng( data[0], data[1] ) )
                })

                console.log( polylinePath )

                var polyline = new naver.maps.Polyline({
                    path: polylinePath,      //선 위치 변수배열
                    strokeColor: '#FF0000', //선 색 빨강 #빨강,초록,파랑
                    strokeOpacity: 0.8, //선 투명도 0 ~ 1
                    strokeWeight: 6,   //선 두께
                    map: map           //오버레이할 지도
                });

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

    // 현재 위치를 가져와서 경로를 찾는 함수 호출
    getCurrentLocation();

    showAllRestaurants();
});