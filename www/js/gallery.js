class Gallery {

    #dogApi = 'https://dog.ceo/api/breeds/image/random';

    #foxApi = 'https://randomfox.ca/floof/';
    
    #gallery = null;

    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            this.#gallery = document.getElementById('gallery').querySelector('.masonry');
        });
    }

    async addRandomImages(num = 1) {
        while (num > 0) {
            let imgSrc = null;
            if (num % 2 == 0) {
                imgSrc = await this.getFoxImage();
            } else {
                imgSrc = await this.getDoxImage();
            }
            this.addImageToGallery(imgSrc);
            num--;
        }
    }

    addImageToGallery(imgSrc) {
        if (!imgSrc) {
            return;
        }
        this.#gallery.appendChild(this.#createBrick(imgSrc));
    }

    #createBrick(imgSrc) {
        const brick = document.createElement('div');
        brick.classList.add('brick');
        brick.innerHTML = `<img src="${imgSrc}">`;
        return brick;
    }

    async getDoxImage() {
        const response = await fetch(this.#dogApi);
        const json = await response.json();
        return json.message;
    }

    async getFoxImage() {
        const response = await fetch(this.#foxApi);
        const json = await response.json();
        return json.image;
    }
}

const galleryManager = new Gallery();