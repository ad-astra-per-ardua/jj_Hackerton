var userMarkerPosition;
var end_x = 126.972559;
var end_y = 37.555062;
var markerClicked = false;
var mapContainer = document.getElementById('map');
var mapDiv = document.getElementById('map');

var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(33.4773085, 126.3628347),
    zoom: 12,
    mapTypes: new naver.maps.MapTypeRegistry({
    'normal': naver.maps.NaverStyleMapTypeOptions.getNormalMap({
      overlayType: 'bg.ol.ts.ctt.lko'
    })
  })
});

var openedInfowindow = null;

function createMarkerWithInfo(restaurant, map) {
    const position = new naver.maps.LatLng(restaurant.latitude, restaurant.longitude);
    const marker = new naver.maps.Marker({
        position: position,
        title: restaurant.name,
        map: map
    });



    // 인포 윈도우 컨텐츠 (상세보기 버튼 추가)
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
        if (openedInfowindow) {
            openedInfowindow.close();
        }
        infowindow.open(map, marker);
        openedInfowindow = infowindow;
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
        let restaurants = data.restaurants;

        if (userMarkerPosition) {
            const userLat = 33.4775864;
            const userLng = 126.3622851;

            restaurants.forEach(restaurant => {
              restaurant.distance = calculateDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
            });

            restaurants.sort((a, b) => a.distance - b.distance);

            restaurants = restaurants.slice(0, 3);
        }

        // 선택된 레스토랑을 지도에 표시
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
    // 위치 권한이 없다는 것을 가정하고 미리 정의한 위도, 경도
    const defaultLatitude = 33.4775506;
    const defaultLongitude = 126.3606329;

    // 미리 정의한 위도, 경도를 사용하여 마커와 맵 설정
    userMarkerPosition = new naver.maps.LatLng(defaultLatitude, defaultLongitude);

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

        // 마커를 드래그 했을 때의 이벤트 핸들러
        naver.maps.Event.addListener(userMarker, 'dragend', function() {
            var newPosition = userMarker.getPosition();
            var newLat = newPosition.lat();
            var newLon = newPosition.lng();
            showNearestRestaurants(newLat, newLon);
        });
    }

    // 맵 중앙을 마커 위치로 설정하고, 줌 레벨을 조정
    map.setCenter(userMarkerPosition);
    map.setZoom(17);
    showNearestRestaurants(defaultLatitude, defaultLongitude);
}




function getDirectionsToRestaurant(restaurant) {
    if (userMarkerPosition) {
        const startLat = userMarkerPosition.lat();
        const startLng = userMarkerPosition.lng();
        const endLat = restaurant.latitude;
        const endLng = restaurant.longitude;
        const is_mobile = isMobile();

        console.log(is_mobile);

        $.ajax({
            url: `/route_link/`,
            type: "GET",
            data: {
                start_x: startLng,
                start_y: startLat,
                end_x: endLng,
                end_y: endLat,
                mobile: is_mobile,
            },
            success: function(data) {
                if (data.result === "success") {
                    window.open(data.route_url, '_blank');
                } else {
                    alert('길찾기를 실패했습니다.');
                }
            }
        });
    } else {
        alert("사용자 위치를 먼저 설정해주세요.");
    }
}

//사용자의 접속 클라이언트 확인
function isMobile() {
    //화면의 너비가 768 픽셀 미만이면 모바일로 간주
    if(window.innerWidth <= 768){
        result = 1
    }else{
        result = 0
    }
    return result;
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            start_x = pos.lng;
            start_y = pos.lat;
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
            } else {
            }
        }
    });
}


// Haversine

function toRadians(degree) {
    return degree * (Math.PI / 180);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return distance;
}

function showNearestRestaurants(userLat, userLon) {
  fetch('/api/get_all_restaurants/')
    .then(response => response.json())
    .then(data => {

      const restaurants = data.restaurants;
      for (const restaurant of restaurants) {
        restaurant.distance = calculateDistance(userLat, userLon, restaurant.latitude, restaurant.longitude);
      }

      restaurants.sort((a, b) => a.distance - b.distance);
      const nearestRestaurants = restaurants.slice(0, 3);
      let listHTML = "";
      console.log(nearestRestaurants);
      for (const restaurant of nearestRestaurants) {
        listHTML += `
            <div class="ms-2 me-auto">
              <div class="fw-bold">${restaurant.name}</div>
              ${restaurant.menu}
            </div>
            <div class="btn-group mt-2" role="group">
              <button type="button" class="btn btn-primary detail-button" onclick="navigateToDetail('${restaurant.name}')">상세보기</button>
              <button type="button" class="btn btn-outline-primary" onclick="addTravelPlan()">경로에 추가</button>
              </button>
            </div>
          </a>
        `;
      }
      document.querySelector('.list-group').innerHTML = listHTML;
    });
}


function getCurrentPositionAsync() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function addTravelPlan(restaurantName) {
  const plannedTime = prompt("계획한 시간을 입력하세요:", "");
  if (plannedTime !== null) {
    fetch('/api/save_plan/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken  // Django의 CSRF 토큰
      },
      body: JSON.stringify({ restaurantName: restaurantName , plannedTime: plannedTime })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        alert("");
      } else {
        alert("계획이 저장되었습니다!");
      }
    })
      .catch(error => {
            alert("서버나 네트워크 문제가 발생했습니다.");
        });
  }
}




document.addEventListener("DOMContentLoaded", function() {
  getCurrentLocation();
  showAllRestaurants();
    document.body.addEventListener("click", function(event) {
        if (event.target.classList.contains("detail-button")) {
            const restaurantId = event.target.getAttribute("data-id");
            if (restaurantId) {
                navigateToDetail(restaurantName);
            } else {
                console.error("restaurantId가 정의되지 않았습니다.");
            }
        }
    });
});



// tourism section


