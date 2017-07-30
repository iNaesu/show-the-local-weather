var tempUnits = 'C';

/* Function definitions --------------------------------------------- */

function display_error(errorMsg) {
  $('#content').html('<h1>:(</h1>');
  $('#content').append('<h6>' + errorMsg + '</h6>');
}

function display_temp_data(weather, tempUnits) {
  if ((tempUnits !== 'C') && (tempUnits !=='F')) {
    display_error('Invalid temperature unit');
    return;
  }
  
  var temp;
  var tempMax;
  var tempMin;
  
  if (tempUnits === 'C') {
    temp = weather.tempC;
    tempMax = weather.tempMaxC;
    tempMin = weather.tempMinC;
  } else if (tempUnits === 'F') {
    temp = weather.tempF;
    tempMax = weather.tempMaxF;
    tempMin = weather.tempMinF;  
  }
  
  /* Current temp */
  $('#temp').text(temp);
  $('#temp-unit').text('°' + tempUnits);
  
  /* Max temp */
  $('#temp-max-icon').addClass('fa fa-long-arrow-up');
  $('#temp-max').text(tempMax + '°' + tempUnits);
  
  /* Min temp */
  $('#temp-min-icon').addClass('fa fa-long-arrow-down');
  $('#temp-min').text(tempMin + '°' + tempUnits);
  
  return;
}

function display_control_panel(weather) {
  /* Temp control */
  $('#temp-control').text('°' + tempUnits).click(function() {
    /* Toggle temp units */
    if (tempUnits === 'C') {
      tempUnits = 'F';
    } else if (tempUnits === 'F') {
      tempUnits = 'C';
    } else {
      display_error('Invalid temperature unit');
    }
    
    /* Change text on temp control button */
    $('#temp-control').text('°' + tempUnits);
    
    /* Update temp data */
    display_temp_data(weather, tempUnits);
  });
}

function get_icon_from_weather_desc(description, keyWords, iconName) {
  for (var i = 0; i < keyWords.length; i++) {
    if (description.indexOf(keyWords[i]) !== -1) {
      return iconName;
    }
  }
  return; 
}

function display_weather_icon(weather) {
  var iconName = '';
  var keyWords = [];
  
  do {
    /* Clear weather */
    var keyWords = ['clear', 'sun'];
    iconName = get_icon_from_weather_desc(
      weather.description, keyWords, 'moon-full'
    );
    if (iconName) break;
    
    /* Cloudy */
    var keyWords = ['cloud', 'overcast'];
    iconName = get_icon_from_weather_desc(
      weather.description, keyWords, 'cloudy'
    );
    if (iconName) break;
    
    /* Fog */
    var keyWords = ['fog', 'mist', 'smog', 'smoke'];
    iconName = get_icon_from_weather_desc(
      weather.description, keyWords, 'fog'
    );
    if (iconName) break;
    /* Rain */  
    var keyWords = ['rain', 'drizzl', 'shower', 
                    'pour', 'wet', 'sprinkle'];
    iconName = get_icon_from_weather_desc(
      weather.description, keyWords, 'showers'
    );
    if (iconName) break;
    
    /* Storm */
    var keyWords = ['storm', 'thunder', 'lightning'];
    iconName = get_icon_from_weather_desc(
      weather.description, keyWords, 'storm-showers'
    );
    if (iconName) break;
    
    /* Snow */
    var keyWords = ['snow', 'hail', 'blizzard', 'sleet', 'ice'];
    iconName = get_icon_from_weather_desc(
      weather.description, keyWords, 'snow'
    );
    if (iconName) break;
    
  } while (0);

  var weatherStr = `wi wi-${iconName}`;
  $('#weather-icon').addClass(weatherStr);
  return iconName;
}

function set_bg(color) {
  $('body').css('background-color', color);
  $('#temp-control').css('color', color);
}

function set_fg(color) {
  $('body').css('color', color);
  $('#temp-control').css('background-color', color);
}

function set_color_scheme(weather, iconName) {
  switch(iconName) {
    case 'moon-full':
      /* TODO: Implement night/day colour schemes */
      set_bg('#5EBBE5');
      set_fg('#F5EA2B');
      break;
    case 'cloudy':
      set_bg('#90C2D5');
      set_fg('#FFF');
      break;
    case 'fog':
      set_bg('#BBAFC3');
      set_fg('#38343A');
      break;
    case 'showers':
      set_bg('#4C91C6');
      set_fg('#FFF');
      break;
    case 'storm-showers':
      set_bg('#2C3338');
      set_fg('#FFF36A');
      break;
    case 'snow':
      set_bg('#EAF6FF');
      set_fg('#77B5E5');
      break;
    default:
      display_error(iconName + ' is not a valid weather icon name');
  }
}

function display_ui(jsonData) {
  
  var weather = build_weather_object(jsonData);
  
  var iconName = display_weather_icon(weather);

  set_color_scheme(weather, iconName);

  display_control_panel(weather);

  display_temp_data(weather, tempUnits);
  
  /* Display Location */
  $('#location').html('&nbsp;in&nbsp;' + weather.location);
  /* Weather description */
  $('#weather-main').text(weather.description);
  /* Humidity */
  $('#humidity-icon').addClass('fa fa-tint');
  $('#humidity').text(weather.humidity + '%');

  /* TODO: Get local time in another function */
  var time = moment().format('h:mm A');
  var date = moment().format('ddd D MMM YYYY');
  $('#time').text(time);
  $('#date').text(date);
}

function get_weather_at_position(position) {
  var endpoint =
    'https://fcc-weather-api.glitch.me/api/current?lat=' +
    position.coords.latitude +
    '&lon=' +
    position.coords.longitude;
  
  $.ajax({
    url: endpoint,
    dataType: 'jsonp',
    jsonpCallback: 'display_ui',
    timeout: 5000,
    error: function(parsedJson, textStatus) {
      var errorMsg = `GET WEATHER DATA | STATUS: ${parsedJson.status}, 
                     ERROR: ${textStatus}`;
      display_error(errorMsg);
    }
  });
}

function run_weather_app() {
  /* Get Geolocation */
  if (!('geolocation' in navigator)) {
    display_error('Geolocation not supported');
  }
  var options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };
  navigator.geolocation.getCurrentPosition(
    get_weather_at_position,
    function(error) {
      display_error(error.message);
    },
    options
  );
}

/* Function Declarations ---------------------------------------------------- */

/**
 * Display error message
 * @param {'string'} errorMsg
 */
function display_error(errorMsg) {
  $('#content').html('<h1>:(</h1>');
  $('#content').append('<h6>' + errorMsg + '</h6>');
}

/**
 * Returns a jqXhr object from a weather web API
 * @param {Coord} coords
 * @return {jqXhr} jqXhr object from a weather web API
 */
function getWeather(coords) {
  var endpoint =
    'https://fcc-weather-api.glitch.me/api/current?lat=' + coords.lat + 
    '&lon=' + coords.lon;
  
  return $.ajax({
    url: endpoint,
    dataType: 'jsonp',
    timeout: 2500
  });
}

/**
 * Returns a jqXhr object from a local time web API
 * @param {Coord} coords
 * @param {number} unixTime
 * @return {jqXhr} jqXhr object from a local time web API
 */
function getLocalTime(coords, unixTime) {
  var apiKey = 'AIzaSyAJweTA4a_krVKkipVQ1DtVu4DYjnr44dA';
  var endpoint = 'https://maps.googleapis.com/maps/api/timezone/json?location=' 
                 + coords.lat + ',' + coords.lon + '&timestamp=' + unixTime + 
                 '&key=' + apiKey;
  return $.ajax({
    url: endpoint
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
 * @param {} weatherResponse - Response from the freeCodeCamp
 *                             weather API.
 */
function weather(weatherResponse) {
  var w = weatherResponse[0];

  this.tempC = Math.round(w.main.temp);
  this.tempF = celsiusToFahrenheit(this.tempC)
  
  this.tempMaxC = Math.round(w.main.temp_max);
  this.tempMaxF = celsiusToFahrenheit(this.tempMaxC)
  
  this.tempMinC = Math.round(w.main.temp_min);
  this.tempMinF = celsiusToFahrenheit(this.tempMinC)
  
  this.nameOfPlace = w.name;
  this.humidity = Math.round(w.main.humidity);
  this.description = w.weather[0].description;

  this.sunset = w.sys.sunset;
  this.sunrise = w.sys.sunrise;
}

/**
 * Calculate local time from response from Google Timezone API.
 * URL: https://developers.google.com/maps/documentation/timezone/start
 * @param {localTimeResponse}
 * @param {number} unixTime
 * @return {number} localTime
 */
function calculateLocalTime(localTimeResponse, unixTime) {
  daylightSavingsOffset = localTimeResponse[0].dstOffset;
  rawOffset = localTimeResponse[0].rawOffset;

  return unixTime + daylightSavingsOffset + rawOffset;
}

/**
 * Callback for getGeolocation.
 * @param {Coord} coords
 */
function getGeolocationCb(coords) {
  /* Get weather */
  var weatherXhr = getWeather(coords);
  /* Get local time */
  var d = new Date();
  var unixTime = Math.round(d.getTime() / 1000);
  var localTimeXhr = getLocalTime(coords, unixTime);

  /* Handle getWeather and getLocalTime errors */
  weatherXhr.fail(function(error) {
    displayError('getWeather: ' + error.status + ', ' + error.statusText);
  });
  localTimeXhr.fail(function(error) {
    displayError('getLocalTime: ' + error.status + ', ' + error.statusText);
  });

  /* Successfully got weather and local time. Process and display data. */
  $.when(weatherXhr, localTimeXhr).done(
    function(weatherResponse, localTimeResponse) {
      /* Construct a weather object */
      var weatherData = new weather(weatherResponse);
      /* Calculate local time */
      var localTime = calculateLocalTime(localTimeResponse, unixTime);
      /* Display app */
      displayApp(weatherData, localTime);
    }
  );
}

/**
 * Get coordinates. Tries to detect HTML5 geolocation but falls back to a
 * constant geolocation if unavailable.
 * @param {getGeolocationCb} callback
 */
function getGeolocation(callback) {

  /**
   * Coordinates (latitude and longitude)
   * @typedef {object} Coord
   * @property {number} lat
   * @property {number} lon
   */
  var coords = new Object();
  coords.lat = null;
  coords.lon = null;
 
  /**
   * Detect HTML5 geolocation
   * @reject - Browser does not have geolocation or an error occured fetching
   *           geolocation 
   * @resolve - Successfully detected HTML5 geolocation
   */
  var detectGeolocation = new Promise(
    function(resolve, reject) {
      /* Check if browser has geolocation */
      if (!('geolocation' in navigator)) {
        reject();
      }

      /* Try to get detect current HTML coordinates */
      var options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      navigator.geolocation.getCurrentPosition(
        function(positionData) { //Success cb
          resolve(positionData);
        },
        function() { //Error cb
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
      coords.lat = positionData.coords.latitude;  
      coords.lon = positionData.coords.longitude;  
      callback(coords);
    })
    .catch(function() {
      /* Promise rejected. Use harcoded New York coordinates */
      coords.lat = 40.7128;
      coords.lon = 74.0059;
      callback(coords);
    });
}

/**
 * Display the temperature control button.
 * @param {Weather} weatherData
 */
function tempControl(weatherData) {
  /* Temp control */
  $('#temp-control').text('°' + tempUnits).click(function() {
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
   
    /* Re-display temperature data */
    displayTempData(weatherData, tempUnits);
  });
}

/**
 * Display temperature data.
 * @param {Weather} weatherData
 * @param {string} Temperature units ('C' or 'F')
 */
function displayTempData(weatherData, tempUnits) {
  if ((tempUnits !== 'C') && (tempUnits !=='F')) {
    displayError('Invalid temperature unit');
    return;
  }
  
  var temp;
  var tempMax;
  var tempMin;
  
  if (tempUnits === 'C') {
    temp = weatherData.tempC;
    tempMax = weatherData.tempMaxC;
    tempMin = weatherData.tempMinC;
  } else if (tempUnits === 'F') {
    temp = weatherData.tempF;
    tempMax = weatherData.tempMaxF;
    tempMin = weatherData.tempMinF;  
  }
  
  /* Current temp */
  $('#temp').text(temp);
  $('#temp-unit').text('°' + tempUnits);
  
  /* Max temp */
  $('#temp-max-icon').addClass('fa fa-long-arrow-up');
  $('#temp-max').text(tempMax + '°' + tempUnits);
  
  /* Min temp */
  $('#temp-min-icon').addClass('fa fa-long-arrow-down');
  $('#temp-min').text(tempMin + '°' + tempUnits);
}

/**
 * Display local time.
 * @param {number} localTime
 */
function displayLocalTime(localTime) {
  console.log(localTime);
  var time = moment(localTime.toString(), 'X').utcOffset(0).format('h:mm A');
  var date = moment(localTime.toString(), 'X')
    .utcOffset(0).format('ddd D MMM YYYY');
  $('#time').text(time);
  $('#date').text(date);
}

const themesLUT = [
  /* Default */
  {
    'keywords': ['default'],
    'weatherIconClass': 'wi wi-moon-full',
    'day_bg_color': 'white',
    'day_fg_color': 'black',
    'night_bg_color': 'white',
    'night_fg_color': 'black'
  },
  /* Clear */
  {
    'keywords': ['clear', 'sun'],
    'weatherIconClass': 'wi wi-moon-full',
    'day_bg_color': '#5EBBE5',
    'day_fg_color': '#F5EA2B',
    'night_bg_color': '#5EBBE5',
    'night_fg_color': '#F5EA2B'
  },
  /* Cloud */
  {
    'keywords': ['cloud', 'overcast'],
    'weatherIconClass': 'wi wi-cloudy',
    'day_bg_color': '#90C2D5',
    'day_fg_color': '#FFF',
    'night_bg_color': '#90C2D5',
    'night_fg_color': '#FFF'
  },
  /* Fog */
  {
    'keywords': ['fog', 'mist', 'smog', 'smoke'],
    'weatherIconClass': 'wi wi-fog',
    'day_bg_color': '#BBAFC3',
    'day_fg_color': '#38343A',
    'night_bg_color': '#BBAFC3',
    'night_fg_color': '#38343A'
  },
  /* Rain */
  {
    'keywords': ['rain', 'drizzl', 'shower', 'pour', 'wet', 'sprinkle'],
    'weatherIconClass': 'wi wi-showers',
    'day_bg_color': '#4C91C6',
    'day_fg_color': '#FFF',
    'night_bg_color': '#4C91C6',
    'night_fg_color': '#FFF'
  },
  /* Storm */
  {
    'keywords': ['storm', 'thunder', 'lightning'],
    'weatherIconClass': 'wi wi-storm-showers',
    'day_bg_color': '#2C3338',
    'day_fg_color': '#FFF36A',
    'night_bg_color': '#2C3338',
    'night_fg_color': '#FFF36A'
  },
  /* Snow */
  {
    'keywords': ['snow', 'hail', 'blizzard', 'sleet', 'ice'],
    'weatherIconClass': 'wi wi-snow',
    'day_bg_color': '#EAF6FF',
    'day_fg_color': '#77B5E5',
    'night_bg_color': '#EAF6FF',
    'night_fg_color': '#77B5E5'
  },
]

/**
 * Apply theme (weather icon, color scheme) based on the current time and
 * weather.
 * @param {array} themesLUT
 * @param {Weather} weatherData
 * @{number} localTime
 */
function applyTheme(themesLUT, weatherData, localTime) {
  var weatherDescription = weatherData.description; 
  var sunrise = weatherData.sunrise;
  var sunset = weatherData.sunset;

  /* Default theme colors */
  var weatherIconClass = themesLUT[0].weatherIconClass;
  var fg_color = themesLUT[0].day_fg_color;
  var bg_color = themesLUT[0].day_bg_color;
  
  /* Search LUT for theme that has weatherDescription in the theme keywords */
  for(let i = 0; i < themesLUT.length; i++) {
    for (let j = 0; j < themesLUT[i].keywords.length; j++) {
      if (weatherDescription.indexOf(themesLUT[i].keywords[j]) !== -1) {
        /* Set weather icon */
        weatherIconClass = themesLUT[i].weatherIconClass;

        /* Set color scheme based on whether time is before/after sunset */
        if ((localTime > sunrise) && (localTime < sunset)) {
          /* Use day theme */
          fg_color = themesLUT[i].day_fg_color;
          bg_color = themesLUT[i].day_bg_color;
        } else {
          /* Use night theme */
          fg_color = themesLUT[i].night_fg_color;
          bg_color = themesLUT[i].night_bg_color;
        }
      } 
    }
  }

  /* Set weather Icon */
  $('#weather-icon').addClass(weatherIconClass);
  /* Set bg and fb colors */
  $('body').css('background-color', bg_color);
  $('body').css('color', fg_color);
  $('#temp-control').css('background-color', fg_color);
  $('#temp-control').css('color', bg_color);
}

/**
 * Display weather app.
 * @param {Weather} weatherData
 * @param {number} localTime
 */
function displayApp(weatherData, localTime) {
  /* Temperature control & data*/
  tempControl(weatherData);
  /* Temperature data */
  displayTempData(weatherData, tempUnits);

  /* NameOfPlace */
  $('#location').html('&nbsp;in&nbsp;' + weatherData.nameOfPlace);
  /* Weather description */
  $('#weather-main').text(weatherData.description);

  /* humidity */
  $('#humidity-icon').addClass('fa fa-tint');
  $('#humidity').text(weatherData.humidity + '%');

  /* Display local time */
  displayLocalTime(localTime);

  /* Apply theme */
  applyTheme(themesLUT, weatherData, localTime);

  /* Display location search box */
}


/* Start of script ---------------------------------------------------------- */

/* Get geolocation */
getGeolocation(getGeolocationCb);
  
  
  
  
  
  
  
  
