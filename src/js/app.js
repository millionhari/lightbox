const Slider = (() => {
  const apiKey = 'c68800a17a432a39511ddfe44c78a500';
  const app = document.body.querySelector('.app');

  // DOM Nodes
  const imageContainer = document.createElement('div');
  const lightbox = document.body.querySelector('.lightbox');
  const lightboxCloseButton = document.body.querySelector('.lightbox__button--close');
  const lightboxPrevButton = document.body.querySelector('.lightbox__button--prev');
  const lightboxNextButton = document.body.querySelector('.lightbox__button--next');
  const lightboxImage = document.body.querySelector('.lightbox__image');
  const lightboxBackground = document.body.querySelector('.lightbox__background');
  const searchInput = document.body.querySelector('.search__input');
  const searchSubmitButton = document.body.querySelector('.search__button--submit');
  const spinner = document.body.querySelector('.spinner');
  let input = '';
  imageContainer.classList.add('image__container');

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
      const large = images.sizes.size[6].source;
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

  const hideLightbox = () => {
    lightbox.classList.add('hide');
    window.removeEventListener('keydown', keyControls);
  };

  const keyControls = (key) => {
    if (key.keyCode === 27) {
      hideLightbox();
    } else if (key.keyCode === 37 && lightboxPrevButton.classList[2] !== 'hide') {
      lightboxPrevButton.click();
    } else if (key.keyCode === 39 && lightboxNextButton.classList[2] !== 'hide') {
      lightboxNextButton.click();
    }
  };

  const renderLightbox = (node, index, arr) => {
    node.onclick = () => {
      let position = index;
      // Close Lightbox
      window.addEventListener('keydown', keyControls);
      lightboxCloseButton.onclick = () => {
        hideLightbox();
      };
      lightboxBackground.onclick = () => {
        hideLightbox();
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
    const thumbnail = document.createElement('div');
    thumbnail.style.backgroundImage = `url('${imageSizes.small}')`;
    thumbnail.classList.add('image__thumbnail--container');
    return thumbnail;
  };

  const fetchFromFlickr = (query) => {
    spinner.classList.remove('hide');
    return Promise.resolve(get(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&format=json&nojsoncallback=1&text=${query}&sort=relevance`))
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
      spinner.classList.add('hide');
      app.appendChild(imageContainer);
    });
  }

  const clearImages = () => {
    while (imageContainer.hasChildNodes()) {
      imageContainer.removeChild(imageContainer.lastChild);
    }
  };

  const initSearch = () => {
    searchInput.addEventListener('keydown', (key) => {
      if (key.keyCode === 13) {
        clearImages();
        fetchFromFlickr(key.target.value);
      }
    });
    searchSubmitButton.onclick = () => {
      input = searchInput.value;
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
