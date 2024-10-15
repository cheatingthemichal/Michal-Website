// components/MusicWindow/Visualizer.js

class Visualizer {
  constructor(audioContext, audioElement, canvasElement, fftSize = 2048, tau = 5, norm = 90, color = 1, version = 'osc', memoryMode = 'off') {
    this.audioContext = audioContext;
    this.audioElement = audioElement;
    this.canvasElement = canvasElement;
    this.canvasContext = this.canvasElement.getContext('2d');
    this.fftSize = fftSize;
    this.tau = tau;
    this.norm = norm;
    this.color = color;
    this.version = version;
    this.memoryMode = memoryMode;

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.fftSize;

    this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
    this.audioSource.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.animationFrameId = null;

    this.drawBar = this.drawBar.bind(this);
    this.drawOsc = this.drawOsc.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  getStyle(entropy) {
    const baseR = 5 ** (entropy * 21) / this.norm;
    const baseG = 5 ** (entropy * 21) / this.norm;
    const baseB = 5 ** (entropy * 21) / this.norm;

    const paletteR = 10 + 1 / (0.02 + Math.abs(0 - this.color));
    const paletteG = 10 + 1 / (0.02 + Math.abs(0.5 - this.color));
    const paletteB = 10 + 1 / (0.02 + Math.abs(1 - this.color));

    // Apply the palette multipliers to the base colors
    const r = Math.round(baseR * paletteR / 600);
    const g = Math.round(baseG * paletteG / 600);
    const b = Math.round(baseB * paletteB / 600);

    return `rgb(${r}, ${g}, ${b})`;
  }

  permEntropy(arr) {
    let entropy = 0;
    const ordinals = this.ordinalPattern(arr);
    const numberTriplets = arr.length - 3 + 1;

    for (const perm in ordinals) {
      const count = ordinals[perm];
      if (count !== 0) {
        const freq = count / numberTriplets;
        entropy -= freq * Math.log2(freq);
      }
    }

    const norm_entropy = entropy / Math.log2(6);
    return norm_entropy;
  }

  ordinalPattern(arr) {
    const ordinals = {};
    const tau = this.tau
    for (let i = 0; i < arr.length - 2; i += tau) {
      const [first, second, third] = [arr[i], arr[i + 1], arr[i + 2]];
      let pattern;

      if (first <= second) {
        if (second <= third) {
          pattern = [0, 1, 2];
        } else if (first <= third) {
          pattern = [0, 2, 1];
        } else {
          pattern = [1, 2, 0];
        }
      } else {
        if (second <= third) {
          if (first <= third) {
            pattern = [1, 0, 2];
          } else {
            pattern = [2, 0, 1];
          }
        } else {
          pattern = [2, 1, 0];
        }
      }

      const key = pattern.join(',');
      if (ordinals[key]) {
        ordinals[key]++;
      } else {
        ordinals[key] = 1;
      }
    }
    return ordinals;
  }

  drawBar() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    if (this.version === "bar") {
      this.animationFrameId = requestAnimationFrame(this.drawBar);
    }
    else {
      this.animationFrameId = requestAnimationFrame(this.drawOsc);
    }
    const { width: WIDTH, height: HEIGHT } = this.canvasElement;

    this.analyser.getByteFrequencyData(dataArray);
    const entropy = this.permEntropy(dataArray);

    if (this.memoryMode === 'off') {
      this.canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    }

    const cutoff = Math.floor(bufferLength * 0.6);
    const barWidth = WIDTH / cutoff;
    let barHeight;
    let x = 0;

    for (let i = 0; i < cutoff; i++) {
      barHeight = dataArray[i] * (HEIGHT / 256) + 3 ** (entropy * 25) / this.norm; // Scale bar height appropriately
      const color = this.getStyle(entropy);
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth;
    }
  }

  drawOsc() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    if (this.version === "bar") {
      this.animationFrameId = requestAnimationFrame(this.drawBar);
    }
    else {
      this.animationFrameId = requestAnimationFrame(this.drawOsc);
    }
    const { width: WIDTH, height: HEIGHT } = this.canvasElement;

    this.analyser.getByteTimeDomainData(dataArray);
    const entropy = this.permEntropy(dataArray);
    if (this.memoryMode === 'off') {
      this.canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    }

    this.canvasContext.lineWidth = 3 ** (entropy * 17) / this.norm
    const color = this.getStyle(entropy);
    this.canvasContext.strokeStyle = color;

    this.canvasContext.beginPath();
    const sliceWidth = WIDTH / bufferLength;
    const verticalOffset = -20;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * (HEIGHT / 2) + verticalOffset;
      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }

    this.canvasContext.lineTo(WIDTH, (HEIGHT / 2) + verticalOffset);
    this.canvasContext.stroke();
  }

  start() {
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;
    this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height); // Clear canvas

    if (this.version === 'bar') {
      this.drawBar();
    } else {
      this.drawOsc();
    }
  }

  setMemoryMode(newMemoryMode) {
    this.memoryMode = newMemoryMode;
  }

  setVersion(newVersion) {
    this.version = newVersion;
  }

  setTau(newTau) {
    this.tau = newTau;
  }

  setNorm(newNorm) {
    this.norm = newNorm;
  }

  setFFTSize(newSize) {
    this.fftSize = newSize;
    this.analyser.fftSize = this.fftSize;
  }

  setColor(newColor) {
    this.color = newColor;
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }
}

export default Visualizer;
