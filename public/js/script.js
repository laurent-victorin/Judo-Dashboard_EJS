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

/*- UPDATE ANIMATION -------------------------------------------*/
const updateAnimation = document.getElementById("updateAnimation");
updateAnimation.addEventListener("click", updateAnimationInfo);
function updateAnimationInfo() {
  const animationName = document.getElementById("animation-name").value;

  // Emitting the event with animation name and logo URL to the server
  socket.emit("update animation", { animationName });
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
function updateChronoContainerColor() {
  const chronoContainer = document.querySelector(".chrono-container");
  if (isTimerRunning) {
    // Vert si le chrono est en marche
    chronoContainer.style.backgroundColor = "rgb(95, 175, 66)";
  } else {
    // RGB(194,145,255) si le chrono est en pause ou pas encore démarré
    chronoContainer.style.backgroundColor = "rgb(194,145,255)";
  }
}

function startTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    hajimeButton.textContent = "⏸️ Matte"; // Change le texte du bouton en "Matte"
    timer = setInterval(function () {
      timeRemaining--;
      updateTimerDisplay();
      updateChronoContainerColor();
      socket.emit("timer update", { timeRemaining, selectedTime }); // Envoie le temps restant à tous les clients

      if (timeRemaining <= 0) {
        clearInterval(timer);
        isTimerRunning = false;
        hajimeButton.textContent = "⏯️ Hajime"; // Remet le texte du bouton en "Hajime"
        timerDisplay.textContent = "0:00";
        playGongSound();
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
  hajimeButton.textContent = "⏯️ Hajime"; // Remet le texte du bouton en "Hajime"
  updateChronoContainerColor();
}

// Réinitialisation du chronomètre
function resetTimer() {
  clearInterval(timer);
  isTimerRunning = false;
  timeRemaining = selectedTime;
  updateTimerDisplay();
  hajimeButton.textContent = "⏯️ Hajime"; // Remet le texte du bouton en "Hajime"
  updateChronoContainerColor();
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
        playGongSound();
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
  // Transférer les informations des prochains combattants aux champs actuels
  const nextWhiteName = document.getElementById("next-white-name").value;
  const nextWhiteClub = document.getElementById("next-white-club").value;
  const nextRedName = document.getElementById("next-red-name").value;
  const nextRedClub = document.getElementById("next-red-club").value;
  // Mettre à jour les inputs actuels
  document.getElementById("white-name").value = nextWhiteName;
  document.getElementById("white-club").value = nextWhiteClub;
  document.getElementById("red-name").value = nextRedName;
  document.getElementById("red-club").value = nextRedClub;

  // Envoyer les informations mises à jour au serveur
  socket.emit("update names", {
    white: nextWhiteName,
    red: nextRedName,
    whiteClub: nextWhiteClub,
    redClub: nextRedClub,
  });

  // Envoyer également les informations des prochains combattants pour mise à jour du display
  socket.emit("update upcoming fighters", {
    nextWhiteName,
    nextWhiteClub,
    nextRedName,
    nextRedClub,
  });

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
  const whitePoints = calculatePoints("white");
  const redPoints = calculatePoints("red");

  // Initial comparison based on total points
  if (whitePoints.total > redPoints.total) {
    displayWinner("Judoka Blanc", whitePoints.total, redPoints.total);
  } else if (redPoints.total > whitePoints.total) {
    displayWinner("Judoka Rouge", whitePoints.total, redPoints.total);
  } else {
    // In case of a tie in total points, use further criteria
    const winner = tieBreaker(whitePoints, redPoints);
    displayWinner(winner, whitePoints.total, redPoints.total);
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
  // First, check Kinza
  if (whitePoints.kinza > redPoints.kinza) {
    return "Judoka Blanc";
  } else if (redPoints.kinza > whitePoints.kinza) {
    return "Judoka Rouge";
  } else {
    // In case of a tie in Kinza, check Shidos (less is better)
    if (whitePoints.shido < redPoints.shido) {
      return "Judoka Blanc";
    } else if (redPoints.shido < whitePoints.shido) {
      return "Judoka Rouge";
    } else {
      // Complete tie
      return "Match Nul";
    }
  }
}

// script.js

// Mettez à jour selon la nouvelle structure de displayWinner
function displayWinner(winner, whiteScore, redScore) {
  // Update UI to display the winner
  const winnerDisplay = document.getElementById("winner-display");
  winnerDisplay.style.display = "block"; // Make the winner display visible

  let displayText = `${winner}: Blanc (${whiteScore}) contre Rouge (${redScore})`;
  // Adjust colors and text based on the winner or tie
  if (winner === "Match Nul") {
    winnerDisplay.style.backgroundColor = "gray";
    winnerDisplay.style.color = "white";
    displayText = `Match Nul: Blanc (${whiteScore}) contre Rouge (${redScore})`;
  } else {
    winnerDisplay.style.backgroundColor =
      winner === "Judoka Blanc" ? "white" : "red";
    winnerDisplay.style.color = winner === "Judoka Blanc" ? "black" : "white";
  }

  winnerDisplay.textContent = displayText; // Update text to show the winner or tie
  // Envoyer les données du gagnant pour afficher dans la modale sur display.ejs
  socket.emit("winner data", { winner, whiteScore, redScore });
}

// Event listener for the Designate Winner button
document
  .getElementById("designate-winner")
  .addEventListener("click", designateWinner);

// Jouer un son à la fin des timers
function playGongSound() {
  const audio = new Audio("/mp3/gong.mp3");
  audio.play();
}

// Lorsque "Nouveau Combat" est cliqué, mettez à jour les noms actuels avec les prochains combattants
document.getElementById("new-match").addEventListener("click", function () {
  // Transférer les informations des prochains combattants aux champs actuels
  const nextWhiteName = document.getElementById("next-white-name").value;
  const nextWhiteClub = document.getElementById("next-white-club").value;
  const nextRedName = document.getElementById("next-red-name").value;
  const nextRedClub = document.getElementById("next-red-club").value;

  // Mettre à jour les inputs actuels
  document.getElementById("white-name").value = nextWhiteName;
  document.getElementById("white-club").value = nextWhiteClub;
  document.getElementById("red-name").value = nextRedName;
  document.getElementById("red-club").value = nextRedClub;

  // Envoyer les informations mises à jour au serveur
  socket.emit("update names", {
    white: nextWhiteName,
    red: nextRedName,
    whiteClub: nextWhiteClub,
    redClub: nextRedClub,
  });

  // Réinitialiser les champs des prochains combattants
  document.getElementById("next-white-name").value = "";
  document.getElementById("next-white-club").value = "";
  document.getElementById("next-red-name").value = "";
  document.getElementById("next-red-club").value = "";

  // Réinitialiser également les informations du display pour les prochains combattants
  socket.emit("reset upcoming fighters");

  // Supposons que vous envoyez les données lorsqu'un bouton est cliqué ou après un événement 'change'
  document
    .getElementById("next-white-name")
    .addEventListener("change", function () {
      socket.emit("update next names", {
        white: this.value,
        red: document.getElementById("next-red-name").value,
      });
    });

  document
    .getElementById("next-red-name")
    .addEventListener("change", function () {
      socket.emit("update next names", {
        red: this.value,
        white: document.getElementById("next-white-name").value,
      });
    });

  // Exemple de gestion de l'entrée du club pour le judoka blanc
  document
    .getElementById("next-white-club")
    .addEventListener("change", function () {
      socket.emit("update next clubs", {
        white: this.value,
        red: document.getElementById("next-red-club").value, // Assurez-vous que c'est la valeur actuelle
      });
    });

  // Faites de même pour le club du judoka rouge
  document
    .getElementById("next-red-club")
    .addEventListener("change", function () {
      socket.emit("update next clubs", {
        white: document.getElementById("next-white-club").value, // Assurez-vous que c'est la valeur actuelle
        red: this.value,
      });
    });
});

document
  .getElementById("validate-next-fight")
  .addEventListener("click", function () {
    const nextWhiteName = document.getElementById("next-white-name").value;
    const nextWhiteClub = document.getElementById("next-white-club").value;
    const nextRedName = document.getElementById("next-red-name").value;
    const nextRedClub = document.getElementById("next-red-club").value;

    // Envoyer les informations des prochains combattants pour mise à jour du display
    socket.emit("update upcoming fighters", {
      nextWhiteName,
      nextWhiteClub,
      nextRedName,
      nextRedClub,
    });
  });
