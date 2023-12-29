// display.js
document.addEventListener("DOMContentLoaded", function () {
  const socket = io(); // Connectez-vous au serveur WebSocket

  // Écouter les événements pour les noms des judokas
  socket.on("update names", function (data) {
    document.getElementById("white-name-display").textContent = data.white;
    document.getElementById("red-name-display").textContent = data.red;
  });

  socket.on("update clubs", function (data) {
    // Mettre à jour les informations du club sur l'affichage
    document.getElementById("white-club-display").textContent = data.white;
    document.getElementById("red-club-display").textContent = data.red;
  });

  socket.on("timer update", function (data) {
    console.log(data);
    const { timeRemaining, selectedTime } = data; // Extraire timeRemaining et selectedTime de l'objet data
    console.log(timeRemaining, selectedTime);
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

  // Écouter les événements pour les scores
  socket.on("score update", function (data) {
    console.log("Data received:", data); // Vérifiez les données reçues
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

  // Écouter les événements pour l'immobilisation (Osae-Komi)
  socket.on("update osaekomi", function (data) {
    const { player, time } = data;
    const osaeKomiTimer = document.getElementById(`osaekomi-${player}-timer`);
    const progressBar = document.getElementById(`osaekomi-${player}-progress`);
    osaeKomiTimer.textContent = `${time} sec`;
    console.log(osaeKomiTimer.textContent);
    updateOsaekomiProgressBar(player, time);
  });

  function updateOsaekomiProgressBar(player, time) {
    const progressBar = document.getElementById(`osaekomi-${player}-progress`);
    const percentage = (time / 20) * 100;
    progressBar.style.width = `${percentage}%`;

    if (time < 10) {
      progressBar.style.backgroundColor = "white";
    } else if (time < 20) {
      progressBar.style.backgroundColor = "yellow";
    } else {
      progressBar.style.backgroundColor = "green";
    }
  }

  socket.on("reset display", function () {
    // Réinitialiser l'affichage des noms et des clubs
    document.getElementById("white-name-display").textContent = "Nom Blanc: ";
    document.getElementById("red-name-display").textContent = "Nom Rouge: ";
    document.getElementById("white-club-display").textContent = "Club Blanc: ";
    document.getElementById("red-club-display").textContent = "Club Rouge: ";

    // Réinitialisez également ici les scores, les pénalités, le chronomètre, etc.
  });

  // Ajoutez ici d'autres écouteurs pour différents types de données que vous souhaitez synchroniser
});
