class Gallery {

    /**
     * BE A GOOD NETIZEN!
     * 
     * Do not load images from these free APIs to often. You should build in come
     * kind of caching mechanism, maybe using local storage, that keeps a record
     * of images and reuses them without relying on the API every page load.
     */

    // Dog API endpoint for random dog images.
    #dogApi = 'https://dog.ceo/api/breeds/image/random';

    // Fox API endpoint for random fox images.
    #foxApi = 'https://randomfox.ca/floof/';

    // Gallery container element.
    #gallery = null;

    /**
     * Constructor for the Gallery class.
     * Initializes the gallery container when the DOM is loaded.
     */
    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            this.#gallery = document.getElementById('gallery').querySelector('.masonry');
        });
    }

    /**
     * Adds a specified number of random images (alternating between dog and fox) to the gallery.
     * @param {number} num - The number of images to add (default is 1).
     */
    async addRandomImages(num = 1) {
        while (num > 0) {
            let imgSrc = null;
            if (num % 2 == 0) {
                imgSrc = await this.getFoxImage();
            } else {
                imgSrc = await this.getDogImage();
            }
            this.addImageToGallery(imgSrc);
            num--;
        }
    }

    /**
     * Adds an image with the specified source to the gallery.
     * @param {string} imgSrc - The source URL of the image.
     */
    addImageToGallery(imgSrc) {
        if (!imgSrc) {
            return;
        }
        this.#gallery.appendChild(this.#createBrick(imgSrc));
    }

    /**
     * Creates a brick element with an image inside.
     * @private
     * @param {string} imgSrc - The source URL of the image.
     * @returns {HTMLElement} - The created brick element.
     */
    #createBrick(imgSrc) {
        const brick = document.createElement('div');
        brick.classList.add('brick');
        brick.innerHTML = `<img src="${imgSrc}">`;
        return brick;
    }

    /**
     * Retrieves a random dog image from the Dog API.
     * @private
     * @returns {Promise<string>} - A promise that resolves with the URL of the dog image.
     */
    async getDogImage() {
        const response = await fetch(this.#dogApi);
        const json = await response.json();
        return json.message;
    }

    /**
     * Retrieves a random fox image from the Fox API.
     * @private
     * @returns {Promise<string>} - A promise that resolves with the URL of the fox image.
     */
    async getFoxImage() {
        const response = await fetch(this.#foxApi);
        const json = await response.json();
        return json.image;
    }
}

// Create an instance of Gallery when the script is executed.
const galleryManager = new Gallery();
