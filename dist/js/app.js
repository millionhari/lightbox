'use strict';

var Slider = function () {
  var apiKey = 'c68800a17a432a39511ddfe44c78a500';
  var app = document.body.querySelector('.app');

  // DOM Nodes
  var imageContainer = document.createElement('div');
  var lightbox = document.body.querySelector('.lightbox');
  var lightboxCloseButton = document.body.querySelector('.lightbox__button-close');
  var lightboxPrevButton = document.body.querySelector('.lightbox__button-prev');
  var lightboxNextButton = document.body.querySelector('.lightbox__button-next');
  var lightboxImage = document.body.querySelector('.lightbox__image');
  var searchInput = document.body.querySelector('.search__input');
  var searchSubmitButton = document.body.querySelector('.search__button-submit');
  var input = '';
  imageContainer.classList.add('image__container');

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

  var filterButtons = function filterButtons(arr, index, previousButton, nextButton) {
    if (index === 0) {
      previousButton.classList.add('hide');
    } else if (index === arr.length - 1) {
      nextButton.classList.add('hide');
    } else {
      previousButton.classList.remove('hide');
      nextButton.classList.remove('hide');
    }
  };

  var renderLightbox = function renderLightbox(node, index, arr) {
    node.onclick = function () {
      var position = index;
      // Close Button
      lightboxCloseButton.onclick = function () {
        lightbox.classList.add('hide');
      };
      // Previous and Next Button
      lightboxPrevButton.onclick = function () {
        position--;
        filterButtons(arr, position, lightboxPrevButton, lightboxNextButton);
        lightboxImage.src = arr[position].large;
      };
      lightboxNextButton.onclick = function () {
        position++;
        filterButtons(arr, position, lightboxPrevButton, lightboxNextButton);
        lightboxImage.src = arr[position].large;
      };
      filterButtons(arr, position, lightboxPrevButton, lightboxNextButton);
      lightboxImage.src = arr[index].large;
      lightbox.classList.remove('hide');
    };
    return node;
  };

  var renderThumbnails = function renderThumbnails(imageSizes) {
    // const img = document.createElement('img');
    // img.src = imageSizes.small;
    // img.style.width = 'auto';
    // img.style.height = '200px';
    // img.classList.add('thumbnail__image');
    var thumbnail = document.createElement('div');
    thumbnail.style.backgroundImage = 'url(\'' + imageSizes.small + '\')';
    thumbnail.classList.add('image__thumbnail--container');
    return thumbnail;
  };

  var fetchFromFlickr = function fetchFromFlickr(query) {
    return Promise.resolve(get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&format=json&nojsoncallback=1&text=' + query + '&sort=relevance')).then(function (res) {
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
      // Work with urls here
      urls = urls.filter(function (x) {
        return typeof x !== 'undefined';
      });
      urls.forEach(function (imageSizes, index, arr) {
        if (typeof imageSizes !== 'undefined') {
          var thumbnails = renderThumbnails(imageSizes);
          var thumbnailsWithLightBox = renderLightbox(thumbnails, index, arr);
          imageContainer.appendChild(thumbnailsWithLightBox);
        }
      });
      app.appendChild(imageContainer);
    });
  };

  var clearImages = function clearImages() {
    while (imageContainer.hasChildNodes()) {
      imageContainer.removeChild(imageContainer.lastChild);
    }
  };

  var initSearch = function initSearch() {
    searchSubmitButton.onclick = function () {
      input = searchInput.value;
      searchInput.value = '';
      clearImages();
      fetchFromFlickr(input);
    };
  };

  var init = function init() {
    initSearch();
    fetchFromFlickr('patterns');
  };

  return {
    init: init
  };
}();

Slider.init();