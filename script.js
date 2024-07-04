const quizData = [
    // Section 1: Extraversion
    [
        {question: "I feel comfortable in social situations."},
        {question: "I enjoy being the center of attention."},
        {question: "I prefer working in teams rather than alone."},
    ],
    // Section 2: Conscientiousness
    [
        {question: "I am always prepared and organized."},
        {question: "I pay attention to details."},
        {question: "I complete tasks thoroughly and on time."},
    ],
    // Section 3: Agreeableness
    [
        {question: "I am interested in other people's feelings."},
        {question: "I try to avoid conflicts and seek harmony."},
        {question: "I enjoy cooperating with others."},
    ],
    // Section 4: Neuroticism
    [
        {question: "I often feel anxious or worried."},
        {question: "I am easily stressed or overwhelmed."},
        {question: "My mood can change quickly."},
    ],
    // Section 5: Openness to Experience
    [
        {question: "I have a vivid imagination."},
        {question: "I enjoy trying new and diverse experiences."},
        {question: "I am curious about many different things."},
    ]
];

const sectionTitles = [
    "Extraversion",
    "Conscientiousness",
    "Agreeableness",
    "Neuroticism",
    "Openness to Experience"
];

let currentSection = 0;
let currentQuestion = 0;
let userAnswers = Array(5).fill().map(() => Array(3).fill(null));
let currentUser = null;

// Modal handling functions
function showSectionChangeModal(message) {
    document.getElementById('sectionChangeMessage').textContent = message;
    var modal = new bootstrap.Modal(document.getElementById('sectionChangeModal'));
    modal.show();
}

function showAlertModal(message) {
    document.getElementById('alertMessage').textContent = message;
    var modal = new bootstrap.Modal(document.getElementById('alertModal'));
    modal.show();
}

// Authentication functions
function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function signup() {
    console.log('Signup function called');
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    
    if (!username || !password) {
        showAlertModal('Please enter both username and password');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || {};
    
    if (users[username]) {
        showAlertModal('Username already exists');
        return;
    }

    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    console.log('User signed up:', username);
    console.log('Current users:', JSON.stringify(users));
    showAlertModal('Signup successful! Please login.');
    showLogin();
}

function login() {
    console.log('Login function called');
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    let users = JSON.parse(localStorage.getItem('users')) || {};
    console.log('Attempting login for:', username);
    console.log('Stored users:', JSON.stringify(users));
    
    if (users[username] === password) {
        currentUser = username;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('start-quiz-btn').style.display = 'block';
        updateDashboard();
        console.log('Login successful');
    } else {
        showAlertModal('Invalid username or password');
        console.log('Login failed');
    }
}

function logout() {
    console.log('Logout function called');
    currentUser = null;
    userAnswers = Array(5).fill().map(() => Array(3).fill(null));
    currentSection = 0;
    currentQuestion = 0;
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('landing-page').style.display = 'block';
    document.getElementById('start-quiz-btn').style.display = 'none';
    updateDashboard();
}

function updateDashboard() {
    console.log('Updating dashboard');
    const userNameElement = document.getElementById('user-name');
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    
    if (currentUser) {
        userNameElement.textContent = `Welcome, ${currentUser}!`;
        loginLogoutBtn.textContent = 'Logout';
        loginLogoutBtn.onclick = logout;
    } else {
        userNameElement.textContent = '';
        loginLogoutBtn.textContent = 'Login';
        loginLogoutBtn.onclick = showAuthContainer;
    }
}

function showAuthContainer() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
    showLogin();
}

function startQuiz() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    loadQuestion();
}

// Quiz functions
function loadQuestion() {
    const questionData = quizData[currentSection][currentQuestion];
    document.getElementById('section-title').textContent = `Section ${currentSection + 1}: ${sectionTitles[currentSection]}`;
    document.getElementById('question-container').innerHTML = `
        <h3 class="mb-4">${questionData.question}</h3>
        <div class="options">
            ${[1, 2, 3, 4, 5].map(option => `
                <label>
                    <input type="radio" name="answer" value="${option}" ${userAnswers[currentSection][currentQuestion] === option ? 'checked' : ''}>
                    <span>${option}</span>
                    ${option === 1 ? 'Strongly Disagree' : option === 5 ? 'Strongly Agree' : ''}
                </label>
            `).join('')}
        </div>
    `;
    updateProgressBar();
}

function updateProgressBar() {
    const progress = ((currentSection * 3 + currentQuestion + 1) / (quizData.length * 3)) * 100;
    const progressBar = document.getElementById('progress');
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
}

function moveToNextQuestion() {
    if (currentQuestion < 2) {
        currentQuestion++;
    } else if (currentSection < quizData.length - 1) {
        currentSection++;
        currentQuestion = 0;
        showSectionChangeModal(`You are now entering Section ${currentSection + 1}: ${sectionTitles[currentSection]}`);
    } else {
        showResults();
        return;
    }
    loadQuestion();
}

function moveToPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
    } else if (currentSection > 0) {
        currentSection--;
        currentQuestion = 2;
        showSectionChangeModal(`You are now entering Section ${currentSection + 1}: ${sectionTitles[currentSection]}`);
    }
    loadQuestion();
}

function showResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    const totalScore = calculateTotalScore();
    document.getElementById('total-score').textContent = totalScore;
    displayAnalysis(totalScore);
    createChart();
    displayDetailedSummary();
}

function calculateTotalScore() {
    return userAnswers.flat().reduce((sum, answer) => sum + (answer || 0), 0);
}

function displayAnalysis(totalScore) {
    const maxPossibleScore = 5 * 5 * 3; // 5 sections, 5 max score per question, 3 questions per section
    const percentage = (totalScore / maxPossibleScore) * 100;
    let analysis = '';

    if (percentage >= 80) {
        analysis = "You scored very high on this assessment. This suggests that you have a strong tendency towards extraversion, conscientiousness, agreeableness, emotional stability, and openness to experience.";
    } else if (percentage >= 60) {
        analysis = "You scored above average on this assessment. This indicates that you have a good balance of personality traits, with strengths in most areas.";
    } else if (percentage >= 40) {
        analysis = "Your score is in the average range. This suggests a balanced personality profile with a mix of traits.";
    } else if (percentage >= 20) {
        analysis = "Your score is below average. This might indicate a tendency towards introversion, spontaneity over strict organization, selective social interactions, some emotional sensitivity, and a preference for familiar experiences.";
    } else {
        analysis = "Your score is in the lower range. This could suggest strong preferences for solitary activities, a very flexible approach to tasks, cautious social interactions, higher emotional reactivity, and a comfort with routine experiences.";
    }

    document.getElementById('analysis').innerHTML = `<p>${analysis}</p>`;
}

function createChart() {
    const ctx = document.getElementById('analysis-chart').getContext('2d');

    const sectionScores = userAnswers.map(section => 
        section.reduce((sum, score) => sum + (score || 0), 0)
    );

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sectionTitles,
            datasets: [{
                label: 'Your Personality Profile',
                data: sectionScores,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 15,
                    title: {
                        display: true,
                        text: 'Score',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Personality Traits',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + ' / 15';
                            }
                            return label;
                        }
                    },
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    }
                }
            }
        }
    });
}


function displayDetailedSummary() {
    let summaryHTML = '<h2>Detailed Summary</h2>';
    
    for (let i = 0; i < quizData.length; i++) {
        summaryHTML += `<h3>${sectionTitles[i]}</h3>`;
        summaryHTML += '<ul>';
        
        let sectionScore = 0;
        for (let j = 0; j < quizData[i].length; j++) {
            const answer = userAnswers[i][j];
            sectionScore += answer || 0;
            summaryHTML += `<li>
                <strong>Question:</strong> ${quizData[i][j].question}<br>
                <strong>Your Answer:</strong> ${answer ? answer : 'Not answered'}
                ${answer ? `(${getAnswerDescription(answer)})` : ''}
            </li>`;
        }
        
        summaryHTML += '</ul>';
        
        const maxSectionScore = quizData[i].length * 5;
        const sectionPercentage = (sectionScore / maxSectionScore) * 100;
        
        summaryHTML += `<p><strong>Section Score:</strong> ${sectionScore} out of ${maxSectionScore} (${sectionPercentage.toFixed(2)}%)</p>`;
        summaryHTML += `<p><strong>Section Summary:</strong> ${getSectionSummary(i, sectionPercentage)}</p>`;
        summaryHTML += '<hr>';
    }
    
    document.getElementById('detailed-summary').innerHTML = summaryHTML;
}

function getAnswerDescription(answer) {
    switch(answer) {
        case 1: return 'Strongly Disagree';
        case 2: return 'Disagree';
        case 3: return 'Neutral';
        case 4: return 'Agree';
        case 5: return 'Strongly Agree';
        default: return '';
    }
}

function getSectionSummary(sectionIndex, percentage) {
    const trait = sectionTitles[sectionIndex];
    if (percentage >= 80) {
        return `You scored very high in ${trait}, indicating a strong presence of this trait in your personality.`;
    } else if (percentage >= 60) {
        return `You scored above average in ${trait}, suggesting a notable presence of this trait in your personality.`;
    } else if (percentage >= 40) {
        return `Your score in ${trait} is average, indicating a balanced presence of this trait in your personality.`;
    } else if (percentage >= 20) {
        return `You scored below average in ${trait}, suggesting a lower presence of this trait in your personality.`;
    } else {
        return `Your score in ${trait} is low, indicating a minimal presence of this trait in your personality.`;
    }
}

function restartQuiz() {
    currentSection = 0;
    currentQuestion = 0;
    userAnswers = Array(5).fill().map(() => Array(3).fill(null));
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    loadQuestion();
}

// Function to clear localStorage for testing purposes
function clearLocalStorage() {
    localStorage.clear();
    console.log('localStorage cleared');
    showAlertModal('Local storage has been cleared.');
}



// Event Listeners
document.getElementById('show-signup').addEventListener('click', showSignup);
document.getElementById('show-login').addEventListener('click', showLogin);
document.getElementById('signup-btn').addEventListener('click', signup);
document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
document.getElementById('prev-btn').addEventListener('click', moveToPreviousQuestion);
document.getElementById('next-btn').addEventListener('click', () => {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        userAnswers[currentSection][currentQuestion] = parseInt(selectedAnswer.value);
    }
    moveToNextQuestion();
});
document.getElementById('restart-btn').addEventListener('click', restartQuiz);
document.getElementById('share-btn').addEventListener('click', () => {
    // Implement sharing functionality (e.g., copy results to clipboard or open a share dialog)
    showAlertModal('Share functionality to be implemented');
});
document.getElementById('login-logout-btn').addEventListener('click', function() {
    if (currentUser) {
        logout();
    } else {
        showAuthContainer();
    }
});
document.getElementById('clear-storage-btn').addEventListener('click', clearLocalStorage);

// Initialize the page
updateDashboard();