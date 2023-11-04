
document.addEventListener('DOMContentLoaded', function() {
    var getLocationBtn = document.getElementById('loc-btn');
    var ipDisplay = document.getElementById('ip-address');
    const topbar = document.querySelector(".top-bar");
    let mainpage = document.getElementById("main-page")
    let infopage = document.querySelector(".info-page");

    function pageload (){
      console.log(1);
      mainpage.style.display = "none";
      infopage.style.display = "block";
    }
    getLocationBtn.addEventListener('click', pageload);

    getLocationBtn.addEventListener('click', getUserLocation);

    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
          } else { 
            x.innerHTML = "Geolocation is not supported by this browser.";
          }
    }
      
      function showPosition(position) {
        const latlog = document.createElement("div");
        latlog.className = "lat-log"
        latlog.innerHTML = "Latitude: " + position.coords.latitude + 
        "<br>Longitude: " + position.coords.longitude;
        getCityName(position.coords.latitude,position.coords.longitude );
        topbar.appendChild(latlog);

       
      }

    

      function getCityName(lat, lng) {
        console.log(lat, lng);
        mapslocation (lat , lng);
        const API = `2ccd5c8c30994042ab5ea8a8e20a7439`
        const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API}`;
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            
            if (data.results && data.results.length > 0) {
               
              const city = data.results[0];
              console.log(data.results);
              
            
              if (city) {
                showcitydetails(city.components);
                showinfo (city.annotations, city.components);
                
                
                
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


      function showcitydetails(city){
        const cityname = document.createElement("div");
        cityname.className = "cityname";
        cityname.innerHTML = `<p> City: ${city.city}</p>
                             <p> Region: ${city.suburb}</p>

                             `;
        topbar.appendChild(cityname); 
        

      }

      const mapsdiv = document.querySelector(".maps");
      
      function mapslocation (lat , lng){
        const maps = document.createElement("div");
        maps.className = "mapsloc";
        maps.innerHTML= `<iframe src="https://maps.google.com/maps?q=${lat}, ${lng}&z=15&output=embed" 
        width="80%" 
        height="500" 
        frameborder="0" 
        style="border:0">
        </iframe>`

        mapsdiv.appendChild(maps);
      }


      const moreinfo = document.querySelector(".more-info");

      function showinfo (info, city){
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
        timezone.className= "timezone";
        timezone.innerHTML = `<p> Time Zone: ${info.timezone.name} </p>
                              <p> Date & Time ${formattedDate}</p>
                              <p> Pincode: ${postcode}
                              <p> Message: Number of pincode(s) found:20'`;
        moreinfo.appendChild(timezone);

      }
      





      
        
      let userIP;
        // Get user's IP address on page load
        fetch('https://api64.ipify.org?format=json')
          .then(response => response.json())
          .then(data => {
           userIP = data.ip;
            console.log('User IP Address:', userIP);
          });
      
        // Assuming you have a button element with id "getInfoBtn"
        const getInfoBtn = document.getElementById('getInfoBtn');
      
        getInfoBtn.addEventListener('click', () => {
          // Hit the API endpoint and process the JSON response
          fetch(`https://ipapi.co/${userIP}/json/`)
            .then(response => response.json())
            .then(data => {
              // Process the data here
              console.log('API Response:', data);
      
              // Extract pincode and send a request to the postal API
              const pincode = data.postal;
              fetch(`https://api.postalpincode.in/pincode/${pincode}`)
                .then(response => response.json())
                .then(postalData => {
                  console.log(postalData);
                  // Process postal data and display post offices on the page
                  const postOfficesList = document.getElementById('postOffices');
                  postOfficesList.innerHTML = ''; // Clear previous results
      
                  if (postalData[0].Status === 'Success') {
                    const postOffices = postalData[0].PostOffice;
      
                    // Display post offices on the page
                    postOffices.forEach(postOffice => {
                      const listItem = document.createElement('div');
                      listItem.className = "postcard"
                      listItem.innerHTML = `<p>${postOffice.Name} </p> <p> ${postOffice.BranchType} </p>
                                            <p>${postOffice.DeliveryStatus} </p>
                                            <p> ${postOffice.District}</p>
                                            <p> ${postOffice.Division}</p>`;
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
        });
      
        // Assuming you have an input element with id "searchBox"
        const searchBox = document.getElementById('searchBox');
      
        // Event listener for input changes in the search box
        searchBox.addEventListener('input', () => {
          const query = searchBox.value;
          function filterPostOffices(query) {
            const postOffices = Array.from(document.querySelectorAll('#postOffices li'));
          
            // Convert query to lowercase for case-insensitive matching
            const lowercaseQuery = query.toLowerCase();
          
            postOffices.forEach(postOffice => {
              const text = postOffice.textContent.toLowerCase();
              // Check if the post office name or branch office contains the query
              const isMatch = text.includes(lowercaseQuery);
          
              // Show or hide the post office based on the match
              if (isMatch) {
                postOffice.style.display = 'block'; // Show the post office
              } else {
                postOffice.style.display = 'none'; // Hide the post office
              }
            });
          }
        });
      
        // // Function to filter post offices based on user input
        // function filterPostOffices(query) {
        //   // Implement logic to filter post offices based on query
        // }
     
      










});





