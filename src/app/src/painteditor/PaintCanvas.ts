let workingCanvas = document.createElement('canvas');

export default class PaintCanvas {
    static get workingCanvas (): HTMLCanvasElement {
        return workingCanvas;
    }
}
