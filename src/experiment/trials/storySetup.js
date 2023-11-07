import jsPsychAudioButtonResponse from "@jspsych/plugin-audio-button-response";
import { mediaAssets } from "../experimentSetup";
import "../i18n";
import { corpora } from "../config/corpus";

//@ts-check
export let storyByLabel,
  introAndInstructions,
  storyBreakList,
  practiceDone,
  blockBreaks,
  endTrial;

export function createStory() {

  function createScreenHtml(content) {
    // if (content.screenStyle === "speechBubble") {
      return `
        <div class="lion-gif-container">
          <h1 class="speechbubble-header"> ${content.header} </h1>
          <p class="speechbubble-text"> ${content.topText} </p>
          <p class="speechbubble-text"> ${content?.bottomText} </p>
          <img class="roar-lion" src=${
            mediaAssets.images[content.imageName]
          } alt=${content.imageAlt}"/>
        </div>
      `;
    // if (content.screenStyle === "captionBelowImage") {
    //   return `
    //   <div class="gif-container">
    //     <h1 class="mid-centered-header" style="color:#8C1515"> ${
    //       content.header
    //     } </h1>
    //     <p class="mid-centered-text" style="color:#8C1515"> ${
    //       content.topText
    //     } </p>
    //     <img class="device-instructions" src=${
    //       mediaAssets.images[content.imageName]
    //     } alt=${content.imageAlt}"/>
    //   </div>
    // `;
    // }
  }

  function createStoryTrial(row) {
    const screenHtml = createScreenHtml(row);
    return {
      type: jsPsychAudioButtonResponse,
      stimulus: mediaAssets.audio[row.audioName],
      prompt: screenHtml,
      choices: () => ["hi"],
      button_html: () =>
        `<img class="go-button" src=${mediaAssets.images.goButton} alt="button"/>`,
    };
  }

  // Create a dictionary to store story trials indexed by label
  storyByLabel = [];

  // StoryActive is read from a csv file in config
  // note filenames for image and audio must start with a lowercase letter
  console.log(corpora.story)
  corpora.story.forEach((row) => {
    const { label } = row;
    const storyTrial = createStoryTrial(row);

    if (!storyByLabel[label]) {
      storyByLabel[label] = [];
    }

    storyByLabel[label] = storyTrial;
  });

  //  storyByLabel contains the html for the story organized by label
  introAndInstructions = {
    timeline: [
      storyByLabel.intro,
      storyByLabel.ins,
      storyByLabel.surveyPractice,
    ],
  };

  storyBreakList = [
    storyByLabel.break1,
    storyByLabel.break2,
    storyByLabel.break3,
    storyByLabel.break1,
    storyByLabel.break2
  ];

  practiceDone = {
    timeline: [storyByLabel.surveyPostPractice],
  };

  blockBreaks = {
    timeline: [
      storyByLabel.break1,
      storyByLabel.break2,
      storyByLabel.break3,
      storyByLabel.break4,
      storyByLabel.break5,
    ],
  };

  endTrial = {
    timeline: [storyByLabel.ending],
  };
}
