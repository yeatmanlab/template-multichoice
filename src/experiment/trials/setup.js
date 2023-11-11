/* eslint-disable arrow-body-style */
import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import { getStimulus } from "../helperFunctions";
import { mediaAssets } from "../experimentSetup";

// choosing the next stimulus from the corpus occurs during the fixation trial
// prior to the actual display of the stimulus, where user response is collected
// the array allows us to use the same structure for all corpuses
const setupData = [
  {
    onFinish: () => {
      getStimulus("practice");
    },
  },
  {
    onFinish: () => {
      getStimulus("stimulus");
    },
  },
];

const setupTrials = setupData.map((trial, i) => {
  return {
    type: jsPsychAudioKeyboardResponse,
    stimulus: () => mediaAssets.audio.nullAudio,
    prompt: function () {
      return `<div class='stimulus_div'>
                <p class='stimulus'> </p>
              </div>`;
    },
    choices: "NO_KEYS",
    trial_duration: 10,
    data: {
      task: "fixation",
    },
    on_finish: trial.onFinish,
  };
});

export const setupPracticeTrial = setupTrials[0];
export const setupMainTrial = setupTrials[1];
