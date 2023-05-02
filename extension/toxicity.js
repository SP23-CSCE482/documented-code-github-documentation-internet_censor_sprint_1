import * as toxicity from '@tensorflow-models/toxicity';

/**
 * Loads and handles the toxicity model.
 * @exports ToxicityClassifier
 */
export class ToxicityClassifier {
  static TOXICITY_MODEL;
  static IS_MODEL_LOADED = false;
  static TOXICITY_THRESHOLD = 0.1;
  static RECOMMENDED_MAX_BATCH_SIZE = 30;

  // load model
  static {
    toxicity.load(this.TOXICITY_THRESHOLD).then((model) => {
      this.TOXICITY_MODEL = model;
      this.IS_MODEL_LOADED = true;
    });
  }

  /**
     * Returns object with different metrics on sentiment of input
     * @param {string} inputString The string to evaluate
     * @return {*}
     */
  static async isToxic(inputString) {
    if (!this.IS_MODEL_LOADED) {
      throw new Error('Model not loaded.');
    }
    const prediction = await this.TOXICITY_MODEL.classify([inputString]);
    return prediction;
  }

  /**
     * Get the toxicity by batch
     * @param {*} inputArray
     * @return {*}
     */
  static async getToxicityByBatch(inputArray) {
    if (inputArray.length > this.RECOMMENDED_MAX_BATCH_SIZE) {
      console.warning('Batch size is larger than ' + this.RECOMMENDED_MAX_BATCH_SIZE + ' elements');
    }
    const prediction = await this.TOXICITY_MODEL.classify(inputArray);
    return prediction;
  }
}
