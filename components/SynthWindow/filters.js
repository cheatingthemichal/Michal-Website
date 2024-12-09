// filters.js
export function createLowPassFilter(audioContext, frequency = 1000, q = 1) {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
    filter.Q.setValueAtTime(q, audioContext.currentTime);
    return filter;
  }
  
  export function createHighPassFilter(audioContext, frequency = 500, q = 1) {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
    filter.Q.setValueAtTime(q, audioContext.currentTime);
    return filter;
  }
  
  export function createBandPassFilter(audioContext, frequency = 1000, q = 1) {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
    filter.Q.setValueAtTime(q, audioContext.currentTime);
    return filter;
  }
  