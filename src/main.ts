/// <reference path="../typings/globals/jquery/index.d.ts" />
/// <reference path="../typings/globals/fbsdk/index.d.ts" />
/// <reference path="../typings/globals/bootstrap/index.d.ts" />


/**
 * main.ts - The main source file for the client-side script that runs NextWord
 *
 * @author: Aaron Keesing
 */


// These are the URLs for the API
const GEN_WORDS_URL: string = "https://api.projectoxford.ai/text/weblm/v1.0/generateNextWords?model=body&maxNumOfCandidatesReturned=10";
const WORD_PROB_URL: string = "https://api.projectoxford.ai/text/weblm/v1.0/calculateConditionalProbability?model=body";

/**
 * These interfaces provide the type defitinition for the requests and
 * responses from the WebLM API.
 */
interface LogProbRequest {
  queries: {
    words: string,
    word: string
  }[];
}

interface LogProbResponse {
  results: {
    words: string,
    word: string,
    probability: number
  }[];
}

interface GenWordsResponse {
  candidates: {
    word: string,
    probability: number
  }[];
}


// A small set of phrases to choose from
const PHRASES = [
  "Hello my",
  "What happened after",
  "Where is the",
  "It was nice",
  "How are you going to",
  "Look over",
  "When is your",
  "Tell me how to",
  "You weren't at the"
];


let submitButton: JQuery = $("#wordSubmitButton");
let wordInput: JQuery = $("#wordInput");
let fbLoginButton: JQuery = $("#fbLoginButton");
let scoreDisplay: JQuery = $("#score");
let errorPanel: JQuery = $("#error");
let staticWords: JQuery = $("#staticWords");

let loggedIn: boolean = false;

let score: number = 0.0;
let unusedPhrases: string[] = PHRASES;


enum Errors { ERROR, INFO };
function error(text: string, type: Errors = Errors.ERROR) {
  errorPanel.slideDown(500, null);
  if (type === Errors.ERROR) {
    errorPanel.removeClass("alert-info");
    errorPanel.addClass("alert-danger");
  } else {
    errorPanel.removeClass("alert-danger");
    errorPanel.addClass("alert-info");
  }
  errorPanel.html("<a href=\"#\" class=\"close\" data-hide=\"alert\" aria-label=\"close\" onclick=\"errorPanel.slideUp(500, null);\">&times;</a>" + text);
}

function chooseNextPhrase() {
  if (unusedPhrases.length === 0) {
    // Show the end dialog if we've run out of words
    $("#finalScore").html(score.toFixed(2));
    $("#shareModal").modal("show");
  }
  let r: number = Math.floor(Math.random() * unusedPhrases.length);
  let nextPhrase: string = unusedPhrases.splice(r, 1)[0];
  staticWords.html(nextPhrase);
}


function submitWords(): void {
  let words: string = staticWords.html();
  let word: string = wordInput.val();
  word = word.trim().split(" ")[0].toLowerCase().replace(/[\W]/g, ""); // Get only first word of potentially multiple words, and in lower case

  if (word.length === 0) {
    error("Please enter a word.");
    return;
  }

  // Clear input
  wordInput.val("");

  let req: LogProbRequest = {
    queries: [{ words, word }]
  };

  $.post({
    beforeSend: function (xhr: JQueryXHR) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "29db69448b1f423e92dcfa0bddea9195");
    },
    url: WORD_PROB_URL,
    data: JSON.stringify(req)
  })
    .done(function (results: LogProbResponse) {
      score += results.results[0].probability;
      scoreDisplay.html(score.toFixed(2));

      // Get best next word for info display
      $.post({
        beforeSend: function (xhr: JQueryXHR) {
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "29db69448b1f423e92dcfa0bddea9195");
        },
        url: GEN_WORDS_URL + "&words=" + encodeURIComponent(staticWords.html()),
        data: {}
      })
        .done(function (results: GenWordsResponse) {
          error("The most probable word that round was: <strong>" + results.candidates[0].word + "</strong>", Errors.INFO);
        });

      chooseNextPhrase();
    })
    .fail(function () {
      error("Oops! Something went wrong; perhaps your word is too long? Please try again.");
    });
}

function reset() {
  score = 0.0;
  scoreDisplay.html("0");
  unusedPhrases = PHRASES;
  $("#shareModal").modal("hide");
}


// These functions do some Facebook stuff
function initFBStuff() {
  FB.init({
    appId: "1748453752089823",
    cookie: true,
    version: "v2.7"
  });

  FB.getLoginStatus(statusChangeCallback);

  fbLoginButton.on("click", function () {
    if (!loggedIn) {
      FB.login(function (response: any) {
        if (response.authResponse) {
          fbLoginButton.html("<img src=\"FB-f-Logo__white_50.png\"> Log out");
          loggedIn = true;
        }
      }, { scope: "email,public_profile" });
    } else {
      FB.logout(function () {
        fbLoginButton.html("<img src=\"FB-f-Logo__white_50.png\"> Log in using Facebook");
        loggedIn = false;
      });
    }
  });
}

function statusChangeCallback(response) {
  if (response.status === "connected") {
    FB.api("/me", "get",
      {
        fields: "first_name,last_name"
      },
      function (response: any) {
        $("#name").html(response.first_name);
      }
    );
    fbLoginButton.html("<img src=\"FB-f-Logo__white_50.png\"> Log out");
    loggedIn = true;
  }
  fbLoginButton.removeClass("hide");
}


// Get click handlers and other things ready on page load
$(document).ready(function () {
  errorPanel.hide();
  errorPanel.removeClass("hide");

  chooseNextPhrase();
  submitButton.on("click", submitWords);

  $("#fbShareButton").on("click", function () {
    FB.ui({
      method: "share",
      href: "https://nextword.azurewebsites.net/",
      quote: "My score was " + score.toFixed(2) + "! - NextWord"
    }, null);
  });

  $("#resetButton").on("click", reset);
});
