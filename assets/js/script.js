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

var rightAnswer;
var correctAnswers;
var userAnswer;
var secondsLeft;
var questionIndex = 0;


//this is an array of question data formatted in JSON.
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
    }

]


function countdown() {
    timeEl.textContent = "Time left: " + secondsLeft + " seconds.";
    // Sets interval in variable
    var timerInterval = setInterval(function() {
        secondsLeft--;
        timeEl.textContent = "Time left: " + secondsLeft + " seconds.";
  
      if(secondsLeft === 0) {
        // Stops execution of action at set interval
        endQuiz();
        clearInterval(timerInterval);        
      }
  
    }, 1000);
}


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

function checkAnswer(){
        if (userAnswer === rightAnswer){
            correctAnswers++;
            scorecardEl.textContent = "Correct answers: " + correctAnswers;
            console.log("right answer!");
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
            console.log("wrong answer!");
            if(questionIndex === questionSet.length - 1){
            endQuiz();
        }
        else{
            questionIndex++;
            askAQuestion();
        }
        }
}

startButton.addEventListener("click", startQuiz);

function startQuiz(){ 

    secondsLeft = 15;
    correctAnswers = 0;
    
    startButton.classList.add("hidden");
    starterText.classList.add("hidden");
    gameContentEl.classList.remove("hidden");

    finalScoreEl.classList.add("hidden");
    logButtonEl.classList.add("hidden");
    usersInitialsArea.classList.add("hidden");
    
  
    //begins the countdown timer.
    countdown();
    //loads the first question.
    askAQuestion();

}

function displayHighScores(){}

function endQuiz(){
    questionIndex = 0;

    var finalScoreText = "Your final socre was: " + correctAnswers + " right answers!";
    starterText.classList.remove("hidden");
    startButton.classList.remove("hidden");
    gameContentEl.classList.add("hidden");
    
    finalScoreEl.textContent = finalScoreText;
    finalScoreEl.classList.remove("hidden");
    logButtonEl.classList.remove("hidden");
    usersInitialsArea.classList.remove("hidden");
}


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

logButtonEl.addEventListener("click", function(){
    var userInitials = usersInitialsArea.value;
    if(userInitials != null){
        var userLog = {initials:userInitials, score:correctAnswers};
    window.localStorage.setItem(JSON.stringify(userLog));
    }
})



