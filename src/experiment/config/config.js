import store from "store2";
import _omitBy from "lodash/omitBy";
import _isNull from "lodash/isNull";
import _isUndefined from "lodash/isUndefined";
import i18next from "i18next";
import { enterFullscreen } from "../trials/fullScreen";
import { corpora } from "./corpus";
import { jsPsych } from "../jsPsych";

const makePid = () => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i += 1)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const initStore = (config) => {
  if (store.session.has("initialized") && store.local("initialized")) {
    return store.session;
  }

  if (
    // future adaptive modes
    config.userMode === "fullAdaptive" ||
    config.userMode === "shortAdaptive"
  ) {
    // use adaptive algorithm to select next item
    store.session.set("itemSelect", "mfi");
  } else {
    store.session.set("itemSelect", "random");
  }

  // Counting variables
  store.session.set("practiceIndex", 0);
  store.session.set("currentBlockIndex", 0); // counter for breaks within subtask
  store.session.set("subTaskName", ""); // init to "" so getNextSubTask will work

  store.session.set("trialNumSubtask", 0); // counter for trials in subtask
  store.session.set("trialNumTotal", 0); // counter for trials in experiment

  // variables to track current state of the experiment
  store.session.set("currentTrialCorrect", true); 
  store.session.set("coinTrackingIndex", 0);

  // running computations
  store.session.set("subtaskCorrect", 0);
  store.session.set("totalCorrect", 0);
  store.session.set("correctItems", []);
  store.session.set("incorrectItems", []);

  // working copy of the three corpuses (items are removed as they are used)
  store.session.set("corpora", corpora);

  // this should be the last set before return
  store.session.set("initialized", true);
};


function createBlocks(numOfBlocks, numOfTrials) {
  // Minimum number of trials. Can change to whatever.
  if (numOfTrials < 10) numOfTrials = 10;
  const baseFraction = Math.floor(numOfTrials / numOfBlocks);
  const remainder = Math.round(numOfTrials % numOfBlocks);

  const blocks = [];

  for (let i = 0; i < numOfBlocks; i++) {
    blocks.push(baseFraction)
  }

  // Distribute the remainder among the first few fractions
  for (let i = 0; i < remainder; i++) {
    blocks[i]++;
  }

  return blocks;
}

// get size of blocks
export const getStimulusCount = (userMode) => {
  const { numberOfTrials, stimulusBlocks } = store.session.get("config")
  const maxNumberOfTrials = store.session.get("maxStimulusTrials");

  let countList;

  if (numberOfTrials > maxNumberOfTrials) {
    countList = createBlocks(stimulusBlocks, maxNumberOfTrials);
  } else {
    countList = createBlocks(stimulusBlocks, numberOfTrials);
  }

  store.session.set("stimulusCountList", countList);
  return countList;
};

export const initConfig = async (
  firekit,
  gameParams,
  userParams,
  displayElement,
) => {
  const cleanParams = _omitBy(_omitBy({ ...gameParams, ...userParams }, _isNull), _isUndefined);

  const {
    // Setting default userMode to fullAdaptive, which uses mfi item selection rather than random
    // userMode,
    userMetadata = {},
    audioFeedback,
    language = i18next.language,
    skipInstructions,
    practiceCorpus,
    stimulusCorpus,
    sequentialPractice,
    sequentialStimulus,
    buttonLayout,
    numberOfTrials,
    storyCorpus,
    taskName,
    stimulusBlocks,
    numOfPracticeTrials,
    story
  } = cleanParams;

  language !== "en" && i18next.changeLanguage(language);

  const config = {
    // userMode: userMode ?? "fullRandom",
    userMetadata: { ...userMetadata, },
    audioFeedback: audioFeedback || "neutral",
    skipInstructions: skipInstructions ?? true,
    startTime: new Date(),
    firekit,
    displayElement: displayElement || null,
    // name of the csv files in the storage bucket
    practiceCorpus: practiceCorpus ?? "math-item-bank-practice-pz",
    stimulusCorpus: stimulusCorpus ?? "math-item-bank-pz",
    sequentialPractice: sequentialPractice ?? true,
    sequentialStimulus: sequentialStimulus ?? true,
    buttonLayout: buttonLayout || "default",
    numberOfTrials: numberOfTrials ?? 10,
    storyCorpus: storyCorpus ?? 'story-lion',
    task: taskName ?? 'egma-math',
    stimulusBlocks: stimulusBlocks ?? 3,
    numOfPracticeTrials: numOfPracticeTrials ?? 2,
    story
  };

  const updatedGameParams = Object.fromEntries(
    Object.entries(gameParams).map(([key, value]) => [
      key,
      config[key] ?? value,
    ]),
  );

  await config.firekit.updateTaskParams(updatedGameParams);

  if (config.pid !== null) {
    await config.firekit.updateUser({
      assessmentPid: config.pid,
      ...userMetadata,
    });
  }

  return config;
};

export const initTrialSaving = (config) => {
  if (config.displayElement) {
    jsPsych.opts.display_element = config.display_element;
  }

  // Extend jsPsych's on_finish and on_data_update lifecycle functions to mark the
  // run as completed and write data to Firestore, respectively.
  const extend = (fn, code) =>
    function () {
      // eslint-disable-next-line prefer-rest-params
      fn.apply(fn, arguments);
      // eslint-disable-next-line prefer-rest-params
      code.apply(fn, arguments);
    };

  jsPsych.opts.on_finish = extend(jsPsych.opts.on_finish, () => {
    config.firekit.finishRun();
  });

  jsPsych.opts.on_data_update = extend(jsPsych.opts.on_data_update, (data) => {
    if (data.save_trial) {
      config.firekit.writeTrial(
        data,
      );
    }
  });

  // Add a special error handler that writes javascript errors to a special trial
  // type in the Firestore database
  window.addEventListener("error", (e) => {
    const { msg, url, lineNo, columnNo, error } = e;

    config.firekit?.writeTrial({
      task: "error",
      lastTrial: jsPsych.data.getLastTrialData().trials[0],
      message: String(msg),
      source: url || null,
      lineNo: String(lineNo || null),
      colNo: String(columnNo || null),
      error: JSON.stringify(error || null),
      timeStamp: new Date().toISOString(),
    });
  });

  initStore(config);
};

export const initTimeline = (config) => {
  // If the participant's ID was **not** supplied through the query string, then
  // ask the user to fill out a form with their ID, class and school.

  const initialTimeline = [enterFullscreen];

  const beginningTimeline = {
    timeline: initialTimeline,
    on_timeline_finish: async () => {
      // eslint-disable-next-line no-param-reassign
      config.pid = config.pid || makePid();
      await config.firekit.updateUser({
        assessmentPid: config.pid,
        ...config.userMetadata,
      });
    },
  };

  return beginningTimeline;
};
