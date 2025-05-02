// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const preGame = document.getElementById('pre-game');
const activeGame = document.getElementById('active-game');
const postGame = document.getElementById('post-game');
const startGameBtn = document.getElementById('start-game-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const howToPlayModal = document.getElementById('how-to-play-modal');
const closeHowToPlay = document.getElementById('close-how-to-play');
const nextBtn = document.getElementById('next-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const shareScoreBtn = document.getElementById('share-score-btn');
const optionsContainer = document.getElementById('options-container');
const timerElement = document.getElementById('timer');
const timeProgress = document.getElementById('time-progress');
const currentQuestionElement = document.getElementById('current-question');
const userIssueElement = document.getElementById('user-issue');
const userNameElement = document.getElementById('user-name');
const finalScoreElement = document.getElementById('final-score');
const scoreMessageElement = document.getElementById('score-message');
const timeBonusElement = document.getElementById('time-bonus');
const efficiencyScoreElement = document.getElementById('efficiency-score');
const correctSolutionsElement = document.getElementById('correct-solutions');
const totalTimeElement = document.getElementById('total-time');

// Game Variables
let currentQuestion = 0;
let score = 0;
let timeLeft = 90; //Time left to select answer
let timerInterval;
let totalTime = 0;
let correctAnswers = 0;
let efficiencyScore = 0;
let gameStarted = false;
let timeBonus = 0;

// Sample Questions Data
const questions = [
    {
        userName: "Sarah from Marketing",
        issue: "I can't connect to the company WiFi on my laptop. I've tried restarting but still no connection.",
        options: [
            { text: "Ask Sarah to check if WiFi is enabled on her laptop", isOptimal: false },
            { text: "Guide Sarah through forgetting the network and reconnecting", isOptimal: false },
            { text: "Check if the WiFi access point in Marketing is online, then walk Sarah through troubleshooting", isOptimal: true },
            { text: "Tell Sarah to use her mobile hotspot until IT can look at it tomorrow", isOptimal: false }
        ]
    },
    {
        userName: "Michael in Sales",
        issue: "My email attachment won't open. It says 'file format not supported' but it's just a PDF.",
        options: [
            { text: "Ask Michael to forward the email to you so you can check the attachment", isOptimal: false },
            { text: "Guide Michael to save the attachment and open it with Adobe Reader instead of the browser", isOptimal: true },
            { text: "Tell Michael to ask the sender to resend the file in a different format", isOptimal: false },
            { text: "Remote into Michael's computer to try opening the file yourself", isOptimal: false }
        ]
    },
    {
        userName: "Accounting Team",
        issue: "Our shared Excel file on the network drive keeps saying 'file in use by another user' even when no one is editing it.",
        options: [
            { text: "Have everyone close Excel, then you delete the lock file (.~) on the server", isOptimal: true },
            { text: "Make a copy of the file and have Accounting use the new version", isOptimal: false },
            { text: "Tell them to wait 30 minutes and try again", isOptimal: false },
            { text: "Check who last had the file open and ask them to properly close it", isOptimal: false }
        ]
    },
    {
        userName: "Lisa in HR",
        issue: "I received an email from the CEO asking for employee W2 forms but it seems suspicious. What should I do?",
        options: [
            { text: "Forward the email to the security team and don't respond", isOptimal: true },
            { text: "Reply to verify if the CEO really sent this request", isOptimal: false },
            { text: "Check the email headers to see where it really came from", isOptimal: false },
            { text: "Call the CEO's assistant to verify the request", isOptimal: false }
        ]
    },
    {
        userName: "Robert in Development",
        issue: "My dual monitor setup stopped working after the Windows update. The second monitor is detected but not displaying.",
        options: [
            { text: "Have Robert roll back the recent Windows update", isOptimal: false },
            { text: "Guide Robert through checking display settings and extending the display", isOptimal: false },
            { text: "Check for updated graphics drivers and reinstall monitor drivers", isOptimal: true },
            { text: "Suggest Robert uses the laptop screen until IT can look at it", isOptimal: false }
        ]
    }
];

// Event Listeners
mobileMenuButton.addEventListener('click', toggleMobileMenu);
startGameBtn.addEventListener('click', startGame);
howToPlayBtn.addEventListener('click', showHowToPlay);
closeHowToPlay.addEventListener('click', hideHowToPlay);
nextBtn.addEventListener('click', nextQuestion);
playAgainBtn.addEventListener('click', resetGame);
shareScoreBtn.addEventListener('click', shareScore);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        hideMobileMenu();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Functions
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}

function hideMobileMenu() {
    mobileMenu.classList.add('hidden');
}

function showHowToPlay() {
    howToPlayModal.classList.remove('hidden');
}

function hideHowToPlay() {
    howToPlayModal.classList.add('hidden');
}

function startGame() {
    gameStarted = true;
    preGame.classList.add('hidden');
    activeGame.classList.remove('hidden');
    loadQuestion(currentQuestion);
    startTimer();
}

function loadQuestion(index) {
    if (index >= questions.length) {
        endGame();
        return;
    }

    const question = questions[index];
    currentQuestionElement.textContent = index + 1;
    userNameElement.textContent = `:User  ${question.userName}`;
    userIssueElement.textContent = question.issue;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Add new options
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('button');
        optionElement.className = 'game-card p-4 text-left hover:bg-gray-700 transition';
        optionElement.innerHTML = `
            <div class="flex items-start">
                <div class="bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-1">
                    ${String.fromCharCode(65 + i)}
                </div>
                <div>${option.text}</div>
            </div>
        `;
        optionElement.addEventListener('click', () => selectOption(i, option.isOptimal));
        optionsContainer.appendChild(optionElement);
    });

    // Reset timer for new question
    resetTimer();
}

function selectOption(optionIndex, isOptimal) {
    clearInterval(timerInterval);
    
    // Disable all options
    const options = optionsContainer.querySelectorAll('button');
    options.forEach(option => {
        option.disabled = true;
        option.classList.remove('hover:bg-gray-700');
    });

    // Highlight selected option
    const selectedOption = options[optionIndex];
    if (isOptimal) {
        selectedOption.classList.add('bg-green-600', 'text-white');
        score += 20; // Base score
        timeBonus += Math.floor(timeLeft / 3); // Time bonus
        efficiencyScore++;
        correctAnswers++;
    } else {
        selectedOption.classList.add('bg-blue-600', 'text-white');
        score += 10; // Lower score solution
        correctAnswers++;
    }

    // Show next button
    nextBtn.classList.remove('hidden');
}

function nextQuestion() {
    currentQuestion++;
    nextBtn.classList.add('hidden');
    
    // Scroll to top of game section
    document.getElementById('game').scrollIntoView({ behavior: 'smooth' });
    
    if (currentQuestion < questions.length) {
        loadQuestion(currentQuestion);
    } else {
        endGame();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        timeProgress.style.width = `${(timeLeft / 90) * 100}%`;
        
        if (timeLeft <= 15) { // Soon out of time highlight
            timerElement.classList.add('text-red-400');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Auto-select first option if time runs out
            const options = optionsContainer.querySelectorAll('button');
            if (options.length > 0) {
                options[0].click();
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 90; 
    timerElement.textContent = timeLeft;
    timeProgress.style.width = '100%';
    timerElement.classList.remove('text-red-400');
    startTimer();
}

function endGame() {
    clearInterval(timerInterval);
    activeGame.classList.add('hidden');
    postGame.classList.remove('hidden');
    
    // Calculate final score
    const finalScore = score + timeBonus;
    finalScoreElement.textContent = finalScore;
    
    // Set score message
    if (finalScore >= 90) {
        scoreMessageElement.textContent = "Excellent! You're helpdesk superstar material!";
    } else if (finalScore >= 70) {
        scoreMessageElement.textContent = "Great job! You have strong troubleshooting skills.";
    } else if (finalScore >= 50) {
        scoreMessageElement.textContent = "Good effort! With more practice you'll be even better.";
    } else {
        scoreMessageElement.textContent = "Keep practicing! Review the scenarios to improve.";
    }
    
    // Set stats
    timeBonusElement.textContent = `+${timeBonus}`;
    efficiencyScoreElement.textContent = `${efficiencyScore}/${questions.length}`;
    correctSolutionsElement.textContent = `${correctAnswers}/${questions.length}`;
    
    // Format total time (would calculate actual time in real completion)
    const minutes = Math.floor((questions.length * 90 - timeLeft) / 60); 
    const seconds = (questions.length * 90 - timeLeft) % 60; 
    totalTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function resetGame() {
    currentQuestion = 0;
    score = 0;
    timeLeft = 90; 
    totalTime = 0;
    correctAnswers = 0;
    efficiencyScore = 0;
    timeBonus = 0;
    
    postGame.classList.add('hidden');
    preGame.classList.remove('hidden');
}

function shareScore() {
    // In a real completion, this would share to social media
    alert(`Share your score of ${finalScoreElement.textContent}/100 with colleagues! (This would link to social sharing in a real app)`);
}