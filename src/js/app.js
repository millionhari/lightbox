const Slider = (() => {
  const apiKey = 'c68800a17a432a39511ddfe44c78a500';
  const app = document.body.querySelector('.app');

  // DOM Nodes
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image__container');
  const lightbox = document.body.querySelector('.lightbox');
  const lightboxCloseButton = document.body.querySelector('.lightbox__button-close');
  const lightboxPrevButton = document.body.querySelector('.lightbox__button-prev');
  const lightboxNextButton = document.body.querySelector('.lightbox__button-next');
  const lightboxImage = document.body.querySelector('.lightbox__image');
  const searchInput = document.body.querySelector('.search__input');
  const searchSubmitButton = document.body.querySelector('.search__button-submit');
  let input = '';

  const get = (url) => new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = () => {
      if (req.status === 200) {
        resolve(JSON.parse(req.response));
      }
      reject(req.statusText);
    };
    req.onerror = (e) => reject(Error(`Network Error: ${e}`));
    req.send();
  });

  // format data into sub-objects
  const createImageObjects = (images) => {
    if (images.sizes.size.length > 8) {
      const small = images.sizes.size[4].source;
      const medium = images.sizes.size[5].source;
      const large = images.sizes.size[8].source;
      const smallMediumLarge = {
        small,
        medium,
        large
      };
      return smallMediumLarge;
    }
    return;
  };

  const filterButtons = (arr, index, previousButton, nextButton) => {
    if (index === 0) {
      previousButton.classList.add('hide');
    } else if (index === arr.length - 1) {
      nextButton.classList.add('hide');
    } else {
      previousButton.classList.remove('hide');
      nextButton.classList.remove('hide');
    }
  };

  const renderLightbox = (node, index, arr) => {
    node.onclick = () => {
      let position = index;
      // Close Button
      lightboxCloseButton.onclick = () => {
        lightbox.classList.add('hide');
      };
      // Previous and Next Button
      lightboxPrevButton.onclick = () => {
        position--;
        filterButtons(arr, position, lightboxPrevButton, lightboxNextButton);
        lightboxImage.src = arr[position].large;
      };
      lightboxNextButton.onclick = () => {
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

  const renderThumbnails = (imageSizes) => {
    const img = document.createElement('img');
    img.src = imageSizes.small;
    img.classList.add('thumbnailImage');
    return img;
  };

  const fetchFromFlickr = (query) => Promise.resolve(get(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&format=json&nojsoncallback=1&text=${query}&sort=relevance`))
    .then((res) => {
      const list = res.photos.photo.map((image) =>
       `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&format=json&nojsoncallback=1&photo_id=${image.id}`);
      return list;
    })
    .then((list) => {
      const newList = list.map((url) =>
        Promise.resolve(get(url))
        .then((res) => {
          const images = res;
          const imageMap = createImageObjects(images);
          return imageMap;
        })
      );
      return Promise.all(newList);
    })
    .then((urls) => {
      // Work with urls here
      urls = urls.filter((x) => typeof x !== 'undefined');
      urls.forEach((imageSizes, index, arr) => {
        if (typeof imageSizes !== 'undefined') {
          const thumbnails = renderThumbnails(imageSizes);
          const thumbnailsWithLightBox = renderLightbox(thumbnails, index, arr);
          imageContainer.appendChild(thumbnailsWithLightBox);
        }
      });
      app.appendChild(imageContainer);
    });

  const clearImages = () => {
    while (imageContainer.hasChildNodes()) {
      imageContainer.removeChild(imageContainer.lastChild);
    }
  };

  const initSearch = () => {
    searchSubmitButton.onclick = () => {
      input = searchInput.value;
      searchInput.value = '';
      clearImages();
      fetchFromFlickr(input);
    };
  };

  const init = () => {
    initSearch();
    fetchFromFlickr('patterns');
  };

  return {
    init
  };
})();

Slider.init();
