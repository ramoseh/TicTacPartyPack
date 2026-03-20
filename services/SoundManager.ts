import { Audio } from 'expo-av';

export const SoundManager = {
    tickSound: new Audio.Sound(),
    explodeSound: new Audio.Sound(),
    isLoaded: false,

    async loadSounds() {
        if (this.isLoaded) return;
        try {
            // Configure audio mode to ensure playback works in silent mode and other scenarios
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            await this.tickSound.loadAsync(require('../assets/sounds/tick.mp3'));
            await this.explodeSound.loadAsync(require('../assets/sounds/explode.mp3'));
            this.isLoaded = true;
        } catch (error) {
            console.log("Error loading sounds, likely missing files or empty placeholders:", error);
        }
    },

    async playTick() {
        try {
            if (!this.isLoaded) await this.loadSounds();
            // Explicitly set looping to true and start from the beginning
            await this.tickSound.setIsLoopingAsync(true);
            await this.tickSound.playFromPositionAsync(0);
        } catch (e) {
            console.log("Error playing tick:", e);
        }
    },

    async stopTick() {
        try {
            if (this.isLoaded) await this.tickSound.stopAsync();
        } catch (e) { }
    },

    async playExplode() {
        try {
            await this.stopTick();
            if (this.isLoaded) await this.explodeSound.replayAsync();
        } catch (e) { }
    },

    async unload() {
        try {
            if (this.isLoaded) {
                await this.tickSound.unloadAsync();
                await this.explodeSound.unloadAsync();
                this.isLoaded = false;
            }
        } catch (e) { }
    }
};
