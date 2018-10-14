class ImageCanvas {
    constructor(data, resultData, options, w, h) {
        this.sourceData = data.data;
        this.resultImageData = resultData;
        this.resultData = resultData.data;
        this.options = options;
        this.w = w;
        this.h = h;
        this.copySourceContext();
    }

    getOriginalRawPixel(row, col) {
        let redIndex = (this.w * row * 4) + col * 4;
        return [this.sourceData[redIndex], this.sourceData[redIndex+1], this.sourceData[redIndex+2], this.sourceData[redIndex+3]]; 
    }

    getCurrentRawPixel(row, col) {
        let redIndex = (this.w * row * 4) + col * 4;
        return [this.resultData[redIndex], this.resultData[redIndex+1], this.resultData[redIndex+2], this.resultData[redIndex+3]]; 
    }

    magnify(cr, cc) {
        const rad = this.options.magnifyRadius;
        const power = this.options.magnifyPower;
        const maxR = this.clampRow(cr + rad);
        const maxC = this.clampCol(cc + rad);
        for (let r = this.clampRow(cr - rad); r < maxR; r++) {
            for (let c = this.clampCol(cc - rad); c < maxC; c++) {
                let dist = Math.sqrt((r - cr) * (r - cr) + (c - cc) * (c - cc));
                if (dist < rad) {
                    let adjustedR = cr + Math.round((r - cr) / power);
                    let adjustedC = cc + Math.round((c - cc) / power);//this.getOriginalRawPixel(adjustedR, adjustedC)
                    this.paintPixel(r, c, this.getOriginalRawPixel(adjustedR, adjustedC));
                }
            }
        }
    }

    makeTransparent(row,col) {
        let transpColor = this.getCurrentRawPixel(row,col);
        let tol = this.options.tolerance;

        for (let r = 0; r < this.h; r++) {
            for (let c = 0; c < this.w; c++) {
                let color = this.getOriginalRawPixel(r,c);
                let diff = this.diffRawColors(color, transpColor);
                if (diff < tol) {
                    this.paintPixel(r, c, [0,0,0,0]);
                }
            }
        }
        this.copyDestContext();
    }

    clampRow(r) {
        // console.log("Clamping", r , Math.max(0, Math.min(this.h, r)))
        return Math.max(0, Math.min(this.h, r));
    }

    clampCol(c) {
        return Math.max(0, Math.min(this.w, c));
    }

    copySourceContext() {
        for (let r = 0; r < this.h; r++) {
            for (let c = 0; c < this.w; c++) {
                this.paintPixel(r, c, this.getOriginalRawPixel(r, c));
            }
        }
    }

    copyDestContext() {
        for (let r = 0; r < this.h; r++) {
            for (let c = 0; c < this.w; c++) {
                this.paintOriginalPixel(r, c, this.getCurrentRawPixel(r, c));
            }
        }
    }

    diffRawColors(col1, col2) {
        return (Math.abs(col1[0]-col2[0]) + Math.abs(col1[1]-col2[1]) + Math.abs(col1[2]-col2[2])) / (255 * 3);
    }

    ///////////////////////////// Paint functions ////////////////////////////////////

    backgroundColor() {
        return new PixelColor([0, 0, 0, 255]);
    }

    paintPixel(row, col, pixelColor) {
        let redIndex = (this.w * row * 4) + col * 4;
        this.resultData[redIndex] = pixelColor[0];
        this.resultData[redIndex+1] = pixelColor[1];
        this.resultData[redIndex+2] = pixelColor[2];
        this.resultData[redIndex+3] = pixelColor[3];
    }

    paintOriginalPixel(row, col, pixelColor) {
        let redIndex = (this.w * row * 4) + col * 4;
        this.sourceData[redIndex] = pixelColor[0];
        this.sourceData[redIndex+1] = pixelColor[1];
        this.sourceData[redIndex+2] = pixelColor[2];
        this.sourceData[redIndex+3] = pixelColor[3];
    }
}