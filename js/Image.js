const LEAF_SIZE = 100;

class ImageQuadtree {
    constructor(data, resultData, options, w, h) {
        this.sourceData = data.data;
        this.resultImageData = resultData;
        this.resultData = resultData.data;
        this.options = options;
        this.w = w;
        this.h = h;
        this.quadkeys = new AVLTree((a,b) => b-a);
        let mainQuadkey = this.buildQuadkey(0, 0, this.w, this.h);
        this.quadkeys.insert(1, mainQuadkey);
        this.paintQuadkey(mainQuadkey);
    }

    step() {
        if (this.quadkeys.size == 0) {
            console.log("Out of quadKeys");
            return false;
        }

        var splits = this.splitQuadkey(this.findQuadkeyToSplit());
        splits.forEach(q => {
            this.paintQuadkey(q);
            if (!q.leaf) {
                this.quadkeys.insert(q.error, q);
            }
        });
        return splits.length > 0;
    }

    findQuadkeyToSplit() {
        let node = this.quadkeys.pop();
        return node.data;
    }

    getOriginalPixel(row,col) {
        return new PixelColor(this.getOriginalRawPixel());
    }

    getOriginalRawPixel(row, col) {
        let redIndex = (this.w * row * 4) + col * 4;
        return [this.sourceData[redIndex], this.sourceData[redIndex+1], this.sourceData[redIndex+2], this.sourceData[redIndex+3]]; 
    }

    mean(row, col, w, h) {
        let sum = [0, 0, 0, 0];
        for (let r = row; r < row + h; r++) {
            for (let c = col; c < col + w; c++) {
                let pixelColor = this.getOriginalRawPixel(r, c);
                sum[0] += pixelColor[0];
                sum[1] += pixelColor[1];
                sum[2] += pixelColor[2];
                sum[3] += pixelColor[3];
            }
        }
        let count = w * h;
        let mean = [sum[0] / count, sum[1] / count, sum[2] / count, sum[3] / count];
        return mean;
    }

    error(row, col, w, h, mean) {
        let sum = [0, 0, 0, 0];
        for (let r = row; r < row + h; r++) {
            for (let c = col; c < col + w; c++) {
                let pixelColor = this.getOriginalRawPixel(r, c);
                sum[0] += Math.pow(pixelColor[0] - mean.r, 2);
                sum[1] += Math.pow(pixelColor[1] - mean.g, 2);
                sum[2] += Math.pow(pixelColor[2] - mean.b, 2);
                sum[3] += Math.pow(pixelColor[3] - mean.a, 2);
            }
        }
        let count = w * h;
        return (sum[0] + sum[1] + sum[2] + sum[3]) / count;
    }

    buildQuadkey(row, col, w, h) {
        let meanColor = new PixelColor(this.mean(row, col, w, h));
        let error = this.error(row, col, w, h, meanColor);
        let q = new Quadkey(meanColor, error, row, col, w, h);
        return q;
    }

    splitQuadkey(toSplit) {
        if (toSplit.leaf) {
            console.log("You can't split a leaf!");
            return [];
        }

        const midW = Math.floor(toSplit.w / 2);
        const midH = Math.floor(toSplit.h / 2);

        const q1 = this.buildQuadkey(toSplit.row, toSplit.col, midW, midH);
        const q2 = this.buildQuadkey(toSplit.row, toSplit.col + midW, toSplit.w - midW, midH);
        const q3 = this.buildQuadkey(toSplit.row + midH, toSplit.col, midW,toSplit.h - midH);
        const q4 = this.buildQuadkey(toSplit.row + midH, toSplit.col + midW, toSplit.w - midW,toSplit.h - midH);

        return [q1, q2, q3, q4];
    }

    ///////////////////////////// Paint functions ////////////////////////////////////

    backgroundColor() {
        return new PixelColor([0, 0, 0, 255]);
    }

    paintQuadkey(quadkey) {
        if (this.options.quadkeyType == 'circle') {
            this.paintCircleQuadkey(quadkey);
        } else {
            this.paintSquareQuadkey(quadkey);
        }
    }

    paintCircleQuadkey(quadkey) {
        const centerRow = quadkey.row + quadkey.h / 2;
        const centerCol = quadkey.col + quadkey.w / 2;
        const radius = Math.min(quadkey.h, quadkey.w) / 2;

        for (let r = quadkey.row; r < quadkey.row + quadkey.h; r++) {
            for (let c = quadkey.col; c < quadkey.col + quadkey.w; c++) {
                let dist = Math.sqrt(Math.pow(r - centerRow, 2) + Math.pow(c - centerCol, 2));
                this.paintPixel(r, c, (dist <= radius) ? quadkey.color : this.backgroundColor());
            }
        }
    }

    paintSquareQuadkey(quadkey) {
        for (let r = quadkey.row; r < quadkey.row + quadkey.h; r++) {
            for (let c = quadkey.col; c < quadkey.col + quadkey.w; c++) {
                this.paintPixel(r, c, quadkey.color);
            }
        }
    }

    paintPixel(row, col, pixelColor) {
        let redIndex = (this.w * row * 4) + col * 4;
        this.resultData[redIndex] = pixelColor.r;
        this.resultData[redIndex+1] = pixelColor.g;
        this.resultData[redIndex+2] = pixelColor.b;
        this.resultData[redIndex+3] = pixelColor.a;
    }
}

class PixelColor {
    constructor(rgba) {
        this.rgba = rgba;
    }

    get r() {
        return this.rgba[0];
    }

    get g() {
        return this.rgba[1];
    }

    get b() {
        return this.rgba[2];
    }

    get a() {
        return this.rgba[3];
    }
}

class Quadkey {
    constructor(color, error, row, col, w, h) {
        this.color = color;
        this.error = error;
        this.row = row;
        this.col = col;
        this.w = w;
        this.h = h;
    }

    get leaf() {
        return this.w * this.h <= LEAF_SIZE;
    }
}