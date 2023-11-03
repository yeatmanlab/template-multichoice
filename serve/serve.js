import { RoarAppkit, initializeFirebaseProject } from "@bdelab/roar-firekit";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import MultichoiceTask from "../src/experiment/index";
import { firebaseConfig } from "./firebaseConfig";
import i18next from "i18next";

// Import necessary for async in the top level of the experiment script
import "regenerator-runtime/runtime";

const queryString = new URL(window.location).search;
const urlParams = new URLSearchParams(queryString);
const taskName = urlParams.get("taskName") ?? "my-task";
const practiceCorpus = urlParams.get("practiceCorpus");
const stimulusCorpus = urlParams.get("stimulusCorpus");
const storyCorpus = urlParams.get("storyCopus")
const buttonLayout = urlParams.get("buttonLayout");
const numberOfTrials = urlParams.get("trials") === null ? null : parseInt(urlParams.get("trials"), 10);
// Boolean parameters
const skipInstructions = urlParams.get("skip")?.toLocaleLowerCase() !== "true";
const sequentialPractice = urlParams.get("sequentialPractice")?.toLocaleLowerCase() !== "false";
const sequentialStimulus = urlParams.get("sequentialStimulus")?.toLocaleLowerCase() === "true";
const { language } = i18next;

// @ts-ignore
const appKit = await initializeFirebaseProject(
  firebaseConfig,
  "assessmentApp",
  "none",
);

const taskId = language === "en" ? taskName : `${taskName}-${language}`;

onAuthStateChanged(appKit.auth, (user) => {
  if (user) {
    const userInfo = {
      assessmentUid: user.uid,
      userMetadata: {},
    };

    const userParams = {};

    const gameParams = {
      taskName,
      skipInstructions,
      practiceCorpus,
      stimulusCorpus,
      sequentialPractice,
      sequentialStimulus,
      buttonLayout,
      numberOfTrials,
      storyCorpus
    };

    const taskInfo = {
      taskId: taskId,
      variantParams: gameParams,
    };

    const firekit = new RoarAppkit({
      firebaseProject: appKit,
      taskInfo,
      userInfo,
    });

    const app = new MultichoiceTask(firekit, gameParams, userParams);
    app.run();
  }
});

await signInAnonymously(appKit.auth);
