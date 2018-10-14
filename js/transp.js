const canvas = document.getElementById('source');
let context = canvas.getContext('2d');
let imageCanvas;
const options = {
    magnifyRadius: 50,
    magnifyPower: 3,
    magnifier: true,
    tolerance: 0.08
};

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false)
});

document.body.addEventListener('drop', (e) => {
    let dt = e.dataTransfer
    let files = dt.files
    var reader = new FileReader();
    reader.onload = function (event) {
        loadImage(event.target.result);
    }
    reader.readAsDataURL(files[0]);
}, false)

canvas.addEventListener('mousemove', function(evt) {
    if (options.magnifier) {
        var mousePos = getMousePos(canvas, evt);
        imageCanvas.magnify(mousePos.y, mousePos.x);
        context.putImageData(imageCanvas.resultImageData, 0, 0); 
        imageCanvas.copySourceContext();
    }  
}, false);

canvas.addEventListener('click', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    imageCanvas.makeTransparent(mousePos.y, mousePos.x);
    context.putImageData(imageCanvas.resultImageData, 0, 0); 
}, false);

setupGUI();
loadImage('img/owl.jpg');


function initialize() {
    let sourceData = context.getImageData(0,0,canvas.width, canvas.height);
    let resultData = context.createImageData(sourceData);
    imageCanvas = new ImageCanvas(sourceData, resultData, options, canvas.width, canvas.height);
    console.log("Loaded");
}

function setupGUI() {
    const gui = new dat.GUI();
    gui.add(options, 'magnifyRadius', 10, 500, 1);
    gui.add(options, 'magnifyPower', 2, 20);
    gui.add(options, 'magnifier');
    gui.add(options, 'tolerance', 0, 1, 0.01);
}

async function sleep(ms) {
    let p =  new Promise(resolve => setTimeout(resolve, ms));
    await p;
}

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

function loadImage(url) {
  let base_image = new Image();
  base_image.onload = function() {
    canvas.height = base_image.height;
    canvas.width = base_image.width;
    context = canvas.getContext('2d');
    context.drawImage(base_image, 0, 0);
    initialize();
  }
  base_image.src = url;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
