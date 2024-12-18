document.addEventListener("DOMContentLoaded", () => {
    // Recupera il tempo rimanente dal localStorage, se esiste, altrimenti imposta 3600 (1 ora)
    let remainingTime = localStorage.getItem("remainingTime") ? parseInt(localStorage.getItem("remainingTime")) : 3600;

    // Aggiorna il timer ogni secondo
    const timerInterval = setInterval(() => {
        const timerElement = document.getElementById("timer");

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "Tempo scaduto!";
        } else {
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;

            // Format the time as HH:MM:SS
            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            timerElement.textContent = formattedTime;
            remainingTime--;

            // Salva il tempo rimanente aggiornato nel localStorage ogni secondo
            localStorage.setItem("remainingTime", remainingTime);
        }
    }, 1000);
});

// Generic handler for button clicks
function handleButtonClick(value, url) {
    // Recupera il tempo rimanente dal localStorage, se esiste
    let remainingTime = localStorage.getItem("remainingTime") ? parseInt(localStorage.getItem("remainingTime")) : 3600;

    // Salva il tempo rimanente e la domanda corrente
    localStorage.setItem("questionID", value);
    localStorage.setItem("remainingTime", remainingTime);
    
    console.log(`Value saved in localStorage: ${value}`);
    window.location.href = url;
}












document.addEventListener("DOMContentLoaded", () => {
    // Load the question data from the JSON file
    fetch("domande.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load the JSON file");
            }
            return response.json();
        })
        .then((data) => {
            // Get the QuestionID from localStorage
            const questionID = localStorage.getItem("questionID");

            if (!questionID) {
                console.error("No QuestionID found in localStorage");
                return;
            }

            // Find the corresponding question in the JSON data
            const question = data.test.find((q) => q.QuestionID == questionID);

            if (!question) {
                console.error(`No question found with ID ${questionID}`);
                return;
            }

            // Update the page with the question details
            document.title = `Domanda ${questionID}`; // Set the page title
            const questionNumberElement = document.getElementById("question-number");
            const questionTitleElement = document.getElementById("question-title");
            const questionDescriptionElement = document.getElementById("question-description");

            // Set the content dynamically
            questionNumberElement.textContent = `Domanda numero ${questionID}`;
            questionTitleElement.textContent = question.titolo_domanda;
            questionDescriptionElement.textContent = question.paragrafo_domanda || ""; // If there's a description

            // Handle multiple-choice questions with subquestions
            if (question.tipo === "crocetta") {
                const questionsContainer = document.getElementById("questions-container");

                question.sottodomande.forEach((subquestion, subIndex) => {
                    const subQuestionText = subquestion[`testo_${subIndex + 1}`];
                    const possibleAnswers = subquestion[`risposte_possibili_${subIndex + 1}`];

                    // Create a container for the subquestion
                    const subQuestionWrapper = document.createElement("div");
                    subQuestionWrapper.classList.add("subquestion-wrapper");

                    // Add the subquestion text
                    const subQuestionTextElement = document.createElement("h2");
                    subQuestionTextElement.textContent = subQuestionText;
                    subQuestionWrapper.appendChild(subQuestionTextElement);

                    // Create the options container for the subquestion
                    const optionsContainer = document.createElement("div");
                    optionsContainer.classList.add("options-container");

                    // Generate the options as radio buttons
                    possibleAnswers.forEach((option, index) => {
                        const optionWrapper = document.createElement("div");
                        optionWrapper.classList.add("option-wrapper");

                        const radioInput = document.createElement("input");
                        radioInput.type = "radio";
                        radioInput.name = `subquestion-${subIndex}`;
                        radioInput.id = `subquestion-${subIndex}-option-${index}`;
                        radioInput.value = option;

                        const label = document.createElement("label");
                        label.htmlFor = `subquestion-${subIndex}-option-${index}`;
                        label.textContent = option;

                        optionWrapper.appendChild(radioInput);
                        optionWrapper.appendChild(label);
                        optionsContainer.appendChild(optionWrapper);
                    });

                    subQuestionWrapper.appendChild(optionsContainer);
                    questionsContainer.appendChild(subQuestionWrapper);

                    // Retrieve and activate the saved answer from localStorage for this subquestion
                    const savedAnswer = localStorage.getItem(`answer_${questionID}_sub${subIndex}`);
                    if (savedAnswer) {
                        const savedOption = document.querySelector(
                            `input[name="subquestion-${subIndex}"][value="${savedAnswer}"]`
                        );
                        if (savedOption) {
                            savedOption.checked = true;
                        }
                    }
                });
            } else {
                console.warn("The question type is not 'crocetta', no options displayed.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });

    // Redirect to the homepage and save the answers to localStorage
    const homeButton = document.getElementById("home-button");

    homeButton.addEventListener("click", () => {
        const questionID = localStorage.getItem("questionID");
        if (questionID) {
            // Save all selected answers for subquestions
            const subquestions = document.querySelectorAll(".subquestion-wrapper");
            subquestions.forEach((subQuestionWrapper, subIndex) => {
                const selectedOption = subQuestionWrapper.querySelector(
                    `input[name="subquestion-${subIndex}"]:checked`
                );
                if (selectedOption) {
                    localStorage.setItem(
                        `answer_${questionID}_sub${subIndex}`,
                        selectedOption.value
                    );
                }
            });
        }
        window.location.href = "index.html"; // Redirect to the homepage
    });
});
