const { Carousel, Image, BrowseCarouselItem, BasicCard, Button } = require('actions-on-google');

/*
  @desc: Checks whether the Object is empty or not
  @val: The Object to check
  @return: True if empty
*/
const isEmpty = function (val) {
  if (val === '' ||
    val === undefined || val === 'undefined' ||
    val === null ||
    (Object.keys(val).length === 0 && val.constructor === Object) ||
    (Array.isArray(val) && val.length === 0)) {
    return true;
  }
  return false;
}

/*
  @desc: Checks whether the device has a display screen or not
  @conv: The conv attribute of the agent
  @return: True if it has display screen
*/
const hasScreenOutput = function (conv) {
  return conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
};


module.exports = {
  
  getRandomMessage: (arr) => {
    if (arr.length === 1) {
      return arr[0];
    }
    var index = (Math.floor(Math.random() * 100)) % arr.length;
    return arr[index];
  },

  isEmpty: isEmpty,

  hasScreenOutput: hasScreenOutput,

  /*
    @desc: Builds a simplified Dialogflow response for Google Home/Assistant
    @agent: The WebhookClient agent
    @richConvList: An array consisting of rich responses supported by Google Assistant (Carousel, Card, Suggestions, etc)
    @convList: An array consisting of simple responses supported by Google Home
  */
  buildResponse: (agent, richConvList, convList) => {
    let conv = agent.conv();
    //If the device is Audio-Visual capable
    if (!isEmpty(conv) && hasScreenOutput(conv)) {
      for (let i in richConvList) {
        conv.ask(richConvList[i]);
      }
      agent.add(conv);
    }
    //If the device is only Audio capable
    else {
      for (let i in convList) {
        agent.add(convList[i]);
      }
    }
  },

  sortByDateAsc: (arr, date_attr) => {
    arr.sort(function (date1, date2) {
      return date1[date_attr].getTime() - date2[date_attr].getTime();
    });
    return arr;
  },

  buildCarouselItem: (obj, key, title, desc, image) => {
    obj[key] = {
      title: title,
      description: desc,
      image: new Image({
        url: image,
        alt: `${key} - ${title}`
      })
    };
    return obj;
  },

  buildBrowserCarouselItem: (title, desc, image, url, footer) => {
    return new BrowseCarouselItem({
      title: title,
      url: url,
      description: desc,
      image: new Image({
        url: image,
        alt: title,
      }),
      footer: footer,
    });
  },

  buildCardItem: (title, subtitle, desc, button_title, button_url, image) => {
    return new BasicCard({
      title: title,
      subtitle: subtitle,
      text: desc,
      buttons: new Button({
        title: button_title,
        url: button_url,
      }),
      image: new Image({
        url: image,
        alt: title,
      }),
      display: 'CROPPED',
    });
  },

  fetchSessionID: (request) => {
    //request.body.session: projects/small-talk-48f2f/agent/sessions/82fb4463-40c8-f2b3-e3c1-fb773e958bba
    if (!isEmpty(request.body.session)) {
      let arr = request.body.session.split('/');
      return arr[arr.length - 1];
    }
  }


};