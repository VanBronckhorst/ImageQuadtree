const canvas = document.getElementById('source');
let context = canvas.getContext('2d');
let imageQuadtree;
const options = {};

buildOptions();
setupGUI();
loadImage();

function loadImage()
{
  let base_image = new Image();
  base_image.onload = function() {
    canvas.height = base_image.height;
    canvas.width = base_image.width;
    context = canvas.getContext('2d');
    context.drawImage(base_image, 0, 0);
    initialize();
  }
  base_image.src = '/img/leopard.jpg';
}


async function initialize() {
    let sourceData = context.getImageData(0,0,canvas.width, canvas.height);
    let resultData = context.createImageData(sourceData);
    imageQuadtree = new ImageQuadtree(sourceData, resultData, options, canvas.width, canvas.height);
    console.log("Loaded");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupGUI() {
    const gui = new dat.GUI();
    gui.add(options, 'quadkeyType', ['circle', 'square']);
    gui.add(options, 'speed', {'Low': 500, 'Medium': 100, 'Fast': 1, 'Top': 0});
    gui.add(options, 'step');
    gui.add(options, 'play');
}

function buildOptions() {
    options.quadkeyType = 'circle';
    options.speed = 0;
    options.step = step;
    options.play = () => play();
}

function step() {
    if (imageQuadtree) {
        imageQuadtree.step();
        context.putImageData(imageQuadtree.resultImageData, 0, 0);
    }
}

async function play() {
    let lastUpdate = 0;
    while (imageQuadtree.step()) {
        let now = new Date();
        if (now - lastUpdate > 1000 / 30) {
            context.putImageData(imageQuadtree.resultImageData, 0, 0); 
            lastUpdate = now;
            await sleep(0);
        }

        if (options.speed) {
            await sleep(options.speed);
        }
    }

    console.log(imageQuadtree)
    context.putImageData(imageQuadtree.resultImageData, 0, 0); 
}