function navigateToDetail(restaurantName) {
    console.log("navigateToDetail called with:", restaurantName);  // 이 부분 추가
    window.location.href = `/detail/${restaurantName}/`;
}

