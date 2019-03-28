const UTIL = require('../util/util');
const CONFIG = require('../config');
const DATA = require('../data/data');
const { Carousel, BrowseCarousel, Image, Suggestions } = require('actions-on-google');
const REQUEST = require('request');
const SESSION_UTIL = require('../util/sessionUtil');

module.exports = {
  searchResort: (queryObj/*{checkin_date,checkout_date,location}*/,
    sessionID, agent, buildResponse, resolve) => {
    REQUEST.get(CONFIG.api_endpoint, function (error, response, body) {
      const data = JSON.parse(body);
      let resorts = data.resort_details;
      const checkin = queryObj.checkin_date.split('T')[0];
      const checkout = queryObj.checkout_date.split('T')[0];
      let richConvList = [], convList = [];

      //Search resorts in location
      let temp = [];
      for (let i = 0; i < resorts.length; i++) {
        let resort = resorts[i];
        if (resort.location.toLowerCase() == queryObj.location.toLowerCase()) {
          temp.push(resorts[i]);
        }
      }
      resorts = temp;

      let resort_list = [], resort_list_script = '';
      let startIndex = 0;
      if (!UTIL.isEmpty(SESSION_UTIL.getSession(sessionID, 'startResortIndex'))) {
        startIndex = SESSION_UTIL.getSession(sessionID, 'startResortIndex');
      }
      for (let i = startIndex; i < startIndex + CONFIG.searchResortPagination_count && i < resorts.length; i++) {
        let resort = resorts[i];
        let item = UTIL.buildBrowserCarouselItem(`#${resort.resort_code}`,
          resort.resort_name,
          resort.image,
          'https://www.rci.com/resort-directory/resortDetails?resortCode=2512',
          resort.location);
        resort_list.push(item);
        resort_list_script += `${resort.resort_name} at ${resort.location}, `;
        SESSION_UTIL.setSession(sessionID, 'startResortIndex', SESSION_UTIL.getSession(sessionID, 'startResortIndex') + 1);
      }

      let response_arr = [
        `These are the resorts available between ${checkin} and ${checkout}:`,
        `You can choose among the following hotels for your date starting from ${checkin} to ${checkout}:`
      ];
      if (!UTIL.isEmpty(resort_list)) {
        if (startIndex === 0) {
          let msg = UTIL.getRandomMessage(response_arr);
          richConvList.push(msg);
          convList.push(msg);
        }
        else {
          let msg = `Here are ${resort_list.length} more resorts for you.`;
          richConvList.push(msg);
          convList.push(msg);
        }
        richConvList.push(new BrowseCarousel({
          items: resort_list
        }));
        richConvList.push(new Suggestions(['Show more', 'Search resorts in Hawaii']));
        convList.push(resort_list_script);
      }
      else {
        let msg = 'Sorry, no more resorts available.';
        richConvList.push(msg);
        richConvList.push(new Suggestions(['Search resorts in Hawaii', 'Upcoming vacations']));
      }

      buildResponse(agent, richConvList, convList);
      resolve();
    })
      .on('error', function (err) {
        console.log(err);
      });
  }
}