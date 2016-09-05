const Slider = (() => {
  const apiKey = 'c68800a17a432a39511ddfe44c78a500';
  const get = (url) => {
    return new Promise((resolve, reject) => {
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
  };
  // format data into sub-objects
  const createImageObjects = (images, id) => {
    // images.sizes.size.forEach((image) => {
    //   if (image.label === "Large");
    // })
    if (images.sizes.size.length > 8) {
      const medium = images.sizes.size[5].source;
      const large = images.sizes.size[8].source;
      const smallAndMedium = {
        id,
        medium,
        large
      };
      return smallAndMedium;
    }
    return;
  };

  const log = (x) => {
    console.log(x);
  };

  const fetchFromFlickr = () => {
    const photoId = 29158094390;
    Promise.resolve(get(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&format=json&nojsoncallback=1&tags=patterns`))
    .then((res) => {
      const list = res.photos.photo.map((image) =>
       `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&format=json&nojsoncallback=1&photo_id=${image.id}`);
      return list;
    })
    .then((list) => {
      list.map((url) =>
        Promise.resolve(get(url))
        .then((res) => {
          const images = res;
          const imageMap = createImageObjects(images, photoId);
          return imageMap;
        })
      );
      return list;
    })
    .then((x) => {
      log(x);
    });
  };
  const init = (x) => {
    fetchFromFlickr();
    log(x);
  };

  return {
    init
  };
})();

Slider.init();
