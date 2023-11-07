import "regenerator-runtime/runtime";
import store from "store2";
import {
  getPracticeCount,
  getStimulusCount,
  initTrialSaving,
  initTimeline,
} from "./config/config";

// setup
import { jsPsych } from "./jsPsych";
import { preloadTrials, initializeCat } from "./experimentSetup";
// trials
import {
  ifRealTrialResponse,
  practiceTrials,
  stimulusTrials,
} from "./trials/stimulus";
import { setupMainTrial, setupPracticeTrial } from "./trials/setup";
import { exitFullscreen } from "./trials/fullScreen";
import {
  subTaskComplete,
  subTaskInitMain,
  subTaskInitPractice,
} from "./trials/subTask";
import { ifPracticeCorrect, ifPracticeIncorrect } from "./trials/practice";
import {
  endTrial,
  storyBreakList,
  introAndInstructions,
  practiceDone,
  createStory,
} from "./trials/storySetup";

export function buildExperiment(config) {
  initTrialSaving(config);
  const initialTimeline = initTimeline(config);

  if (config.story) {
    createStory();
  }

  const timeline = [preloadTrials, ...initialTimeline.timeline];

  // this function adds all the trials in a subtask (and the mid-subtask breaks) to the timeline
  // fixationBlock:  an array of fixation trials (to fetch next stimulus) configured in stimulusLetterName.js
  // stimulusCounts: an array of numbers, each entry defines the number of trials before a mid-subtask break
  let breakNum = 0;

  const pushSubTaskToTimeline = (
    subTaskInitBlock,
    fixationBlock,
    stimulusCounts,
    trialType,
  ) => {
    // begin the subtask
    timeline.push(subTaskInitBlock);
    // loop through the list of trials per block within the subtest
    for (let i = 0; i < stimulusCounts.length; i++) {
      // add trials to the block (this is the core procedure for each trial)
      let surveyBlock;

      if (trialType === "practice") {
        surveyBlock = {
          timeline: [
            fixationBlock,
            practiceTrials,
            ifPracticeCorrect,
            ifPracticeIncorrect,
            ifRealTrialResponse,
          ],
          conditional_function: () => {
            if (stimulusCounts[i] === 0) {
              return false;
            }
            store.session.set("currentBlockIndex", i);
            return true;
          },
          repetitions: stimulusCounts[i],
        };
      } else {
        surveyBlock = {
          timeline: [
            fixationBlock,
            stimulusTrials,
            ifPracticeCorrect,
            ifPracticeIncorrect,
            ifRealTrialResponse,
          ],
          conditional_function: () => {
            if (stimulusCounts[i] === 0) {
              return false;
            }
            store.session.set("currentBlockIndex", i);
            return true;
          },
          repetitions: stimulusCounts[i],
        };
      }


      timeline.push(surveyBlock);

      // add breaks
      if (config.story) {
        if (i + 1 !== stimulusCounts.length) {
          // no break on the last block of the subtask
          //   timeline.push(surveyBlock);
          // } else {
          // add stimulus and break
          timeline.push(storyBreakList[breakNum]);
          breakNum += 1;
          if (breakNum === storyBreakList.length) {
            breakNum = 0;
          }
        }
      }
    }

    // end of the subtask
    timeline.push(subTaskComplete);
  };

  initializeCat();

  // story intro
  console.log({introAndInstructions})
  if (config.story) timeline.push(introAndInstructions);

  pushSubTaskToTimeline(
    subTaskInitPractice,
    setupPracticeTrial,
    [config.numOfPracticeTrials],
    "practice",
  ); // Practice Trials
  
  if (config.story) timeline.push(practiceDone);

  pushSubTaskToTimeline(
    subTaskInitMain,
    setupMainTrial,
    getStimulusCount(),
    "stimulus",
  ); // Stimulus Trials

  if (config.story) timeline.push(endTrial); // End Task
  timeline.push(exitFullscreen);

  return { jsPsych, timeline };
}
