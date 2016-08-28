/// <reference path="../typings/globals/jquery/index.d.ts" />

var words: string = "I have to";

var genWordsUrl: string = "https://api.projectoxford.ai/text/weblm/v1.0/generateNextWords?model=body&maxNumOfCandidatesReturned=10";
var wordProbUrl: string = "https://api.projectoxford.ai/text/weblm/v1.0/calculateConditionalProbability?model=body";

var requestBody = {
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

$(document).ready(function () {
  $("#probResults")[0].innerHTML = "Words: "; + requestBody.queries.join(", ");
  for (var i = 0; i < requestBody.queries.length-1; i++) {
    $("#probResults")[0].innerHTML += requestBody.queries[i].word + ", ";
  }
  $("#probResults")[0].innerHTML += requestBody.queries[requestBody.queries.length-1].word;

  $.ajax(wordProbUrl, {
    beforeSend: function (xhr: JQueryXHR) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "29db69448b1f423e92dcfa0bddea9195");
    },
    method: "POST",
    data: JSON.stringify(requestBody),
  })
    .done(function (results) {
      var probString: string = "Probabilities: ";
      $.each(results.results, function (idx: number, val: any) {
        probString += val.probability.toString();
        if (idx <= results.results.length) {
          probString += ", ";
        }
      });
      $("#probResults")[0].innerHTML += "<br>" + probString;
    });
});

var submitButton : JQuery = $("#wordSubmitButton");
