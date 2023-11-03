/* eslint-disable import/no-cycle */
import store from "store2";
import {
  createPreloadTrials,
  generateAssetObject,
  getDevice,
} from "@bdelab/roar-utils";
import assets from "../../assets.json";
import { Cat } from "@bdelab/jscat";

const bucketURI = "https://storage.googleapis.com/roar-survey";

export const mediaAssets = generateAssetObject(assets, bucketURI);
export const preloadTrials = createPreloadTrials(assets, bucketURI).default;
export const isTouchScreen = getDevice() === "mobile";

export let cat;

export const initializeCat = () => {
  // initialize adaptive testing module
  cat = new Cat({
    method: "MLE",
    // minTheta: -6,
    // maxTheta: 6,
    itemSelect: store.session("itemSelect"),
  });
};
