const socket = io(); // Assurez-vous d'avoir connecté Socket.IO

function modifyScore(player, pointType, amount) {
  const scoreSpan = document.getElementById(`${player}-${pointType}`);
  let currentScore = parseInt(scoreSpan.textContent);
  currentScore += amount;
  if (currentScore < 0) currentScore = 0; // Prevent negative scores
  scoreSpan.textContent = currentScore;
  // Envoyer le score mis à jour au serveur
  socket.emit("score update", { player, pointType, score: currentScore });
}

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

// Ajout des écouteurs d'événements
hajimeButton.addEventListener("click", startTimer);
resetButton.addEventListener("click", resetTimer);
setTimeButton.addEventListener("click", setTime);

// Initialise le chronomètre avec la durée par défaut au chargement
document.addEventListener("DOMContentLoaded", resetTimer);

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

// Initialisez l'affichage des Shido au chargement pour chaque joueur
document.addEventListener("DOMContentLoaded", function () {
  updateShidoDisplay("white");
  updateShidoDisplay("red");
});

// Immobilistations
// Ajoutez ces variables globales pour chaque joueur
let immobilizationTimers = {
  white: { timer: null, time: 0, running: false },
  red: { timer: null, time: 0, running: false },
};

function startImmobilization(playerColor) {
  if (!immobilizationTimers[playerColor].running) {
    immobilizationTimers[playerColor].running = true;
    const osaeKomiBtn = document.getElementById(`${playerColor}-osae-komi`);
    const toketaBtn = document.getElementById(`${playerColor}-toketa`);
    const timeDisplay = document.getElementById(
      `${playerColor}-osae-komi-time`
    );

    osaeKomiBtn.style.display = "none";
    toketaBtn.style.display = "inline";

    immobilizationTimers[playerColor].timer = setInterval(function () {
      immobilizationTimers[playerColor].time++;
      timeDisplay.textContent = immobilizationTimers[playerColor].time + "s";

      // Change background color at 10 seconds
      if (immobilizationTimers[playerColor].time === 10) {
        timeDisplay.style.backgroundColor = "yellow";
      }
      // Change background color at 20 seconds
      else if (immobilizationTimers[playerColor].time === 20) {
        timeDisplay.style.backgroundColor = "green";
        stopImmobilization(playerColor); // Stop timer at 20 seconds
      }
    }, 1000);
  }
}

function stopImmobilization(playerColor) {
  clearInterval(immobilizationTimers[playerColor].timer);
  immobilizationTimers[playerColor].running = false;
  immobilizationTimers[playerColor].timer = null;

  const osaeKomiBtn = document.getElementById(`${playerColor}-osae-komi`);
  const toketaBtn = document.getElementById(`${playerColor}-toketa`);
  const timeDisplay = document.getElementById(`${playerColor}-osae-komi-time`);

  osaeKomiBtn.style.display = "inline";
  toketaBtn.style.display = "none";
  timeDisplay.style.backgroundColor = ""; // Reset background color
}

function resetImmobilization(playerColor) {
  stopImmobilization(playerColor);
  immobilizationTimers[playerColor].time = 0;
  const timeDisplay = document.getElementById(`${playerColor}-osae-komi-time`);
  timeDisplay.textContent = "0s";
  timeDisplay.style.backgroundColor = ""; // Reset background color
}

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

// Nouveau Combat //
// Fonction pour réinitialiser tous les chronomètres et scores
function resetAll() {
  // Réinitialiser les champs d'entrée pour les noms et les clubs
  document.getElementById("white-name").value = "";
  document.getElementById("red-name").value = "";
  document.getElementById("white-club").value = "";
  document.getElementById("red-club").value = "";
  // Emit an event to the server to reset display as well
  socket.emit("reset display");
  // Assurez-vous que cette fonction est appelée lorsque le bouton est cliqué
  document.getElementById("new-match").addEventListener("click", resetAll);

  // Réinitialiser les scores pour chaque joueur
  ["white", "red"].forEach((playerColor) => {
    // Réinitialiser les scores (Ippon, Waza-ari, etc.)
    resetScores(playerColor);
    // Réinitialiser les Shido
    shidoCount[playerColor] = 0;
    updateShidoDisplay(playerColor);
    // Réinitialiser l'immobilisation
    resetImmobilization(playerColor);
  });

  // Réinitialiser le chronomètre principal
  resetTimer();
  // Remettre la durée par défaut (3 minutes par exemple)
  selectedTime = 180;
  timeSelect.value = selectedTime.toString();
  updateTimerDisplay();
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
