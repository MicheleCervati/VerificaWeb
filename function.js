








// Add event listeners to all buttons
document.addEventListener("DOMContentLoaded", () => {
    // Open question buttons
    document.getElementById("open1").addEventListener("click", () => handleButtonClick(1, "domandaAperta.html"));
    document.getElementById("open2").addEventListener("click", () => handleButtonClick(2, "domandaAperta.html"));
    document.getElementById("open3").addEventListener("click", () => handleButtonClick(3, "domandaAperta.html"));

    // Crocetta buttons
    document.getElementById("crocetta1").addEventListener("click", () => handleButtonClick(4, "crocetta.html"));
    document.getElementById("crocetta2").addEventListener("click", () => handleButtonClick(5, "crocetta.html"));

    // Consegna button
    document.getElementById("consegna").addEventListener("click", handleConsegnaClick);
});

// Generic handler for button clicks
function handleButtonClick(value, url) {
    localStorage.setItem("questionID", value);
    console.log(`Value saved in localStorage: ${value}`);
    window.location.href = url;
}

// Handler for the "Consegna" button
function handleConsegnaClick() {
    let risposte = '';
    
    // Oggetto per memorizzare le risposte
    let domande = {};
    
    // Itera attraverso le risposte nel localStorage
    for (let key in localStorage) {
      // Verifica se la chiave corrisponde al formato delle risposte
      if (key.startsWith('answer')) {
        let risposta = localStorage.getItem(key);
        
        // Verifica se la risposta è una domanda con sottodomanda (crocetta)
        if (key.includes('_sub')) {
          // Estrai il numero della domanda e della sottodomanda
          let parts = key.split('_sub');
          let numeroDomanda = parts[0].replace('answer_', '');
          let numeroSottodomanda = parts[1];
          
          // Se la domanda non esiste nel nostro oggetto, inizializzala
          if (!domande[numeroDomanda]) {
            domande[numeroDomanda] = [];
          }
          
          // Aggiungi la risposta alla sottodomanda
          domande[numeroDomanda].push({ sub: numeroSottodomanda, risposta: risposta });
        } else {
          // Risposta aperta (domanda senza sottodomanda)
          let numeroDomanda = key.replace('answer_', '');
          
          // Aggiungi la risposta alla domanda
          domande[numeroDomanda] = [{ sub: null, risposta: risposta }];
        }
      }
    }
    
    // Ordina le domande
    let sortedDomande = Object.keys(domande).sort((a, b) => a - b);
    
    // Costruisci il contenuto del file ordinato
    sortedDomande.forEach(numeroDomanda => {
      let question = domande[numeroDomanda];
      
      // Se la domanda ha sottodomande
      if (question[0].sub !== null) {
        question.sort((a, b) => a.sub - b.sub); // Ordina le sottodomande
        
        question.forEach(sub => {
          risposte += `risposta alla domanda ${numeroDomanda}.${sub.sub} (crocetta): ${sub.risposta}\n`;
        });
      } else {
        // Risposta senza sottodomande
        risposte += `risposta alla domanda ${numeroDomanda}: ${question[0].risposta}\n`;
      }
    });
    
    // Recupera il valore di remainingTime dal localStorage (in secondi)
    let remainingTime = parseInt(localStorage.getItem('remainingTime'), 10);
    
    // Calcola il tempo impiegato (1 ora = 3600 secondi)
    let tempoTotale = 3600; // 1 ora in secondi
    let tempoImpiegato = tempoTotale - remainingTime;
    
    // Converte il tempo impiegato in minuti e secondi
    let minuti = Math.floor(tempoImpiegato / 60);
    let secondi = tempoImpiegato % 60;
    
    // Aggiungi il tempo impiegato alla fine del file
    risposte += `\nTempo impiegato: ${minuti} minuti e ${secondi} secondi\n`;
    
    // Crea un Blob con le risposte in formato testo
    const blob = new Blob([risposte], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "risposte.txt"; // Nome del file da scaricare
    
    // Clicca automaticamente sul link per avviare il download
    link.click();
  }
  





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
        document.title = question.testo; // Set the page title
        const questionNumberElement = document.getElementById("question-number");
        const questionTitleElement = document.getElementById("question-title");

        questionNumberElement.textContent = `Domanda numero ${questionID}`;
        questionTitleElement.textContent = question.testo;

        // Check if there is an answer saved in localStorage for this questionID
        const savedAnswer = localStorage.getItem(`answer_${questionID}`);
        if (savedAnswer) {
            document.getElementById("answer-box").value = savedAnswer;

            // Update the character counter with the saved answer's length
            updateCharacterCounter(savedAnswer.length);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });

// Update the character counter
const answerBox = document.getElementById("answer-box");
const charCounter = document.getElementById("char-counter");

answerBox.addEventListener("input", () => {
    const charCount = answerBox.value.length;
    updateCharacterCounter(charCount);
});

// Function to update the character counter text
function updateCharacterCounter(charCount) {
    charCounter.textContent = `Caratteri scritti: ${charCount}`;
}

// Redirect to the homepage and save the answer to localStorage
const homeButton = document.getElementById("home-button");

homeButton.addEventListener("click", () => {
    const questionID = localStorage.getItem("questionID");
    if (questionID) {
        const answer = answerBox.value;
        localStorage.setItem(`answer_${questionID}`, answer);  // Save the answer
    }
    window.location.href = "index.html";  // Redirect to the homepage
});









