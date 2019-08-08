//gets words from a random word API, assigns word to game.answer
let apiHandler = {
    load: function() {
        const xhr = new XMLHttpRequest();
        //if you are only getting "W" it is because the api key expires https://random-word-api.herokuapp.com/ (it will get "Wrong API key", word[0] of this is "w")
        xhr.open("GET", "https://random-word-api.herokuapp.com/word?key=2W1V6L09&number=1", true);
        
        xhr.onload = function() {
            //status 200: "Ok" | 403: "Forbidden" | 404: "Not Found"
            if(xhr.status == 200) {
                let word = JSON.parse(this.responseText);
                game.answer = word[0].toUpperCase();
            }
            else {
                console.log("xhr status is " + xhr.status);
            }
        };
        xhr.send();
    }
}


//does all processing for game
let game = {
    answer: "TEST",                                     //answer to guess, pulled from random-word API onload
    userAnswer: [],                                     //stores user input
    alphabet: document.querySelectorAll("figure"),      //node list of all user input options
    chancesLeft: 6,                                     //number of lives until gameOver()
    hangIndex: 0,                                       //used for hangmanArr index
    userGuess: function(e) {
        let letter = e.target.innerText.toUpperCase();
        
        //.not-valid makes the letter inactive (after being selected). You can only select each letter once.
        if(e.target.classList.contains("not-valid")) {
            return;
        }
        let wasWrong = game.populateUserAnswer(letter);
        view.outputAnswer();
        view.disableLetter(e.target);
        
        wasWrong ? view.drawHangMan() : game.compareWords();
    },
    populateUserAnswer: function(letter) {
        let wasWrong = true;
        
        //if letter matches letters in answer array, add to userAnswer array
        for(let i = 0; i < game.answer.length; i++) {
            if(letter === game.answer[i]) {
                game.userAnswer.splice(i, 1, letter);
                wasWrong = false;
            }
        }
        return wasWrong;
    },
    //adds _ to each letter and " " to each " " in userAnswer array, to match answer array.
    getAnswerLength: function() {
        game.userAnswer = [];
        for(let i = 0; i < game.answer.length; i++) {
            game.answer[i] === " " ? game.userAnswer.push(" ") : game.userAnswer.push("_");
        }
        view.outputAnswer();
    },
    //compares userAnswer to answer array, if they are the same, game is won
    compareWords: function() {
        let isComplete = true;
        for(let i = 0; i < game.answer.length; i++) {
            if(game.userAnswer[i] == game.answer[i]) {
                isComplete = true;
            }
            else {
                isComplete = false;
                return;
            }
        }
        if(isComplete) {
            view.gameOver("you-win");
        }
    }
}


//outputs data processed by game to DOM
let view = {
    hangman: document.getElementById("hangman"),
    hangmanArr: ["hangman-0.jpg", "hangman-1.jpg", "hangman-2.jpg", "hangman-3.jpg", "hangman-4.jpg", "hangman-5.jpg", "hangman-6.jpg"],
    //outputs userAnswer to DOM
    outputAnswer: function() {
        let answerContainer = document.getElementById("answer-container");

        answerContainer.innerHTML = "";
        answerContainer.innerHTML = game.userAnswer.join("");
    },
    //adds to hangman drawing each time you guess incorrectly
    drawHangMan: function() {        
        if(game.hangIndex < 5) {
            game.hangIndex++;
            this.hangman.src = "img/" + this.hangmanArr[game.hangIndex];
        } 
        else {    
            view.gameOver("you-lose");

            game.hangIndex = 0;
            this.hangman.src = "img/" + this.hangmanArr[game.hangIndex];  
        }        
    },
    //shows #game-over and #overlay elements in DOM when you lose
    gameOver: function(result) {
        let resultMenu = document.getElementById(result);
        let overlay = document.getElementById("overlay");

        resultMenu.classList.remove("hide");
        overlay.classList.remove("hide");

        //resets hangman image
        game.hangIndex = 0;
        this.hangman.src = "img/" + this.hangmanArr[game.hangIndex];

        apiHandler.load();
    },
    //hides all overlay menus
    startGame: function() {
        let loseMenu = document.getElementById("you-lose");
        let winMenu = document.getElementById("you-win");
        let mainMenu = document.getElementById("main-menu");
        let overlay = document.getElementById("overlay");

        loseMenu.classList.add("hide");
        winMenu.classList.add("hide");
        mainMenu.classList.add("hide");
        overlay.classList.add("hide");

        game.getAnswerLength();
        this.enableLetters();
    },
    //adds .not-valid class to targeted letters
    disableLetter: function(letter) {
        letter.classList.add("not-valid");
    },
    enableLetters: function() {
        game.alphabet.forEach((letter) => letter.classList.remove("not-valid"));
    }
}

//creates a node list of all letter options in DOM
game.alphabet.forEach((letter) => letter.addEventListener("click", game.userGuess));