/// <reference path="../typings/globals/jquery/index.d.ts" />
/// <reference path="../typings/globals/fbsdk/index.d.ts" />

// These are the URLs for the API
const genWordsUrl: string = "https://api.projectoxford.ai/text/weblm/v1.0/generateNextWords?model=body&maxNumOfCandidatesReturned=10";
const wordProbUrl: string = "https://api.projectoxford.ai/text/weblm/v1.0/calculateConditionalProbability?model=body";

/**
 * These two interfaces provide the type defitinition for the request and
 * response from the WebLM API.
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

let requestBody: LogProbRequest = {
  "queries":
  [
    {
      "words": "hello world wide",
      "word": "web"
    },
    {
      "words": "hello world wide",
      "word": "range"
    },
    {
      "words": "hello world wide",
      "word": "open"
    }
  ]
};

/*
$(document).ready(function () {
  errorPanel[0].innerHTML = "Words: "; + requestBody.queries.join(", ");
  for (let i = 0; i < requestBody.queries.length - 1; i++) {
    errorPanel[0].innerHTML += requestBody.queries[i].word + ", ";
  }
  errorPanel[0].innerHTML += requestBody.queries[requestBody.queries.length - 1].word;

  $.ajax(wordProbUrl, {
    beforeSend: function (xhr: JQueryXHR) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "29db69448b1f423e92dcfa0bddea9195");
    },
    method: "POST",
    data: JSON.stringify(requestBody),
  })
    .done(function (results: LogProbResponse) {
      let probString: string = "Probabilities: ";
      $.each(results.results, function (idx: number, val: { words: string, word: string, probability: number }) {
        probString += val.probability.toString();
        if (idx <= results.results.length) {
          probString += ", ";
        }
      });
      errorPanel[0].innerHTML += "<br>" + probString;
    });
});
*/

let submitButton: JQuery = $("#wordSubmitButton");
let wordInput: JQuery = $("#wordInput");
let fbLoginButton: JQuery = $("#fbLoginButton");
let scoreDisplay: JQuery = $("#score");
let errorPanel: JQuery = $("#error");

let loggedIn: boolean = false;

let score: number = 0.0;


function submitWords(): void {
  let words: string = "Where is the";
  let word: string = wordInput.val();

  if (word.length == 0) {
    errorPanel.parent().slideDown(500, null);
    errorPanel.parent().removeClass("panel-info");
    errorPanel.parent().addClass("panel-danger");
    errorPanel.html("Please enter a word.");
    return;
  }

  let req: LogProbRequest = {
    queries: [{ words, word }]
  };

  $.post({
    beforeSend: function (xhr: JQueryXHR) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "29db69448b1f423e92dcfa0bddea9195");
    },
    url: wordProbUrl,
    data: JSON.stringify(req)
  })
    .done(function (results: LogProbResponse) {
      errorPanel.parent().slideUp(500, null);
      score += results.results[0].probability;
      scoreDisplay.html("Current score: " + score);
    })
    .fail(function () {
      errorPanel.parent().slideDown(500, null);
      errorPanel.parent().removeClass("panel-info");
      errorPanel.parent().addClass("panel-danger");
      errorPanel.html("Oops! Something went wrong; perhaps your word is too long? Please try again.");
    });
}


// These functions do some Facebook stuff
function initFBStuff() {
  FB.init({
    appId: '1748453752089823',
    cookie: true,
    version: 'v2.7'
  });

  $('#fbLoginButton').removeClass('hide');
  FB.getLoginStatus(statusChangeCallback);
}

function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  if (response.status === 'connected') {
    FB.api('/me', "get",
      {
        fields: "first_name,last_name"
      },
      function (response: any) {
        console.log('Successful login for: ' + response.first_name + " " + response.last_name);
      }
    );
  }
}


// Get click handlers and other things ready on page load
$(document).ready(function () {
  errorPanel.parent().hide();
  errorPanel.parent().removeClass("hide");

  submitButton.on("click", submitWords);

  fbLoginButton.on("click", function () {
    if (!loggedIn) {
      FB.login(function (response: any) {
        if (response.authResponse) {
          fbLoginButton.html("<img src=\"FB-f-Logo__white_50.png\"> Log out");
          loggedIn = true;
        }
      }, {scope: "email,public_profile"});
    }
    else {
      FB.logout(function () {
        fbLoginButton.html("<img src=\"FB-f-Logo__white_50.png\"> Log in using Facebook");
        loggedIn = false;
      });
    }
  });
});




