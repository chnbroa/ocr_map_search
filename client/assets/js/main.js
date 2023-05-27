function loadMapScript() {
  const apiKey = "";
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
  script.defer = true;
  document.body.appendChild(script);
}
// console.log(key.googleApiKey);

// Define the initialization function.
function initMap() {
  const mapElement = document.getElementById("map");
  const address = mapElement.dataset.address;
  console.log(address);

  // Create a Geocoder object.
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: address }, (results, status) => {
    if (status === 'OK') {
      if (results.length > 0) {
        // Get the latitude and longitude of the first result
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();

        // Display the map
        const map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: lat, lng: lng },
          zoom: 12
        });
        const marker = new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: map,
          title: address
        });
        console.log(`Latitude: ${lat}`);
        console.log(`Longitude: ${lng}`);
      } else {
        console.log('No results found.');
      }
    } else {
      console.log(`Geocode failed: ${status}`);
    }
  });
}


function information(data) {
  const name = document.querySelector('.name p');
  const gender = document.querySelector('.gender p');
  const birth = document.querySelector('.birth p');
  const address = document.querySelector('.address p');
  const phone = document.querySelector('.phone p');

  name.innerHTML = data['성명'];
  gender.innerHTML = data['성별'];
  birth.innerHTML = data['생년월일'];
  address.innerHTML = data['주소'];
  phone.innerHTML = data['연락처'];
}



window.onload = function () {
  const imageInput = document.querySelector('input[type="file"]');

  // 카메라 버튼
  $(".camera_search").click(function () {
    $("#photoFile").click();
  });

  // 사진 선택 후
  $("#photoFile").on('change', function () {
    // 파일명만 추출
    if (window.FileReader) {  // modern browser
      var filename = $(this)[0].files[0].name;
    } else {  // old IE
      var filename = $(this).val().split('/').pop().split('\\').pop();  // 파일명만 추출
    }

    console.log("파일사이즈 : " + $(this)[0].files[0].size);
    console.log("파일명 : " + filename);
    console.log($(this));



    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    // Send a POST request to the Flask server with the FormData object
    fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData

    })
      .then(response => response.json())
      .then(data => {
        console.log(data);

        const mapElement = document.getElementById("map");
        mapElement.setAttribute("data-address", data['주소']);
        loadMapScript();

        information(data);

      })
      .catch(error => {
        console.error('Error sending image:', error);
      });
  });
};
