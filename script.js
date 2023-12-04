document.addEventListener('DOMContentLoaded', function() {
  const getLocationBtn = document.getElementById('loc-btn');
  const ipDisplay = document.getElementById('Ipadd');
  const topbar = document.querySelector(".top-bar");
  const mapsdiv = document.querySelector(".maps");
  const mainpage = document.getElementById("main-page");
  const infopage = document.querySelector(".info-page");
  const moreinfo = document.querySelector(".more-info");

  let city;
  let lat;
  let lng;
  let postOfficeFound;
  let userIP;

  function pageload() {
    mainpage.style.display = "none";
    infopage.style.display = "block";
  }

  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  getLocationBtn.addEventListener('click', pageload);
  getLocationBtn.addEventListener('click', getUserLocation);

  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      userIP = data.ip;
      console.log('User IP Address:', userIP);
      ipDisplay.innerHTML = `<h1>Your Current IP Address: ${userIP}</h1>`;
    });

  function getCityName(lat, lng) {
    const API = `2ccd5c8c30994042ab5ea8a8e20a7439`;
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          city = data.results[0];
          console.log(data.results);

          if (city) {
            showcitydetails(city.components);
            showpostoffice(city.annotations, city.components);
          } else {
            console.log('City not found for the given coordinates.');
          }
        } else {
          console.log('Error occurred while fetching data.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function showPosition(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    getCityName(lat, lng);
  }

  function showcitydetails(city) {
    console.log(city);

    const latlog = document.createElement("div");
    latlog.className = "lat-log";
    latlog.innerHTML = `
      <div class="top-bar">
        <p>IP Address ${userIP}</p>
        <div class="city-info">
          <div>
            <p>Lat: ${lat}</p>
            <p>Long: ${lng}</p>
          </div>
          <div>
            <p>City: ${city.state_district}</p>
            <p>Region: ${city.suburb}</p>
          </div>
          <div>
            <p>Organisation:</p>
            <p>Hostname:</p>
          </div>
        </div>
      </div>`;

    mapsdiv.innerHTML = `
      <h1>Your Current Location</h1>
      <div class="mapsloc">                            
        <iframe src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed" 
                width="80%" 
                height="600" 
                frameborder="0" 
                style="border:0">
        </iframe>
      </div>`;

    topbar.appendChild(latlog);
  }

  function showpostoffice(info, city) {
    fetch(`https://ipapi.co/${userIP}/json/`)
      .then(response => response.json())
      .then(data => {
        console.log('API Response:', data);

        const pincode = data.postal;
        fetch(`https://api.postalpincode.in/pincode/${pincode}`)
          .then(response => response.json())
          .then(postalData => {
            console.log(postalData);
            console.log(postalData[0].Message);
            postOfficeFound = postalData[0].Message;

            var currentDate = new Date();
            var options = {
              timeZone: 'Asia/Kolkata',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            };

            const postcode = city.postcode;

            var formattedDate = new Intl.DateTimeFormat('en-IN', options).format(currentDate);

            const timezone = document.createElement("div");
            timezone.className = "timezone";
            timezone.innerHTML = `
              <p> Time Zone: ${info.timezone.name} </p>
              <p> Date & Time ${formattedDate}</p>
              <p> Pincode: ${postcode}</p>
              <p> Message:  ${postOfficeFound}'`;

            moreinfo.appendChild(timezone);

            const postOfficesList = document.getElementById('postOffices');
            postOfficesList.innerHTML = '';

            if (postalData[0].Status === 'Success') {
              const postOffices = postalData[0].PostOffice;

              postOffices.forEach(postOffice => {
                const listItem = document.createElement('div');
                listItem.className = "postcard";
                listItem.innerHTML = `
                  <p>${postOffice.Name}</p>
                  <p>${postOffice.BranchType}</p>
                  <p>${postOffice.DeliveryStatus}</p>
                  <p>${postOffice.District}</p>
                  <p>${postOffice.Division}</p>`;

                postOfficesList.appendChild(listItem);
              });
            } else {
              postOfficesList.innerHTML = 'No post offices found for this pincode.';
            }
          })
          .catch(error => {
            console.error('Error fetching postal data:', error);
            const postOfficesList = document.getElementById('postOffices');
            postOfficesList.innerHTML = 'Error fetching postal data.';
          });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }

  // Event listener for input changes in the search box
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', () => {
    const query = searchBox.value;
    filterPostOffices(query);
  });

  function filterPostOffices(query) {
    const postOffices = Array.from(document.querySelectorAll('#postOffices .postcard'));

    const lowercaseQuery = query.toLowerCase();

    postOffices.forEach(postOffice => {
      const text = postOffice.textContent.toLowerCase();
      const isMatch = text.includes(lowercaseQuery);

      if (isMatch) {
        postOffice.style.display = 'block';
      } else {
        postOffice.style.display = 'none';
      }
    });
  }
});
