export default {
    egmaMath: {
        // Passed in
        gameParams: {
            audioFeedback: '',
            language: '',
            skipInstructions: '',
            practiceCorpus: '',
            stimulusCorpus: '',
            sequentialPractice: '',
            sequentialStimulus: '',
            buttonLayout: '',
            numberOfTrials: '',
            taskName: '',
            numOfPracticeTrials: '',
            story: '',
            storyCorpus: '',
            stimulusBlocks: '',
            keyHelpers: ''
        },
        // What is this, trial params or the trials themselves?
        // How to deal with jsPsych cb funcs, conditional timelines, loops, repetitions, etc?
        trials: {
            pracitce: {

            },
            stimulus: {
                
            }
        },
        // Needs to be passed in
        asssetsSrc: "https://storage.googleapis.com/egma-math",
        corpora: {
            content: {
                fields: [
                    'item', 
                    'target', 
                    'distractor1', 
                    'distractor1',
                    'distractor1', 
                    'difficulty', 
                    'prompt', 
                    'source'
                ],
                // Need to be passed in
                stimulus: '',
                practice: ''
            },
        },
        translation: 'path/to/translations',
        timeline: (jspsych, trials,) => {
            // function that builds the timeline?
        },
        variants: {
            // example
            egmaKids:{

            }
        }
    }
}