import PlatformBridge from '../platform/PlatformBridge';

export default class Sound {
    url!: string;
    soundPlayId!: number | null;
    name!: string;
    time: string | undefined;
    playing!: boolean;

    constructor (name: string, time?: string) {
        this.name = name;
        this.time = time;
        this.playing = false;
    }

    play () {
        if (this.playing) {
            this.stop();
        }
        PlatformBridge.playSound(this.name);
        this.playing = true;
    }

    done () {
        return (!this.playing);
    }

    clear () {
        this.playing = false;
    }

    stop () {
        PlatformBridge.stopSound(this.name);
        this.playing = false;
    }
}
