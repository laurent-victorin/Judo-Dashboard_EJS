const socket = io(); // Assurez-vous d'avoir connecté Socket.IO

// Variables pour gérer le chronomètre
let timer;
let isTimerRunning = false;
let timeRemaining;
let selectedTime = 180; // Durée par défaut de 3 minutes

// Éléments du DOM
const timerDisplay = document.querySelector(".time");
const hajimeButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const timeSelect = document.getElementById("time-select");
const setTimeButton = document.getElementById("set-time");

// Ajouter des écouteurs d'événements pour les boutons d'immobilisation
document
  .getElementById("white-osae-komi")
  .addEventListener("click", function () {
    startImmobilization("white");
  });
document.getElementById("white-toketa").addEventListener("click", function () {
  stopImmobilization("white");
});
document
  .getElementById("white-reset-osae-komi")
  .addEventListener("click", function () {
    resetImmobilization("white");
  });

document.getElementById("red-osae-komi").addEventListener("click", function () {
  startImmobilization("red");
});
document.getElementById("red-toketa").addEventListener("click", function () {
  stopImmobilization("red");
});
document
  .getElementById("red-reset-osae-komi")
  .addEventListener("click", function () {
    resetImmobilization("red");
  });

// Ajout des écouteurs d'événements
hajimeButton.addEventListener("click", startTimer);
resetButton.addEventListener("click", resetTimer);
setTimeButton.addEventListener("click", setTime);

// Initialise le chronomètre avec la durée par défaut au chargement
document.addEventListener("DOMContentLoaded", resetTimer);

// Initialisez l'affichage des Shido au chargement pour chaque joueur
document.addEventListener("DOMContentLoaded", function () {
  updateShidoDisplay("white");
  updateShidoDisplay("red");
});

/*- NOM ANIMATION et LOGO -------------------------------------------*/
function updateAnimationInfo() {
  const animationName = document.getElementById("animation-name").value;
  const logoUrl = document.getElementById("logo-url").value;

  // Emitting the event with animation name and logo URL to the server
  socket.emit("update animation", { animationName, logoUrl });
}

/*-MODIFY SCORE----------------------------------------------------------------------*/
function modifyScore(player, pointType, amount) {
  const scoreSpan = document.getElementById(`${player}-${pointType}`);
  let currentScore = parseInt(scoreSpan.textContent);
  currentScore += amount;
  if (currentScore < 0) currentScore = 0; // Prevent negative scores
  scoreSpan.textContent = currentScore;
  // Envoyer le score mis à jour au serveur
  socket.emit("score update", { player, pointType, score: currentScore });
}

// Mise à jour de l'affichage du chronomètre
function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Démarrage du chronomètre
function startTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    hajimeButton.textContent = "Matte"; // Change le texte du bouton en "Matte"
    timer = setInterval(function () {
      timeRemaining--;
      updateTimerDisplay();
      socket.emit("timer update", { timeRemaining, selectedTime }); // Envoie le temps restant à tous les clients

      if (timeRemaining <= 0) {
        clearInterval(timer);
        isTimerRunning = false;
        hajimeButton.textContent = "Hajime"; // Remet le texte du bouton en "Hajime"
        timerDisplay.textContent = "0:00";
      }
    }, 1000);
  } else {
    pauseTimer();
  }
}

// Pause du chronomètre
function pauseTimer() {
  clearInterval(timer);
  isTimerRunning = false;
  hajimeButton.textContent = "Hajime"; // Remet le texte du bouton en "Hajime"
}

// Réinitialisation du chronomètre
function resetTimer() {
  clearInterval(timer);
  isTimerRunning = false;
  timeRemaining = selectedTime;
  updateTimerDisplay();
  hajimeButton.textContent = "Hajime"; // Remet le texte du bouton en "Hajime"
  socket.emit("timer update", { timeRemaining, selectedTime }); // Envoie le temps réinitialisé
}

// Mise à jour de la durée du combat
function setTime() {
  if (!isTimerRunning) {
    selectedTime = parseInt(timeSelect.value);
    resetTimer();
  } else {
    alert(
      "Vous ne pouvez pas changer la durée pendant que le chronomètre est en marche."
    );
  }
}

// SHIDO //
// Ajoutez ces variables globales pour suivre le nombre de Shido pour chaque joueur
let shidoCount = {
  white: 0,
  red: 0,
};

function modifyShido(playerColor, change) {
  shidoCount[playerColor] += change;

  // Assurez-vous que le nombre de Shido ne dépasse pas 3 et n'est pas négatif
  if (shidoCount[playerColor] > 3) {
    shidoCount[playerColor] = 3;
  } else if (shidoCount[playerColor] < 0) {
    shidoCount[playerColor] = 0;
  }

  updateShidoDisplay(playerColor);
  // Émettre un événement avec l'état actuel des Shido
  socket.emit("shido update", {
    player: playerColor,
    shido: shidoCount[playerColor],
  });
}

function updateShidoDisplay(playerColor) {
  const shidoIconsContainer = document.getElementById(
    `${playerColor}-shido-icons`
  );
  shidoIconsContainer.innerHTML = ""; // Effacer les icônes précédentes

  // Ajouter le nombre correct d'icônes de Shido
  for (let i = 0; i < shidoCount[playerColor]; i++) {
    const shidoIcon = document.createElement("div");
    shidoIcon.className = "shido-icon";
    shidoIcon.textContent = "S";
    shidoIconsContainer.appendChild(shidoIcon);
  }
}

// Immobilistations
// Ajoutez ces variables globales pour chaque joueur
let immobilizationTimers = {
  white: { time: 0, running: false },
  red: { time: 0, running: false },
};

// Function to start immobilization
function startImmobilization(playerColor) {
  if (!immobilizationTimers[playerColor].running) {
    immobilizationTimers[playerColor].running = true;

    // Don't reset time to 0 here. Remove or comment out the following line:
    // immobilizationTimers[playerColor].time = 0;

    immobilizationTimers[playerColor].interval = setInterval(() => {
      if (immobilizationTimers[playerColor].time < 20) {
        immobilizationTimers[playerColor].time++;
        updateImmobilizationDisplay(
          playerColor,
          immobilizationTimers[playerColor].time
        );
        socket.emit("update osaekomi", {
          player: playerColor,
          time: immobilizationTimers[playerColor].time,
        });
      } else {
        stopImmobilization(playerColor); // Stop when it reaches 20 seconds
      }
    }, 1000); // Updates every second
  }
}

// Function to stop immobilization
function stopImmobilization(playerColor) {
  if (immobilizationTimers[playerColor].running) {
    clearInterval(immobilizationTimers[playerColor].interval);
    immobilizationTimers[playerColor].running = false;
    socket.emit("stop osaekomi", { player: playerColor });
  }
}

// Function to reset immobilization
function resetImmobilization(playerColor) {
  stopImmobilization(playerColor); // Stop if running
  immobilizationTimers[playerColor].time = 0; // Reset time
  updateImmobilizationDisplay(playerColor, 0); // Update UI to 0s
  socket.emit("reset osaekomi", { player: playerColor });
}

// Update the immobilization display
function updateImmobilizationDisplay(playerColor, time) {
  const timerElement = document.getElementById(`osaekomi-${playerColor}-timer`);
  const progressBar = document.getElementById(
    `osaekomi-${playerColor}-progress`
  );
  if (timerElement && progressBar) {
    timerElement.textContent = `${time}s`;

    // Calculate and update the progress bar
    const percentage = (time / 20) * 100; // Assuming 20s is the maximum
    progressBar.style.width = `${percentage}%`;

    // Update color based on the time
    if (time < 10) {
      timerElement.style.backgroundColor = "white";
      timerElement.style.color = "black";
    } else if (time < 20) {
      timerElement.style.backgroundColor = "yellow";
      timerElement.style.color = "black";
    } else {
      timerElement.style.backgroundColor = "green";
      timerElement.style.color = "white";
    }
  }
  // Emit an event with the current time for the specific player
  socket.emit("update osaekomi", {
    player: playerColor,
    time: immobilizationTimers[playerColor].time,
  });
}

// Nouveau Combat //
// Fonction pour réinitialiser tous les chronomètres et scores
function resetAll() {
  // Réinitialiser les champs d'entrée pour les noms et les clubs
  document.getElementById("white-name").value = "Judoka Blanc";
  document.getElementById("red-name").value = "Judoka Rouge";
  document.getElementById("white-club").value = "Club";
  document.getElementById("red-club").value = "Club";

  // Réinitialiser les scores, Shido, et immobilisations pour chaque joueur
  ["white", "red"].forEach((playerColor) => {
    resetScores(playerColor);
    shidoCount[playerColor] = 0;
    updateShidoDisplay(playerColor);
    resetImmobilization(playerColor);
  });

  // Réinitialiser le chronomètre principal
  resetTimer();

  // Function to reset scores of each player
  function resetScores(playerColor) {
    const scoreTypes = ["ippon", "wazari", "kinza"]; // Add other score types if any
    scoreTypes.forEach((type) => {
      const scoreElement = document.getElementById(`${playerColor}-${type}`);
      if (scoreElement) scoreElement.textContent = "0";
    });
  }

  // Assurez-vous que cette fonction est appelée lorsque le bouton est cliqué
  document.getElementById("new-match").addEventListener("click", resetAll);

  // Remettre la durée par défaut (3 minutes par exemple)
  // selectedTime = 180;
  selectedTime = timeSelect.value;
  timeSelect.value = selectedTime.toString();
  updateTimerDisplay();

  // Emit an event to the server to reset display as well
  socket.emit("reset display");

  socket.emit("reset all");
}

// Supposons que vous ayez une fonction de réinitialisation des scores comme celle-ci
function resetScores(playerColor) {
  // Remettre les scores à 0 ou à la valeur initiale
  // et mettre à jour l'affichage si nécessaire
}

// Ajouter un écouteur d'événements pour le bouton "Nouveau Combat"
document.getElementById("new-match").addEventListener("click", resetAll);

// Assurez-vous d'avoir un bouton avec l'id 'new-match' dans votre fichier EJS

// public/js/control.js

// Supposons que vous envoyez les données lorsqu'un bouton est cliqué ou après un événement 'change'
document.getElementById("white-name").addEventListener("blur", function () {
  socket.emit("update names", {
    white: this.value,
    red: document.getElementById("red-name").value,
  });
});

document.getElementById("red-name").addEventListener("blur", function () {
  socket.emit("update names", {
    red: this.value,
    white: document.getElementById("white-name").value,
  });
});

// Exemple de gestion de l'entrée du club pour le judoka blanc
document.getElementById("white-club").addEventListener("blur", function () {
  socket.emit("update clubs", {
    white: this.value,
    red: document.getElementById("red-club").value, // Assurez-vous que c'est la valeur actuelle
  });
});

// Faites de même pour le club du judoka rouge
document.getElementById("red-club").addEventListener("blur", function () {
  socket.emit("update clubs", {
    white: document.getElementById("white-club").value, // Assurez-vous que c'est la valeur actuelle
    red: this.value,
  });
});

// Répétez pour le combattant rouge ou tout autre élément que vous souhaitez synchroniser

// script.js

// Désigner le vainqueur
function designateWinner() {
  // Calculate points
  const whitePoints = calculatePoints("white");
  const redPoints = calculatePoints("red");

  // Determine the winner based on points or other criteria
  let winner;
  if (whitePoints.total > redPoints.total) {
    winner = "Judoka Blanc";
    displayWinner(winner, "black", "white");
  } else if (redPoints.total > whitePoints.total) {
    winner = "Judoka Rouge";
    displayWinner(winner, "red", "white");
  } else {
    // Further tie-breaking logic based on Kinza and Shido
    winner = tieBreaker(whitePoints, redPoints);
    displayWinner(
      winner,
      winner === "Match Nul"
        ? "gray"
        : winner === "Judoka Blanc"
        ? "white"
        : "red",
      winner === "Match Nul"
        ? "white"
        : winner === "Judoka Blanc"
        ? "white"
        : "white"
    );
  }
}

function calculatePoints(playerColor) {
  // Fetch scores from UI or a maintained state
  const ippon = parseInt(
    document.getElementById(`${playerColor}-ippon`).textContent
  );
  const wazari = parseInt(
    document.getElementById(`${playerColor}-wazari`).textContent
  );
  const kinza = parseInt(
    document.getElementById(`${playerColor}-kinza`).textContent
  );
  const shido = shidoCount[playerColor]; // Assuming shidoCount is up to date

  // Calculate total points based on rules
  const total = ippon * 10 + wazari * 7 + kinza * 0; // kinza doesn't contribute to points

  return { total, ippon, wazari, kinza, shido };
}

function tieBreaker(whitePoints, redPoints) {
  // Further tie-breaking logic based on Kinza and Shido
  if (whitePoints.kinza > redPoints.kinza) {
    return "Judoka Blanc";
  } else if (redPoints.kinza > whitePoints.kinza) {
    return "Judoka Rouge";
  } else {
    // Further tie-break based on Shido (less is better)
    if (whitePoints.shido < redPoints.shido) {
      return "Judoka Blanc";
    } else if (redPoints.shido < whitePoints.shido) {
      return "Judoka Rouge";
    } else {
      return "Match Nul"; // Complete tie
    }
  }
}

function displayWinner(winner, bgColor, textColor) {
  // Update UI to display the winner
  const winnerDisplay = document.getElementById("winner-display");
  const winnerColor = document.getElementById("winner-color");

  winnerDisplay.style.display = "block"; // Make the winner display visible
  winnerDisplay.style.backgroundColor = bgColor;
  winnerColor.style.color = textColor;
  winnerColor.textContent = winner; // Update text to show the winner
}

// Event listener for the Designate Winner button
document
  .getElementById("designate-winner")
  .addEventListener("click", designateWinner);
