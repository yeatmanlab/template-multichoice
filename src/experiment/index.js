import store from "store2";
import { initConfig } from "./config/config";
import { buildExperiment } from "./experiment";
import { waitFor } from "./helperFunctions";
import "./styles/task.scss";
import { loadCorpus } from "./config/corpus";

class MultichoiceTask {
  constructor(firekit, gameParams, userParams, displayElement) {
    this.gameParams = gameParams;
    this.userParams = userParams;
    this.firekit = firekit;
    this.displayElement = displayElement;
  }

  async init() {
    await this.firekit.startRun();
    const config = await initConfig(
      this.firekit,
      this.gameParams,
      this.userParams,
      this.displayElement,
    );
    store.session.set("config", config);
    await loadCorpus(config);
    return buildExperiment(config);
  }

  async run() {
    const { jsPsych, timeline } = await this.init();
    jsPsych.run(timeline);
    await waitFor(() => this.firekit.run.completed === true);
  }
}

export default MultichoiceTask;
