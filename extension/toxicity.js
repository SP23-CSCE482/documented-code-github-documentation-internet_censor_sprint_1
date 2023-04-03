import * as toxicity from '@tensorflow-models/toxicity';


export class ToxicityClassifier {
    static TOXICITY_MODEL;
    static IS_MODEL_LOADED = false;
    static TOXICITY_THRESHOLD = 0.7;

    // load model
    static {
        toxicity.load(this.TOXICITY_THRESHOLD).then(model => {
            this.TOXICITY_MODEL = model;
            this.IS_MODEL_LOADED = true;
        });
    }

    /**
     * Returns object with different metrics on sentiment of input
     * @param {string} inputString The string to evaluate
     * @returns {*}
     */
    static async isToxic(inputString) {
        if (!this.IS_MODEL_LOADED) { throw new Error("Model not loaded."); }
        let prediction = await this.TOXICITY_MODEL.classify([inputString]);
        return prediction;
    }

}
