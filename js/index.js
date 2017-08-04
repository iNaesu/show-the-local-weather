/* Globals  ----------------------------------------------------------------- */

let tempUnits = 'C';
const apiKey = 'AIzaSyAJweTA4a_krVKkipVQ1DtVu4DYjnr44dA';

const themesLUT = [
  /* Default */
  {
    'keywords': ['default'],
    'weatherIconClass': 'wi wi-moon-full',
    'day_bg_color': 'white',
    'day_fg_color': 'black',
    'night_bg_color': 'white',
    'night_fg_color': 'black',
  },
  /* Clear */
  {
    'keywords': ['clear', 'sun'],
    'weatherIconClass': 'wi wi-moon-full',
    'day_bg_color': '#4B95B7',
    'day_fg_color': '#F5EA2B',
    'night_bg_color': '#091216',
    'night_fg_color': '#FBF6AA',
  },
  /* Cloud */
  {
    'keywords': ['cloud', 'overcast'],
    'weatherIconClass': 'wi wi-cloudy',
    'day_bg_color': '#739BAA',
    'day_fg_color': '#FFF',
    'night_bg_color': '#1C262A',
    'night_fg_color': '#AAA',
  },
  /* Fog */
  {
    'keywords': ['fog', 'mist', 'smog', 'smoke', 'haze'],
    'weatherIconClass': 'wi wi-fog',
    'day_bg_color': '#BBAFC3',
    'day_fg_color': '#38343A',
    'night_bg_color': '#2C292E',
    'night_fg_color': '#BBAFC3',
  },
  /* Rain */
  {
    'keywords': ['rain', 'drizzl', 'shower', 'pour', 'wet', 'sprinkle'],
    'weatherIconClass': 'wi wi-showers',
    'day_bg_color': '#4C91C6',
    'day_fg_color': '#FFF',
    'night_bg_color': '#162B3B',
    'night_fg_color': '#B7D3E8',
  },
  /* Storm */
  {
    'keywords': ['storm', 'thunder', 'lightning'],
    'weatherIconClass': 'wi wi-storm-showers',
    'day_bg_color': '#111',
    'day_fg_color': '#FFF36A',
    'night_bg_color': '#111',
    'night_fg_color': '#FFF36A',
  },
  /* Snow */
  {
    'keywords': ['snow', 'hail', 'blizzard', 'sleet', 'ice'],
    'weatherIconClass': 'wi wi-snow',
    'day_bg_color': '#EAF6FF',
    'day_fg_color': '#77B5E5',
    'night_bg_color': '#EAF6FF',
    'night_fg_color': '#476C89',
  },
];


/* Function Declarations ---------------------------------------------------- */

/**
 * Display error message
 * @param {'string'} errorMsg
 */
function displayError(errorMsg) {
  $('#weather-icon').removeClass().addClass('fa fa-frown-o');
  $('#error-msg').html(`<h6>Error | ${errorMsg}</h6>`);
}

/**
 * Returns a jqXhr object from freeCodeCamp weather API.
 * URL: https://fcc-weather-api.glitch.me
 * @param {Coord} coords
 * @return {jqXhr} jqXhr object from a weather web API
 */
function getWeather(coords) {
  const endpoint =
    'https://fcc-weather-api.glitch.me/api/current?lat=' + coords.lat +
    '&lon=' + coords.lon;

  return $.ajax({
    url: endpoint,
    dataType: 'jsonp',
    timeout: 10000,
  });
}

/**
 * Returns a timezone jqXhr object from a Google Time Zone API
 * URL: https://developers.google.com/maps/documentation/timezone/start
 * @param {Coord} coords
 * @param {number} unixTime
 * @return {jqXhr} jqXhr object from Google Time Zone API
 */
function getTimezone(coords, unixTime) {
  const endpoint = 'https://maps.googleapis.com/maps/api/timezone/json?location='
                 + coords.lat + ',' + coords.lon + '&timestamp=' + unixTime +
                 '&key=' + apiKey;
  return $.ajax({
    url: endpoint,
    timeout: 10000,
  });
}

/**
 * Convert and return temperature from celsius to fahrenheit
 * @param {number} tempC - Temperature in celsius
 * @return {number}
 */
function celsiusToFahrenheit(tempC) {
  return Math.round(tempC * (9 / 5) + 32);
}

/**
 * Builds a weather object from response from freeCodeCamp weather API.
 * URL: https://fcc-weather-api.glitch.me
 * @constructor
 * @param {weatherResponse} weatherResponse - Response from the freeCodeCamp
 *                                            weather API.
 */
function Weather(weatherResponse) {
  const w = weatherResponse[0];

  this.tempC = Math.round(w.main.temp);
  this.tempF = celsiusToFahrenheit(this.tempC);

  this.tempMaxC = Math.round(w.main.temp_max);
  this.tempMaxF = celsiusToFahrenheit(this.tempMaxC);

  this.tempMinC = Math.round(w.main.temp_min);
  this.tempMinF = celsiusToFahrenheit(this.tempMinC);

  this.nameOfPlace = w.name;
  this.humidity = Math.round(w.main.humidity);
  this.description = w.weather[0].description;

  this.sunset = w.sys.sunset;
  this.sunrise = w.sys.sunrise;
}

/**
 * Builds a timezone object from response from Google Timezone API.
 * URL: https://developers.google.com/maps/documentation/timezone/start
 * @param {timezoneResponse} timezoneResponse
 * @param {number} unixTime
 */
function Timezone(timezoneResponse, unixTime) {
  this.daylightSavingsOffset = timezoneResponse[0].dstOffset;
  this.rawOffset = timezoneResponse[0].rawOffset;
  this.unixTime = unixTime;
}

/**
 * Callback once geolocation is obtained.
 * @param {Coord} coords
 */
function getGeolocationCb(coords) {
  /* Get weather data */
  const weatherXhr = getWeather(coords);
  /* Get timezone data */
  const d = new Date();
  const unixTime = Math.round(d.getTime() / 1000);
  const timezoneXhr = getTimezone(coords, unixTime);

  /* Handle getWeather and getTimezone errors */
  weatherXhr.fail(function(error) {
    displayError('getWeather: ' + error.status + ', ' + error.statusText);
  });
  timezoneXhr.fail(function(error) {
    displayError('getTimezone: ' + error.status + ', ' + error.statusText);
  });

  /* Successfully got weather and timezone data. Process and display data. */
  $.when(weatherXhr, timezoneXhr).done(
    function(weatherResponse, timezoneResponse) {
      /* Construct a weather object */
      const weatherData = new Weather(weatherResponse);
      /* Construct a timezone object */
      const timezoneData = new Timezone(timezoneResponse, unixTime);
      /* Display app */
      displayApp(weatherData, timezoneData);
    }
  );
}

/**
 * Builds a coordinates object.
 * @constructor
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function Coord(lat, lon) {
  this.lat = lat;
  this.lon = lon;
}

/**
 * Get coordinates. Tries to detect HTML5 geolocation but falls back to a
 * constant geolocation if unavailable.
 * @param {function} callback
 */
function getGeolocation(callback) {
  /**
   * Detect HTML5 geolocation
   * @reject - Browser does not have geolocation or an error occured fetching
   *           geolocation
   * @resolve - Successfully detected HTML5 geolocation
   */
  const detectGeolocation = new Promise(
    function(resolve, reject) {
      /* Check if browser has geolocation */
      if (!('geolocation' in navigator)) {
        reject();
      }

      /* Try to get detect current HTML coordinates */
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };
      navigator.geolocation.getCurrentPosition(
        function(positionData) { // Success cb
          resolve(positionData);
        },
        function() { // Error cb
          reject();
        },
        options
      );
    }
  );

  /* Run callback function with detected/hardcoded geolocation */
  detectGeolocation
    .then(function(positionData) {
      /* Promise resolved. Use HTML5 geolocation coords */
      const lat = positionData.coords.latitude;
      const lon = positionData.coords.longitude;
      const coords = new Coord(lat, lon);
      callback(coords);
    })
    .catch(function() {
      /* Promise rejected. Use harcoded Manhattan coordinates */
      const coords = new Coord(40.7851, -73.9682);
      callback(coords);
    });
}

/**
 * Display the temperature control button.
 * @param {Weather} weatherData
 * @param {Timezone} timezoneData
 */
function tempControl(weatherData, timezoneData) {
  /* Only bind one click handler */
  $('#temp-control').text('°' + tempUnits).off('click').on('click', function() {
    /* Toggle temp units */
    if (tempUnits === 'C') {
      tempUnits = 'F';
    } else if (tempUnits === 'F') {
      tempUnits = 'C';
    } else {
      displayError('Invalid temperature unit');
    }
    /* Change text on temp control button */
    $('#temp-control').text('°' + tempUnits);

    /* Redisplay updated temperature info */
    displayWeather(weatherData, tempUnits, timezoneData);
  });
}

/**
 * Display weather data.
 * @param {Weather} weatherData
 * @param {string} tempUnits - Temperature units ('C' or 'F')
 * @param {Timezone} timezoneData
 */
function displayWeather(weatherData, tempUnits, timezoneData) {
  if ((tempUnits !== 'C') && (tempUnits !=='F')) {
    displayError('Invalid temperature unit');
    return;
  }

  let temp;
  let tempMax;
  let tempMin;

  if (tempUnits === 'C') {
    temp = weatherData.tempC;
    tempMax = weatherData.tempMaxC;
    tempMin = weatherData.tempMinC;
  } else if (tempUnits === 'F') {
    temp = weatherData.tempF;
    tempMax = weatherData.tempMaxF;
    tempMin = weatherData.tempMinF;
  }

  /* Apply theme */
  applyTheme(themesLUT, weatherData, timezoneData);

  /* Current temp at location*/
  $('#temp-location')
    .text(temp).append('°' + tempUnits)
    .append('&nbsp;in&nbsp;' + weatherData.nameOfPlace);

  /* Weather description */
  $('#weather-main').text(weatherData.description);

  /* Max temp */
  $('#temp-max-icon').addClass('fa fa-long-arrow-up');
  $('#temp-max').text(tempMax + '°' + tempUnits);

  /* Min temp */
  $('#temp-min-icon').addClass('fa fa-long-arrow-down');
  $('#temp-min').text(tempMin + '°' + tempUnits);

  /* humidity */
  $('#humidity-icon').addClass('fa fa-tint');
  $('#humidity').text(weatherData.humidity + '%');
}

/**
 * Display local time.
 * @param {Timezone} timezoneData
 */
function displayLocalTime(timezoneData) {
  const unixTime = timezoneData.unixTime;
  /* Total offset in minutes */
  const totalOffsetInMin =
    (timezoneData.daylightSavingsOffset + timezoneData.rawOffset) / 60;

  const time = moment(unixTime.toString(), 'X')
    .utcOffset(totalOffsetInMin).format('h:mm A');
  const date = moment(unixTime.toString(), 'X')
    .utcOffset(totalOffsetInMin).format('ddd D MMM YYYY');

  $('#time').text(time);
  $('#date').text(date);
}

/**
 * Set colors of the Google search box drop down panel.
 * @param {string} bgColor
 * @param {string} fgColor
 */
function setSearchBoxDropdownColors(bgColor, fgColor) {
  $('.pac-container')
    .css('background-color', fgColor)
    .css('color', bgColor);
}

/**
 * Apply theme (weather icon, color scheme) based on the current time and
 * weather.
 * @param {array} themesLUT
 * @param {Weather} weatherData
 * @param {number} timezoneData
 */
function applyTheme(themesLUT, weatherData, timezoneData) {
  const weatherDescription = weatherData.description;
  const sunrise = weatherData.sunrise;
  const sunset = weatherData.sunset;
  const unixTime = timezoneData.unixTime;

  /* Default theme colors */
  let weatherIconClass = themesLUT[0].weatherIconClass;
  let fgColor = themesLUT[0].day_fg_color;
  let bgColor = themesLUT[0].day_bg_color;

  /* Search LUT for theme that has weatherDescription in the theme keywords */
  for (let i = 0; i < themesLUT.length; i++) {
    for (let j = 0; j < themesLUT[i].keywords.length; j++) {
      if (weatherDescription.indexOf(themesLUT[i].keywords[j]) !== -1) {
        /* Set weather icon */
        weatherIconClass = themesLUT[i].weatherIconClass;

        /* Set color scheme based on whether time is before/after sunset */
        if (
          (unixTime < sunrise) ||
          ((unixTime > sunset) && (unixTime < (sunrise + 60 * 60 * 24)))
        ) {
          /* Use night theme */
          fgColor = themesLUT[i].night_fg_color;
          bgColor = themesLUT[i].night_bg_color;
        } else {
          /* Use day theme */
          fgColor = themesLUT[i].day_fg_color;
          bgColor = themesLUT[i].day_bg_color;
        }
      }
    }
  }

  /* Set weather Icon */
  $('#weather-icon').removeClass().addClass(weatherIconClass);

  /* Set bg and fg colors */
  $('body').css('color', fgColor).css('background-color', bgColor);
  /* Temp control colors */
  $('#temp-control').css('color', bgColor).css('background-color', fgColor);
  /* Google search box colors */
  $('#location-search')
    .css('color', bgColor).css('background-color', fgColor);

  /* Google dropdown colors */
  setSearchBoxDropdownColors(bgColor, fgColor);
}

/**
 * Display weather app.
 * @param {Weather} weatherData
 * @param {Timezone} timezoneData
 */
function displayApp(weatherData, timezoneData) {
  /* Temperature control */
  tempControl(weatherData, timezoneData);

  /* Weather data */
  displayWeather(weatherData, tempUnits, timezoneData);

  /* Display local time */
  displayLocalTime(timezoneData);

  /* Display location search box */
  $('#location-search').css('display', 'block');
  $('#search-icon').css('display', 'block');

  /* Clear error msg */
  $('#error-msg').text('');
}


/**
 * Get the coordinates of a user input location and call a callback function
 * using the coordinates.
 * @param {function} callback
 */
function locationSearch(callback) {
  /* Clear text when textbox is selected */
  $('#location-search:text')
    .on('focus', function() {
      $(this).val('');
    })
    .on('click', function() {
      $(this).val('');
    });

  /* Link search box to google maps API */
  const input = document.getElementById('location-search');
  const searchBox = new google.maps.places.SearchBox(input);

  /* Get coordinates of the location via Google Geocode API */
  searchBox.addListener('places_changed', function() {
    /* Show loading spinner */
    showSpinner();

    const places = searchBox.getPlaces();
    if (places.length === 0) {
      /* Invalid place name */
      return;
    }

    /* Call Google Geocode API */
    const nameOfPlace = places[0].formatted_address.replace(' ', '+');
    const endpoint = 'https://maps.googleapis.com/maps/api/geocode/' +
                   'json?address=' + nameOfPlace + '&key=' + apiKey;
    $.ajax({
      url: endpoint,
      timeout: 10000,
      success: function(locationData) {
        const lat = locationData.results[0].geometry.location.lat;
        const lon = locationData.results[0].geometry.location.lng;
        const coords = new Coord(lat, lon);
        callback(coords);
      },
      error: function(error) {
        displayError(
          'locationSearch: ' + error.status + ', ' + error.statusText
        );
      },
    });
  });
}

/**
 * Show spinner.
 */
function showSpinner() {
  $('#weather-icon').removeClass().addClass('fa fa-cog fa-spin');
}


/* Start of script ---------------------------------------------------------- */

$(document).ready(function() {
  /* Show loading spinner */
  showSpinner();
  /* Get geolocation */
  getGeolocation(getGeolocationCb);
  /* Init location search box */
  locationSearch(getGeolocationCb);
});
