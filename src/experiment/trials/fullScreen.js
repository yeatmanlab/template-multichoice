// @ts-check
import jsPsychFullScreen from "@jspsych/plugin-fullscreen";
import fscreen from "fscreen";
import i18next from "i18next";
import "../i18n";


export const enterFullscreen = {
  type: jsPsychFullScreen,
  fullscreen_mode: true,
  message: () =>
    `<div id='fullScreen'>
      <h1>${i18next.t("fullScreenTrial.prompt")}</h1>
     </div>`,
  delay_after: 0,
  button_label: () => `${i18next.t("fullScreenTrial.buttonText")}`,
  on_start: () => {
    document.body.style.cursor = "default";
  },
}

export const ifNotFullscreen = {
  timeline: [enterFullscreen],
  conditional_function: () => fscreen.fullscreenElement === null,
};

export const exitFullscreen = {
  type: jsPsychFullScreen,
  fullscreen_mode: false,
  delay_after: 0,
};
