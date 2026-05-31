/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class FocusSoundEngine {
  private ctx: AudioContext | null = null;
  private oscL: OscillatorNode | null = null;
  private oscR: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private pannerL: StereoPannerNode | null = null;
  private pannerR: StereoPannerNode | null = null;
  
  // Noise generator sources
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;

  start(preset: string, volume: number = 0.15) {
    this.stop();

    try {
      // Initialize Audio Context on user action
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.ctx = new AudioCtxClass();

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      if (preset === 'gamma') {
        // Binaural beat for focus: Left 200Hz, Right 240Hz (Offset = 40Hz Gamma focus)
        this.ctx.listener.setPosition(0, 0, 0);

        this.oscL = this.ctx.createOscillator();
        this.oscL.type = 'sine';
        this.oscL.frequency.setValueAtTime(200, this.ctx.currentTime);

        this.oscR = this.ctx.createOscillator();
        this.oscR.type = 'sine';
        this.oscR.frequency.setValueAtTime(240, this.ctx.currentTime);

        this.pannerL = this.ctx.createStereoPanner();
        this.pannerL.pan.setValueAtTime(-1, this.ctx.currentTime);

        this.pannerR = this.ctx.createStereoPanner();
        this.pannerR.pan.setValueAtTime(1, this.ctx.currentTime);

        // Connect
        this.oscL.connect(this.pannerL).connect(this.gainNode);
        this.oscR.connect(this.pannerR).connect(this.gainNode);

        this.oscL.start();
        this.oscR.start();
      } else if (preset === 'theta') {
        // Binaural beat for memory: Left 150Hz, Right 156Hz (Offset = 6Hz Theta frequency)
        this.oscL = this.ctx.createOscillator();
        this.oscL.type = 'sine';
        this.oscL.frequency.setValueAtTime(150, this.ctx.currentTime);

        this.oscR = this.ctx.createOscillator();
        this.oscR.type = 'sine';
        this.oscR.frequency.setValueAtTime(156, this.ctx.currentTime);

        this.pannerL = this.ctx.createStereoPanner();
        this.pannerL.pan.setValueAtTime(-0.8, this.ctx.currentTime);

        this.pannerR = this.ctx.createStereoPanner();
        this.pannerR.pan.setValueAtTime(0.8, this.ctx.currentTime);

        this.oscL.connect(this.pannerL).connect(this.gainNode);
        this.oscR.connect(this.pannerR).connect(this.gainNode);

        this.oscL.start();
        this.oscR.start();
      } else if (preset === 'waves' || preset === 'brown') {
        // Synthesizing analog warm pink/brown study noise
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Filter white noise to make it brown (1/f^2)
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Amplify slightly for depth
        }

        const bufferSource = this.ctx.createBufferSource();
        bufferSource.buffer = noiseBuffer;
        bufferSource.loop = true;

        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(preset === 'waves' ? 350 : 450, this.ctx.currentTime);

        bufferSource.connect(this.filterNode).connect(this.gainNode);
        bufferSource.start();
        
        // Save the reference for termination
        this.oscL = bufferSource as unknown as OscillatorNode;

        // If waves, modulate the filter frequency or gain slowly to simulate breaking shoreline waves
        if (preset === 'waves') {
          const modulator = this.ctx.createOscillator();
          modulator.frequency.setValueAtTime(0.12, this.ctx.currentTime); // very slow cycle (8.3 seconds)
          const modulatorGain = this.ctx.createGain();
          modulatorGain.gain.setValueAtTime(150, this.ctx.currentTime); // modulate up to 150Hz
          
          modulator.connect(modulatorGain);
          modulatorGain.connect(this.filterNode.frequency);
          modulator.start();
          
          this.oscR = modulator;
        }
      }
    } catch (e) {
      console.warn("Speech Synthesis and Audio context error: ", e);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  stop() {
    try {
      if (this.oscL) {
        this.oscL.stop();
        this.oscL.disconnect();
        this.oscL = null;
      }
      if (this.oscR) {
        this.oscR.stop();
        this.oscR.disconnect();
        this.oscR = null;
      }
      if (this.pannerL) {
        this.pannerL.disconnect();
        this.pannerL = null;
      }
      if (this.pannerR) {
        this.pannerR.disconnect();
        this.pannerR = null;
      }
      if (this.filterNode) {
        this.filterNode.disconnect();
        this.filterNode = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
    } catch (e) {
      // already stopped/cleared
    }
  }
}

export const focusSoundEngine = new FocusSoundEngine();
