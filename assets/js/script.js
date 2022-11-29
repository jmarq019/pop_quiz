//these variables correspond to elements on my page.
var startButton = document.getElementById('startButton');
var starterText = document.getElementById('starterText');
var questionTextEl = document.getElementById('questionText');
var optionA = document.getElementById('optionA');
var optionB = document.getElementById('optionB');
var optionC = document.getElementById('optionC');
var optionD = document.getElementById('optionD');
var timeEl = document.getElementById('timeLeft');
var gameContentEl = document.getElementById('gameContent');
var scorecardEl = document.getElementById('scorecard');
var finalScoreEl = document.getElementById('finalScoreText');
var logButtonEl = document.getElementById('logButton');
var usersInitialsArea = document.getElementById("userInitials");
var highScoresContainerEl = document.getElementById('highScoresContainer')
var highScoresEl = document.getElementById("highScores");

//these global variables are needed by multiple functions
var rightAnswer;
var correctAnswers;
var userAnswer;
var secondsLeft;
var questionIndex = 0;
var timerInterval;
var userLog = [];


//this is an array of question objects.
let questionSet = [
    {
        "questionText": "This is a sample question",
        "rightAnswer": "A: The answer.",
        "optionA": "A: The answer.",
        "optionB": "B: Not the answer.",
        "optionC": "C: Maybe the answer.",
        "optionD": "D: Definitely not the answer."
    },
    {
        "questionText": "What is the capital city of Alabama?",
        "rightAnswer": "C: Montgomery",
        "optionA": "A: London",
        "optionB": "B: Africa",
        "optionC": "C: Montgomery",
        "optionD": "D: Ho Chi Minh City"
    },
    {
        "questionText":"Who am I?",
        "rightAnswer":"Monica Vitti",
        "optionA":"Peppa Pig",
        "optionB":"Monica Vitti",
        "optionC":"Monica Belucci",
        "optionD":"The Queen of England"
    }

]


function countdown() {
    timeEl.textContent = "Time left: " + secondsLeft + " seconds.";
    // Sets interval in variable
    timerInterval = setInterval(function() {
        secondsLeft--;
        timeEl.textContent = "Time left: " + secondsLeft + " seconds.";
  
      if(secondsLeft <= 0) {
        // Stops execution of action at set interval
        endQuiz();        
      }
  
    }, 3000);
}

//this function places my question and response text on the page
function askAQuestion(){

    var theQuestionText = questionSet[questionIndex].questionText;
    var theOptionA = questionSet[questionIndex].optionA;
    var theOptionB = questionSet[questionIndex].optionB;
    var theOptionC = questionSet[questionIndex].optionC;
    var theOptionD = questionSet[questionIndex].optionD; 

    
    optionA.textContent = theOptionA;
    optionB.textContent = theOptionB;
    optionC.textContent = theOptionC;
    optionD.textContent = theOptionD;
    questionTextEl.textContent = theQuestionText;
    
    rightAnswer = questionSet[questionIndex].rightAnswer;

}

//this function evaluates the user's response to see if they answered wrong or right.
function checkAnswer(){    

        if (userAnswer === rightAnswer){
            correctAnswers++;
            scorecardEl.textContent = "Correct answers: " + correctAnswers;
            
            if (questionIndex === questionSet.length - 1){
            endQuiz();
            }
            else{
                questionIndex++;
                askAQuestion();;
            }
        
        }
        else{
            secondsLeft = secondsLeft - 5;
            if(questionIndex === questionSet.length - 1){
            endQuiz();
        }
        else{
            questionIndex++;
            askAQuestion();
        }
        }
}

//This event listener corresponds to the button that starts the quiz.
startButton.addEventListener("click", startQuiz);

//begins the quiz for the user.
function startQuiz(){ 

    secondsLeft = 15;
    correctAnswers = 0;

    //shows the score as 0 at the start of a new game
    scorecardEl.textContent = "Correct answers: " + correctAnswers;
    
    startButton.classList.add("hidden");
    starterText.classList.add("hidden");
    gameContentEl.classList.remove("hidden");

    highScoresContainerEl.classList.add("hidden");
    logButtonEl.classList.add("hidden");
    usersInitialsArea.classList.add("hidden");
    finalScoreEl.classList.add("hidden");
    
    
  
    //begins the countdown timer.
    countdown();
    //loads the first question.
    askAQuestion();

}


//this function ends the quiz.
function endQuiz(){
    clearInterval(timerInterval);
    questionIndex = 0;

    var finalScoreText = "Your final score was: " + correctAnswers + " right answers!";
    starterText.classList.remove("hidden");
    startButton.classList.remove("hidden");
    gameContentEl.classList.add("hidden");
    
    finalScoreEl.textContent = finalScoreText;
    finalScoreEl.classList.remove("hidden");
    logButtonEl.classList.remove("hidden");
    usersInitialsArea.classList.remove("hidden");
    
}

//these event listeners correspond to the A,B,C,D answer buttons during the quiz.
optionA.addEventListener("click", function(){
    userAnswer = questionSet[questionIndex].optionA;
    checkAnswer();
});

optionB.addEventListener("click", function(){
    userAnswer = questionSet[questionIndex].optionB;
    checkAnswer();
});
    
optionC.addEventListener("click", function(){
    userAnswer = questionSet[questionIndex].optionC;
    checkAnswer();
});
    
optionD.addEventListener("click", function(){
    userAnswer = questionSet[questionIndex].optionD;
    checkAnswer();    
});

//this button helps the user log their score and their initials in the local storage. 
logButtonEl.addEventListener("click", function(){
    var userInitials = usersInitialsArea.value;

    userLog = JSON.parse(localStorage.getItem("userScores")) || [];

    if(userInitials != null){
        userLog.push({initials:userInitials, score:correctAnswers});
    window.localStorage.setItem("userScores", JSON.stringify(userLog));
    }
    displayHighScores();
});

//this function displays the data that was logged in the local storage.
function displayHighScores(){
    logButtonEl.classList.add("hidden");
    usersInitialsArea.classList.add("hidden");
    highScoresContainerEl.classList.remove("hidden");

    userLog = JSON.parse(localStorage.getItem("userScores")) || [];
    for(var i = 0; i < userLog.length; i++){
        var listItem = document.createElement("li");
        listItem.innerText = userLog[i].initials + " : " + userLog[i].score;
        highScoresEl.append(listItem);
    }

}