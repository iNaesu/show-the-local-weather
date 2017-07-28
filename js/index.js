/* Globals ---------------------------------------------------------- */

var tempUnits = 'C';

/* Function definitions --------------------------------------------- */

function display_error(errorMsg) {
  $('#content').html('<h1>:(</h1>');
  $('#content').append('<h6>' + errorMsg + '</h6>');
}

function c_to_f(tempC) {
  return Math.round(tempC * (9 / 5) + 32);
}

function build_weather_object(jsonData) {
  const weather = new Object();

  weather.tempC = Math.round(jsonData.main.temp);
  weather.tempF = c_to_f(weather.tempC)
  
  weather.tempMaxC = Math.round(jsonData.main.temp_max);
  weather.tempMaxF = c_to_f(weather.tempMaxC)
  
  weather.tempMinC = Math.round(jsonData.main.temp_min);
  weather.tempMinF = c_to_f(weather.tempMinC)
  
  weather.location = jsonData.name;
  weather.humidity = Math.round(jsonData.main.humidity);
  weather.description = jsonData.weather[0].description;

  weather.lat = jsonData.coord.lat; 
  weather.lon = jsonData.coord.lon;
  weather.sunset = jsonData.sys.sunset;
  weather.sunrise = jsonData.sys.sunrise;
    
  return weather;
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
  if ('geolocation' in navigator) {
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
  } else {
    display_error('Geolocation not supported');
  }
}

/* Start of script --------------------------------- */

run_weather_app();