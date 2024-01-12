// display.js
document.addEventListener("DOMContentLoaded", function () {
  const socket = io(); // Connectez-vous au serveur WebSocket

  // Rejoindre la room de la table spécifique
  socket.emit("joinTable", "table01"); // Remplacer par l'ID de table dynamique

  /*-----------------------------------------------------------------------------------------------------*/
  // Écouter les événements pour les noms des judokas
  socket.on("update names", function (data) {
    document.getElementById("white-name-display").textContent = data.white;
    document.getElementById("red-name-display").textContent = data.red;
  });

  /*-----------------------------------------------------------------------------------------------------*/
  socket.on("update clubs", function (data) {
    // Mettre à jour les informations du club sur l'affichage
    document.getElementById("white-club-display").textContent = data.white;
    document.getElementById("red-club-display").textContent = data.red;
  });

  /*-----------------------------------------------------------------------------------------------------*/
  // Réinitialiser l'affichage des prochains combattants
  socket.on("reset upcoming fighters", function () {
    document.getElementById("upcoming-red").textContent = "";
    document.getElementById("upcoming-red-club").textContent = "";
    document.getElementById("upcoming-white").textContent = "";
    document.getElementById("upcoming-white-club").textContent = "";
  });

  // Affiche nouveau combattants
  socket.on("update upcoming fighters", function (data) {
    document.getElementById("upcoming-red").textContent = data.nextRedName;
    document.getElementById("upcoming-red-club").textContent = data.nextRedClub;
    document.getElementById("upcoming-white").textContent = data.nextWhiteName;
    document.getElementById("upcoming-white-club").textContent =
      data.nextWhiteClub;
  });

  /*-----------------------------------------------------------------------------------------------------*/
  socket.on("timer update", function (data) {
    const { timeRemaining, selectedTime } = data; // Extraire timeRemaining et selectedTime de l'objet data
    document.getElementById("main-timer").textContent =
      formatTime(timeRemaining);

    const progressBar = document.getElementById("timer-progress");
    const percentage = (timeRemaining / selectedTime) * 100; // Calculez le pourcentage du temps restant
    progressBar.style.width = percentage + "%"; // Mettez à jour la largeur de la barre
  });

  // Une fonction pour formater le temps restant en un format MM:SS pourrait être utile
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  /*--------------------------------------------------------------------------------------------------------*/
  // Écouter les événements pour les scores
  socket.on("score update", function (data) {
    const element = document.getElementById(
      `display-${data.player}-${data.pointType}`
    );
    console.log("Element:", element); // Vérifiez si l'élément existe
    if (element) {
      element.textContent = data.score; // Mettre à jour le texte si l'élément existe
    } else {
      console.error(
        "Element not found for",
        `display-${data.player}-${data.pointType}`
      );
    }
  });

  /*-------------------------------------------------------------------------------------------------------*/
  // Écouter les événements pour les pénalités (Shido)
  socket.on("shido update", function (data) {
    const { player, shido } = data;
    const shidoContainer = document.getElementById(`display-${player}-shido`);
    shidoContainer.innerHTML = ""; // Effacer les shidos existants

    // Ajouter des <span> pour chaque shido
    for (let i = 0; i < shido; i++) {
      const shidoSpan = document.createElement("span");
      shidoSpan.classList.add("shido");
      shidoSpan.innerHTML = "S"; // Apparaître le S
      shidoContainer.appendChild(shidoSpan);
    }
  });

  /*--------------------------------------------------------------------------------------------------------*/
  // Écouter les événements pour l'immobilisation (Osae-Komi)
  socket.on("update osaekomi", function (data) {
    const { player, time } = data; // data should contain 'player' and 'time'
    const timerElement = document.getElementById(`osaekomi-${player}-timer`);
    const progressBar = document.getElementById(`osaekomi-${player}-progress`);

    if (timerElement) {
      timerElement.textContent = `${time}s`;
    }

    // Update progress bar as well
    const percentage = (time / 20) * 100; // Assuming 20s is the maximum
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    if (time < 10) {
      progressBar.style.backgroundColor = "white";
    } else if (time < 20) {
      progressBar.style.backgroundColor = "yellow";
    } else {
      progressBar.style.backgroundColor = "green";
    }
    // ...
  });

  /*-----------------------------------------------------------------------------------------------------*/
  socket.on("reset display", function () {
    // Réinitialiser les noms et les clubsscores
    document.getElementById("white-name-display").textContent = "Judoka Blanc";
    document.getElementById("red-name-display").textContent = "Judoka Rouge";
    document.getElementById("white-club-display").textContent = "Club";
    document.getElementById("red-club-display").textContent = "Club";

    // Réinitialiser les scores
    ["white", "red"].forEach((playerColor) => {
      ["ippon", "wazari", "kinza"].forEach((scoreType) => {
        document.getElementById(
          `display-${playerColor}-${scoreType}`
        ).textContent = "0";
      });

      // Réinitialiser les pénalités (Shidos)
      const shidoContainer = document.getElementById(
        `display-${playerColor}-shido`
      );
      shidoContainer.innerHTML = ""; // Effacer tous les Shidos existants

      // Réinitialiser les timers d'immobilisation
      const immobilizationTimer = document.getElementById(
        `osaekomi-${playerColor}-timer`
      );
      immobilizationTimer.textContent = "0s";
      const immobilizationProgress = document.getElementById(
        `osaekomi-${playerColor}-progress`
      );
      immobilizationProgress.style.width = "0%";
      immobilizationProgress.style.backgroundColor = "white"; // Réinitialiser la couleur
    });

    // Réinitialiser le chronomètre principal si nécessaire
    const mainTimer = document.getElementById("main-timer");
    mainTimer.textContent = "3:00"; // Ou la valeur par défaut appropriée
    const mainTimerProgress = document.getElementById("timer-progress");
    mainTimerProgress.style.width = "100%"; // Ou la valeur par défaut appropriée
  });

  /*----------------------------------------------------------------------------------------------------*/
  // Nom Animation et Logo
  socket.on("update animation", function (data) {
    const { animationName } = data;

    // Updating the animation name
    const animationNameDisplay = document.getElementById(
      "animation-name-display"
    );
    if (animationNameDisplay) animationNameDisplay.textContent = animationName;
  });

  /*-----------------------------------------------------------------------------*/
  // Affichage de la modale
  socket.on("toggle winner modal display", () => {
    const winnerModal = document.getElementById("winnerModal");
    winnerModal.classList.toggle("show");
  });

  // function toggleWinnerModalDisplay(winnerData) {
  //   const winnerModal = document.getElementById("winnerModal");

  //   // Mise à jour des informations
  //   document.getElementById("modalWinnerColorText").textContent =
  //     winnerData.color === "Blanc" ? "Judoka Blanc" : "Judoka Rouge";
  //   document.getElementById("modalWinnerNameText").textContent =
  //     winnerData.name;
  //   document.getElementById("modalWinnerClubText").textContent =
  //     winnerData.club;
  //   document.getElementById(
  //     "modalWinnerResultsText"
  //   ).textContent = `Score: ${winnerData.points}`;

  //   winnerModal.classList.toggle("show");
  // }

  socket.on("update winner modal display", (winnerData) => {
    document.getElementById("modalWinnerColorText").textContent =
      winnerData.color;
    document.getElementById("modalWinnerNameText").textContent =
      winnerData.name;
    document.getElementById("modalWinnerClubText").textContent =
      winnerData.club;
    document.getElementById(
      "modalWinnerResultsText"
    ).textContent = `Points: ${winnerData.points}`;
  });
});
