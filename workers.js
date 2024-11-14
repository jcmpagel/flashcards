// Cloudflare Worker Script

// The KV namespace 'USER_DATA' is bound in the Worker settings.
// It can be accessed directly as USER_DATA.
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    // Serve the HTML page at the root path
    if (url.pathname === '/' && request.method === 'GET') {
        return serveHTML();
    }

    // Handle API routes
    if (url.pathname === '/api/transcribe' && request.method === 'POST') {
        return handleTranscription(request);
    }

    if (url.pathname === '/api/evaluate' && request.method === 'POST') {
        return handleEvaluation(request);
    }

    // New API route for saving user data
    if (url.pathname === '/api/save' && request.method === 'POST') {
        return handleSaveData(request);
    }

    // Serve 404 for other routes
    return new Response('Not Found', { status: 404 });
}

async function serveHTML() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "oxz733wzpa");
    </script>
    <meta charset="UTF-8">
    <!-- Added viewport meta tag for responsiveness -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Flashcard App</title>
    <style>
        /* [Your existing CSS styles] */

        /* Reset some default styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        /* CSS for recording indicator */
        .dot {
            height: 10px;
            width: 10px;
            background-color: red;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .flashcard {
            background-color: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 700px;
            text-align: center;
        }

        /* Name Input Section */
        #nameSection {
            display: block;
        }

        #quizSection {
            display: none;
        }

        .question {
            font-size: 1.8em;
            margin-bottom: 25px;
            color: #333;
        }

        .controls {
            margin-bottom: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        /* Enhanced Start/Stop Recording Button Styles */
        #toggleRecordingBtn {
            background-color: #007BFF;
            border: none;
            border-radius: 30px; /* Pill-shaped */
            padding: 10px 20px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background-color 0.3s ease, transform 0.2s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            color: #fff;
            font-size: 1em;
            min-width: 150px;
            height: 50px;
        }

        #toggleRecordingBtn:hover {
            background-color: #0056b3;
            transform: scale(1.05);
        }

        #toggleRecordingBtn:active {
            transform: scale(0.95);
        }

        /* Recording State */
        #toggleRecordingBtn.recording {
            background-color: #dc3545;
        }

        #toggleRecordingBtn.recording:hover {
            background-color: #c82333;
        }

        /* Icon Styles */
        .icon {
            width: 24px;
            height: 24px;
            fill: #fff;
            transition: fill 0.3s ease;
            margin-right: 8px;
        }

        #recordingIndicator {
            display: none; /* Hidden by default */
            margin-top: 10px;
            font-weight: bold;
            color: red;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #recordingIndicator .dot {
            height: 12px;
            width: 12px;
            background-color: red;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            .flashcard {
                padding: 20px;
            }

            .question {
                font-size: 1.5em;
            }

            #toggleRecordingBtn {
                padding: 8px 16px;
                min-width: 130px;
                height: 45px;
                font-size: 0.9em;
            }

            .icon {
                width: 20px;
                height: 20px;
                margin-right: 6px;
            }

            .controls {
                gap: 10px;
            }
        }

        /* Loading Indicator Styles */
        .loading-indicator {
            display: none; /* Hidden by default */
            margin-top: 10px;
            font-weight: bold;
            color: #007BFF;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .loading-indicator .spinner {
            border: 4px solid #f3f3f3; /* Light grey */
            border-top: 4px solid #007BFF; /* Blue */
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .answer, .evaluation {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f4fd;
            border-radius: 8px;
            text-align: left;
            color: #333;
        }

        .self-evaluation {
            margin-top: 20px;
        }

        .self-evaluation label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
            color: #333;
        }

        .self-evaluation button {
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            background-color: #28a745;
            color: #fff;
            transition: background-color 0.3s ease;
            font-size: 1em;
        }

        .self-evaluation button:hover {
            background-color: #1e7e34;
        }

        .rating-container {
            display: flex;
            align-items: center;
            margin-top: 10px;
        }

        .rating-label {
            width: 150px;
            font-weight: bold;
            color: #333;
        }

        .stars {
            display: flex;
        }

        .stars span {
            font-size: 1.5em;
            color: gold;
            margin-right: 5px;
        }

        .navigation {
            margin-top: 30px;
            text-align: center;
        }

        .navigation button {
            padding: 10px 20px;
            font-size: 1em;
            margin: 0 10px;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            background-color: #17a2b8;
            color: #fff;
            transition: background-color 0.3s ease;
        }

        .navigation button:hover {
            background-color: #117a8b;
        }

        /* Name Input Styles */
        #nameForm {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }

        #nameForm input {
            padding: 10px;
            width: 80%;
            max-width: 300px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 1em;
        }

        #startQuizBtn {
            padding: 10px 20px;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            background-color: #007BFF;
            color: #fff;
            font-size: 1em;
            transition: background-color 0.3s ease;
        }

        #startQuizBtn:hover {
            background-color: #0056b3;
        }

        #welcomeMessage {
            margin-bottom: 20px;
            font-size: 1.2em;
            color: #333;
        }
    </style>
</head>
<body>

<div class="flashcard">
    <!-- Name Input Section -->
    <div id="nameSection">
        <div id="welcomeMessage">Welcome! Please enter your name to start the quiz.</div>
        <form id="nameForm">
            <input type="text" id="userNameInput" placeholder="Enter your name" required />
            <button type="submit" id="startQuizBtn">Start Quiz</button>
        </form>
    </div>

    <!-- Quiz Section -->
    <div id="quizSection">
        <!-- Start/Stop Recording Button -->
        <button id="toggleRecordingBtn" aria-label="Start Recording">
            <!-- Start Recording Icon (Microphone) -->
            <svg id="recordIcon" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2z"/>
            </svg>
            <span id="recordingText">Start Recording</span>
        </button>
        
        <!-- Recording Indicator -->
        <div id="recordingIndicator">
            <span class="dot"></span> Recording...
        </div>

        <!-- Quiz Content -->
        <div id="quizContent">
            <div class="question" id="question">Loading question...</div>

            <div class="controls">
                <!-- Removed Show Answer Button -->
                <!-- New Transcribing Indicator -->
                <div id="transcribingIndicator" class="loading-indicator">
                    <div class="spinner"></div> Transcribing your answer...
                </div>
                <!-- New Analyzing Indicator -->
                <div id="analyzingIndicator" class="loading-indicator">
                    <div class="spinner"></div> Analyzing your answer...
                </div>
            </div>

            <div class="answer" id="answer" style="display:none;">
                <strong>Correct Answer:</strong>
                <p id="correctAnswer"></p>
            </div>

            <div class="self-evaluation" id="selfEval" style="display:none;">
                <label>Self-Evaluate Your Answer:</label>
                <button class="selfEvalBtn" data-rating="Excellent">Excellent</button>
                <button class="selfEvalBtn" data-rating="Good">Good</button>
                <button class="selfEvalBtn" data-rating="Fair">Fair</button>
                <button class="selfEvalBtn" data-rating="Poor">Poor</button>
            </div>

            <div class="evaluation" id="gptEval" style="display:none;">
                <strong>GPT-4 Evaluation:</strong>
                <div id="gptRating" class="rating-container">
                    <div class="rating-label">Accuracy:</div>
                    <div class="stars" id="gptAccuracy"></div>
                </div>
                <div class="rating-container">
                    <div class="rating-label">Completeness:</div>
                    <div class="stars" id="gptCompleteness"></div>
                </div>
                <div class="rating-container">
                    <div class="rating-label">Clarity:</div>
                    <div class="stars" id="gptClarity"></div>
                </div>
                <p id="gptFeedback"></p>
            </div>

            <div class="navigation" id="navigation" style="display:none;">
                <button id="prevBtn">Previous</button>
                <button id="nextBtn">Next</button>
            </div>
        </div>
    </div>

<script>
const flashcards = [
    {
        question: "What was the purpose of the Dartmouth Summer Research Project on Artificial Intelligence in 1956?",
        answer: "The purpose of the Dartmouth Summer Research Project was to explore the idea that every aspect of human intelligence could be precisely described and simulated by machines. The study aimed to investigate how machines could use language, form abstractions and concepts, solve problems typically solved by humans, and improve themselves."
    },
    {
        question: "What is the main difference between rule-based and ML-based systems?",
        answer: "Rule-based systems rely on predefined rules, while ML-based systems learn from data."
    },
    {
        question: "What is the difference between 'Thinking Humanly' and 'Thinking Rationally' in the context of artificial intelligence?",
        answer: "'Thinking Humanly' refers to studying mental faculties and replicating human-like thinking processes through computational models, as seen in cognitive science. 'Thinking Rationally,' on the other hand, involves understanding and modeling reasoning processes that lead to rational actions, regardless of how humans think, focusing purely on logical correctness."
    },
    {
        question: "Describe the different policy options for regulating AI systems in the EU.",
        answer: "Voluntary Labelling Scheme, Sectoral Ad-hoc Approach, Horizontal Risk-Based Approach, Horizontal Approach with Mandatory Requirements."
    },
    {
        question: "A US startup develops an AI medical diagnosis system. While the company is based in Boston, it enters into a partnership with several hospitals in France and Spain to use the system for analyzing patient scans. The AI processes the images on US servers but sends diagnostic recommendations to EU healthcare providers. How would you categorize the 'EU healthcare providers' according to the definition of 'provider' and 'deployer' under the EU AI Act?",
        answer: "Deployer."
    },
    {
        question: "What is 'conformity assessment' and in which risk category of AI does it apply?",
        answer: "Conformity assessment is a legal evaluation to ensure AI systems meet required standards. It applies to 'High-Risk' AI systems."
    },
    {
        question: "What is a horizontal risk-based approach, and how does it differ from a sectoral ad-hoc approach?",
        answer: "A horizontal risk-based approach applies general rules across different risk levels, while a sectoral ad-hoc approach creates specific regulations for particular industries. The AI Act uses the horizontal approach."
    },
    {
        question: "What is the difference between vertical and horizontal discrimination?",
        answer: "Vertical discrimination is the treatment of the state concerning citizens, while horizontal discrimination is the behavior of citizens towards other citizens."
    },
    {
        question: "Imagine an AI system used in hiring unintentionally screens out candidates from a particular zip code. Upon review, you find this area has a high concentration of a specific ethnic group. What type of discrimination might this be considered (direct or indirect) and why?",
        answer: "This is indirect discrimination, as the zip code acts as a proxy for ethnicity."
    },
    {
        question: "What is differential treatment?",
        answer: "Treating comparable groups differently or treating different groups the same way."
    },
    {
        question: "What stages in training an AI algorithm can contribute to discrimination?",
        answer: "Defining target variables, selecting training data, feature selection, using proxies, and intentional discrimination."
    },
    {
        question: "What is the main takeaway from Article 2 in the EU Act?",
        answer: "To whom the regulations established in the EU Act apply."
    },
    {
        question: "What is the main takeaway from Article 3 in the EU Act?",
        answer: "The definitions of terms that occur throughout the EU Act."
    },
    {
        question: "What is the main takeaway from Article 5 in the EU Act?",
        answer: "What AI practices are prohibited by the Act."
    },
    {
        question: "What is the difference between equality and fairness?",
        answer: "Equality is the standard of treating everyone the same. Fairness, however, considers individual circumstances to provide treatment that may differ but is considered fair."
    },
    {
        question: "What are the steps to evaluate discrimination?",
        answer: "1. Check if there is a difference in treatment. 2. Determine if the distinction is based on criteria specified in the applicable regulation. 3. Assess if the differential treatment can be justified."
    },
    {
        question: "What is the relationship between differential treatment, bias, and discrimination?",
        answer: "Bias can lead to differential treatment, and if this treatment cannot be legally justified, it is considered discrimination."
    },
    {
        question: "What is the difference between direct and indirect discrimination?",
        answer: "Direct discrimination is based on clear criteria showing differential treatment, while indirect discrimination involves criteria that need analysis to reveal the distinct factor causing discrimination."
    },
    {
        question: "What is affirmative action, and why can it lead to problems?",
        answer: "Affirmative action is positive action to address existing discrimination. However, if it goes too far, it may result in reverse discrimination, disadvantaging other groups."
    },
    {
        question: "Given the following case study: “TechStart, a Canadian software company, develops an AI system for medical diagnosis. While the company has no physical presence in the EU, it makes the software available for download through its website, and several hospitals in Germany and France begin using it. Is the AI Act applicable territorially? Is the AI Act applicable to TechStart, a Canadian software company?",
        answer: "Yes, the AI Act is applicable. According to Article 2, the Act covers providers who place AI systems on the EU market, regardless of their location. TechStart is a provider, and by making its software available to hospitals in the EU, it has placed the system on the market."
    },
    {
        question: "Is the AI Act applicable to DataCorp, a US company that licenses an AI system exclusively to EuroTech, an Italian company? DataCorp, a US company, develops an AI system but licenses it exclusively to EuroTech, an Italian company. EuroTech rebrands the AI system under its own trademark and sells it to EU customers. Is the EU AI Act applicable to DataCorp?",
        answer: "No, the AI Act is not applicable. Although DataCorp is a provider, the AI system is marketed under EuroTech's trademark, making EuroTech the provider under Article 3. Therefore, DataCorp does not place the system on the EU market directly."
    },
    {
        question: "What are the four types of AI definitions according to computer scientists?",
        answer: "Thinking humanly, Thinking rationally, Acting humanly, Acting rationally."
    },
    {
        question: "Which AI systems fall under the 'Limited Risk' category?",
        answer: "Chatbots and emotion recognition systems."
    },
    {
        question: "What AI risk category includes social scoring, facial recognition, and dark patterns?",
        answer: "Unacceptable Risk."
    },
    {
        question: "Does the EU AI Act cover AI systems used in purely personal, non-professional activities?",
        answer: "No, the Act does not apply to AI systems used exclusively for military, defense, or national security purposes, even if they are used within the Union."
    },
    {
        question: "What is a provider?",
        answer: "A 'provider' or creator is anybody who developed an AI system or uses an AI system under their own trademark."
    },
    {
        question: "Where can AI transparency issues come from?",
        answer: "1. Transparency in the data sets used. 2. Open-Source models, ensuring transparency in code. 3. Interpretable models (like decision trees), ensuring that users and stakeholders can understand how decisions are made."
    },
    {
        question: "What is the difference between 'Causal' and 'Counterfactual' explanations in AI?",
        answer: "Causal Explanation: Explains the factors that led to a decision. Counterfactual Explanation: Explores how the outcome could have changed with different conditions."
    },
    {
        question: "What is 'Vertical Discrimination' in the context of AI?",
        answer: "Vertical discrimination occurs when a public body (e.g., government) discriminates, and it is completely outlawed due to the power difference."
    },
    {
        question: "What is a false positive?",
        answer: "Results showing positive, even though it’s not."
    },
    {
        question: "Exploiting Vulnerabilities of Individuals or Groups is included in AI Act article 5? True/False",
        answer: "True."
    },
    {
        question: "What is the prohibition regarding social scoring AI systems?",
        answer: "AI systems that evaluate or classify individuals based on their social behavior or personality characteristics, leading to unfair or disproportionate treatment, are prohibited."
    },
    {
        question: "What AI systems are prohibited in biometric categorization?",
        answer: "AI systems that categorize individuals based on biometric data (e.g., race, political opinions, sexual orientation) are prohibited, except in law enforcement contexts."
    }
];

    let currentCard = 0;
    const toggleRecordingBtn = document.getElementById('toggleRecordingBtn');
    const recordingText = document.getElementById('recordingText');
    let mediaRecorder;
    let audioChunks = [];
    let transcribedText = '';
    let isRecording = false; // Declared the isRecording variable
    let userName = ''; // Variable to store user's name

    const quizContent = document.getElementById('quizContent');
    const questionEl = document.getElementById('question');
    const answerEl = document.getElementById('answer');
    const correctAnswerEl = document.getElementById('correctAnswer');
    const selfEvalEl = document.getElementById('selfEval');
    const gptEvalEl = document.getElementById('gptEval');
    const gptFeedbackEl = document.getElementById('gptFeedback');
    const gptAccuracyEl = document.getElementById('gptAccuracy');
    const gptCompletenessEl = document.getElementById('gptCompleteness');
    const gptClarityEl = document.getElementById('gptClarity');
    const navigationEl = document.getElementById('navigation');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const selfEvalButtons = document.querySelectorAll('.selfEvalBtn');
    const recordingIndicator = document.getElementById('recordingIndicator'); // Existing element
    const transcribingIndicator = document.getElementById('transcribingIndicator'); // New element
    const analyzingIndicator = document.getElementById('analyzingIndicator'); // New element

    const nameForm = document.getElementById('nameForm');
    const userNameInput = document.getElementById('userNameInput');
    const nameSection = document.getElementById('nameSection');
    const quizSection = document.getElementById('quizSection');

    // Event listener for Name Form Submission
    nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = userNameInput.value.trim();
        if (name === '') {
            alert('Please enter your name.');
            return;
        }
        userName = name;
        nameSection.style.display = 'none';
        quizSection.style.display = 'block';
        loadFlashcard(currentCard);
    });

    // Event listener for Start/Stop Recording
    toggleRecordingBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    function loadFlashcard(index) {
        const card = flashcards[index];
        questionEl.textContent = card.question;
        answerEl.style.display = 'none';
        selfEvalEl.style.display = 'none';
        gptEvalEl.style.display = 'none';
        navigationEl.style.display = 'none';
        // Reset previous data
        transcribedText = '';
        gptAccuracyEl.innerHTML = '';
        gptCompletenessEl.innerHTML = '';
        gptClarityEl.innerHTML = '';
        gptFeedbackEl.textContent = '';
        // Hide evaluation indicators
        analyzingIndicator.style.display = 'none';
        // Hide transcribing indicator in case it's visible
        transcribingIndicator.style.display = 'none';
        // Hide recording indicator to ensure it's not showing inadvertently
        recordingIndicator.style.display = 'none';
        // Reset Recording Button to default state
        resetRecordingButton();
    }

    // Handle navigation
    prevBtn.addEventListener('click', () => {
        if (currentCard > 0) {
            currentCard--;
            loadFlashcard(currentCard);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentCard < flashcards.length -1 ) {
            currentCard++;
            loadFlashcard(currentCard);
        }
    });

    // Start Recording
    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                isRecording = true;
                toggleRecordingBtn.classList.add('recording');
                toggleRecordingBtn.setAttribute('aria-label', 'Stop Recording');
                // Update button text
                recordingText.textContent = 'Stop Recording';
                audioChunks = [];

                // Show recording indicator
                recordingIndicator.style.display = 'flex';

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    // Hide recording indicator
                    recordingIndicator.style.display = 'none';
                    // Show transcribing indicator
                    transcribingIndicator.style.display = 'flex';
                    transcribeAudio(audioBlob);
                });
            })
            .catch(err => {
                alert('Microphone access denied or not available.');
                console.error(err);
            });
    }

    // Stop Recording
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            isRecording = false;
            toggleRecordingBtn.classList.remove('recording');
            toggleRecordingBtn.setAttribute('aria-label', 'Start Recording');
            // Update button text
            recordingText.textContent = 'Start Recording';
        }
    }

    // Reset Recording Button to default state
    function resetRecordingButton() {
        if (isRecording) {
            stopRecording();
        } else {
            toggleRecordingBtn.classList.remove('recording');
            toggleRecordingBtn.setAttribute('aria-label', 'Start Recording');
            recordingText.textContent = 'Start Recording';
        }
    }

    // Transcribe audio using Worker API
    async function transcribeAudio(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        formData.append('model', 'whisper-1');

        try {
            const response = await fetch('/api/transcribe', { // Updated endpoint
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            // Hide transcribing indicator
            transcribingIndicator.style.display = 'none';

            if (data.text) {
                transcribedText = data.text;
                displayAnswer();
            } else {
                alert('Transcription failed. Please try again.');
                console.error(data);
            }
        } catch (error) {
            // Hide transcribing indicator
            transcribingIndicator.style.display = 'none';
            alert('Error during transcription.');
            console.error(error);
        }
    }

    // Display Answer and Show Self-Evaluation
    function displayAnswer() {
        const correctAnswer = flashcards[currentCard].answer;
        correctAnswerEl.textContent = correctAnswer;
        answerEl.style.display = 'block';
        selfEvalEl.style.display = 'block';
    }

    // Handle Self-Evaluation with Buttons
    selfEvalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const rating = button.getAttribute('data-rating');
            if (!rating) {
                alert('Please select a rating.');
                return;
            }
            // Show analyzing indicator
            analyzingIndicator.style.display = 'flex';
            // Proceed to GPT-4 evaluation
            evaluateWithGPT4(rating);
        });
    });

    async function evaluateWithGPT4(rating) {
        const userAnswer = transcribedText;
        const correctAnswer = flashcards[currentCard].answer;
        const question = flashcards[currentCard].question;

        try {
            const response = await fetch('/api/evaluate', { // Updated endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    userAnswer,
                    correctAnswer,
                    rating, // Include user rating
                }),
            });

            const evaluation = await response.json();
            // Hide analyzing indicator
            analyzingIndicator.style.display = 'none';

            if (evaluation.error) {
                alert('Evaluation failed. Please try again.');
                console.error(evaluation.error);
                return;
            }

            displayGPTEvaluation(evaluation);
            // Save user data after evaluation
            saveUserData(question, userAnswer, evaluation);
        } catch (error) {
            // Hide analyzing indicator
            analyzingIndicator.style.display = 'none';
            alert('Error during GPT-4 evaluation.');
            console.error(error);
        }
    }

    function displayGPTEvaluation(evaluation) {
        // Function to convert rating string to stars
        function getStars(rating) {
            const ratingMap = {
                "Excellent": 4,
                "Good": 3,
                "Fair": 2,
                "Poor": 1
            };
            const starsCount = ratingMap[rating] || 0;
            let starsHTML = '';
            for (let i = 0; i < starsCount; i++) {
                starsHTML += '★';
            }
            for (let i = starsCount; i < 4; i++) {
                starsHTML += '☆';
            }
            return starsHTML;
        }

        // Display ratings
        gptAccuracyEl.innerHTML = getStars(evaluation.accuracy);
        gptCompletenessEl.innerHTML = getStars(evaluation.completeness);
        gptClarityEl.innerHTML = getStars(evaluation.clarity);

        // Display feedback
        gptFeedbackEl.textContent = evaluation.feedback;

        gptEvalEl.style.display = 'block';
        navigationEl.style.display = 'block';
    }

    // Function to save user data
    async function saveUserData(question, userAnswer, evaluation) {
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName, // User's name as unique identifier
                    question,
                    userAnswer,
                    evaluation, // { accuracy, completeness, clarity, feedback }
                }),
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Failed to save data:', data.error);
            }
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }
</script>

</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
        },
    });
}

async function handleTranscription(request) {
    try {
        // Parse the incoming form data
        const formData = await request.formData();
        const file = formData.get('file');
        const model = formData.get('model') || 'whisper-1';

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Prepare form data for OpenAI Whisper API
        const openaiFormData = new FormData();
        openaiFormData.append('file', file);
        openaiFormData.append('model', model);

        // Make a request to OpenAI Whisper API
        const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`, // Ensure OPENAI_API_KEY is set securely
            },
            body: openaiFormData,
        });

        const data = await openaiResponse.json();
        return new Response(JSON.stringify(data), {
            status: openaiResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Transcription error:', error);
        return new Response(JSON.stringify({ error: 'Transcription failed.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

async function handleEvaluation(request) {
    try {
        // Parse the incoming JSON data
        const { question, userAnswer, correctAnswer, rating } = await request.json();

        if (!question || !userAnswer || !correctAnswer || !rating) {
            return new Response(JSON.stringify({ error: 'Missing parameters.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Construct the prompt for GPT-4
        const prompt = `You are an educational assistant that evaluates user answers to flashcard questions. Provide your evaluation in the following JSON format adhering to the schema below:

{
  "accuracy": "Excellent | Good | Fair | Poor",
  "completeness": "Excellent | Good | Fair | Poor",
  "clarity": "Excellent | Good | Fair | Poor",
  "feedback": "Constructive feedback for the user."
}

Question: "${question}"
User Answer: "${userAnswer}"
Correct Answer: "${correctAnswer}"
User Rating: "${rating}"
`;

        // Make a request to OpenAI GPT-4 API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`, // Ensure OPENAI_API_KEY is set securely
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You evalaute the trancribed answers of the user, there can be variation in the answers and not all answers need to be exact the same, be nice and' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
            }),
        });

        const data = await openaiResponse.json();

        if (data.choices && data.choices.length > 0) {
            let gptResponse = data.choices[0].message.content.trim();

            // Extract JSON from the response
            const jsonStart = gptResponse.indexOf('{');
            const jsonEnd = gptResponse.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error('JSON block not found in GPT response.');
            }
            const jsonString = gptResponse.substring(jsonStart, jsonEnd + 1);
            const gptEvaluation = JSON.parse(jsonString);

            return new Response(JSON.stringify(gptEvaluation), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            throw new Error('Invalid GPT response.');
        }
    } catch (error) {
        console.error('Evaluation error:', error);
        return new Response(JSON.stringify({ error: 'Evaluation failed.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Updated function to handle saving data using userName as unique ID
async function handleSaveData(request) {
    try {
        const { userName, question, userAnswer, evaluation } = await request.json();

        if (!userName || !question || !userAnswer || !evaluation) {
            return new Response(JSON.stringify({ error: 'Missing parameters.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Define a unique key using userName
        const sanitizedUserName = sanitizeUserName(userName);
        const userKey = `user:${sanitizedUserName}`;

        // Retrieve existing data for the user
        let userData = await USER_DATA.get(userKey, { type: 'json' });
        if (!userData) {
            userData = { userName, sessions: [] };
        }

        // Append new entry
        userData.sessions.push({
            timestamp: Date.now(),
            question,
            userAnswer,
            evaluation,
        });

        // Store back to KV
        await USER_DATA.put(userKey, JSON.stringify(userData));

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error saving data:', error);
        return new Response(JSON.stringify({ error: 'Failed to save data.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Helper function to sanitize userName to prevent issues in KV keys
function sanitizeUserName(name) {
    // Remove any characters that are not alphanumeric or underscores
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
}
