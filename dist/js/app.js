'use strict';

var Slider = function () {
  var apiKey = 'c68800a17a432a39511ddfe44c78a500';
  var app = document.body.querySelector('.app');

  // DOM Nodes
  var lightbox = document.body.querySelector('.lightbox');
  var lightboxCloseButton = document.body.querySelector('.lightbox__button-close');
  var lightboxPrevButton = document.body.querySelector('.lightbox__button-prev');
  var lightboxNextButton = document.body.querySelector('.lightbox__button-next');
  var lightboxImage = document.body.querySelector('.lightbox__image');

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
  var createImageObjects = function createImageObjects(images) {
    if (images.sizes.size.length > 8) {
      var small = images.sizes.size[4].source;
      var medium = images.sizes.size[5].source;
      var large = images.sizes.size[8].source;
      var smallMediumLarge = {
        small: small,
        medium: medium,
        large: large
      };
      return smallMediumLarge;
    }
    return;
  };

  var renderLightbox = function renderLightbox(node, imageSizes, prev, next) {
    node.onclick = function () {
      // Close Button
      lightboxCloseButton.onclick = function () {
        lightbox.classList.add('hide');
      };
      // Previous and Next Button
      // TODO: MOVE BUTTONS TO PROMISE
      if (typeof prev === 'undefined') {
        lightboxPrevButton.classList.add('hide');
      } else {
        lightboxPrevButton.classList.remove('hide');
      }
      if (typeof next === 'undefined') {
        lightboxNextButton.classList.add('hide');
      } else {
        lightboxNextButton.classList.remove('hide');
      }

      lightboxPrevButton.onclick = function () {
        lightboxImage.src = prev.large;
      };
      lightboxNextButton.onclick = function () {
        lightboxImage.src = next.large;
      };
      console.log('prev', prev);
      console.log('next', next);
      lightboxImage.src = imageSizes.large;
      lightbox.classList.remove('hide');
    };
  };

  var renderThumbnails = function renderThumbnails(imageSizes) {
    var img = document.createElement('img');
    img.src = imageSizes.small;
    img.classList.add('thumbnailImage');
    return img;
  };

  // TODO - EXTRA CREDIT: build out custom search params with a default of "patterns"
  var fetchFromFlickr = function fetchFromFlickr() {
    return Promise.resolve(get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&format=json&nojsoncallback=1&text=patterns&sort=relevance')).then(function (res) {
      var list = res.photos.photo.map(function (image) {
        return 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + apiKey + '&format=json&nojsoncallback=1&photo_id=' + image.id;
      });
      return list;
    }).then(function (list) {
      var newList = list.map(function (url) {
        return Promise.resolve(get(url)).then(function (res) {
          var images = res;
          var imageMap = createImageObjects(images);
          return imageMap;
        });
      });
      return Promise.all(newList);
    }).then(function (urls) {
      var imageContainer = document.createElement('div');
      imageContainer.classList.add('images');
      // Work with urls here
      urls.forEach(function (imageSizes, index, arr) {
        if (typeof imageSizes !== 'undefined') {
          var img = renderThumbnails(imageSizes);
          renderLightbox(img, imageSizes, arr[index - 1], arr[index + 1]);
          imageContainer.appendChild(img);
        }
      });
      app.appendChild(imageContainer);
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