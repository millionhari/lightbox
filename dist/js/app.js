'use strict';

var Slider = function () {
  var apiKey = 'c68800a17a432a39511ddfe44c78a500';
  var get = function get(url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function () {
        if (req.status === 200) {
          resolve(JSON.parse(req.response));
        }
        reject(req.statusText);
      };
      req.onerror = function (e) {
        return reject(Error('Network Error: ' + e));
      };
      req.send();
    });
  };
  // format data into sub-objects
  var createImageObjects = function createImageObjects(images, id) {
    // images.sizes.size.forEach((image) => {
    //   if (image.label === "Large");
    // })
    if (images.sizes.size.length > 8) {
      var medium = images.sizes.size[5].source;
      var large = images.sizes.size[8].source;
      var smallAndMedium = {
        id: id,
        medium: medium,
        large: large
      };
      return smallAndMedium;
    }
    return;
  };

  var log = function log(x) {
    console.log(x);
  };

  var fetchFromFlickr = function fetchFromFlickr() {
    var photoId = 29158094390;
    return Promise.resolve(get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&format=json&nojsoncallback=1&tags=patterns')).then(function (res) {
      var list = res.photos.photo.map(function (image) {
        return 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + apiKey + '&format=json&nojsoncallback=1&photo_id=' + image.id;
      });
      return list;
    }).then(function (list) {
      var newList = list.map(function (url) {
        return Promise.resolve(get(url)).then(function (res) {
          var images = res;
          var imageMap = createImageObjects(images, photoId);
          return imageMap;
        });
      });
      return Promise.all(newList);
    }).then(function (urls) {
      // Do whatever you urls here
      console.log(urls);
    });
  };

  var init = function init() {
    fetchFromFlickr();
  };

  return {
    init: init
  };
}();

Slider.init();