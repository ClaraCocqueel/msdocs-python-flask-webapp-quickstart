// Liste des utilisateurs codés en dur
const users = [
    { id: 1, name: "Utilisateur 1", lat: 48.8566, lon: 2.3522 },
    { id: 2, name: "Utilisateur 2", lat: 40.7128, lon: -74.0060 },
    { id: 3, name: "Utilisateur 3", lat: 34.0522, lon: -118.2437 }
];

// URL de l'API pour récupérer les données
const apiUrl = "https://sentinel-pulse.azureiotcentral.com/api/preview/devices/lora-stm/properties";

// Initialisation de la carte Leaflet
var map = L.map('map').setView([48.8566, 2.3522], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker = null;

function showPosition(lat, lon, userName) {
    map.setView([lat, lon], 13);

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon]).addTo(map);

    const positionInfo = document.getElementById('position-info');
    positionInfo.textContent = `${userName} | Position : ${lat}, ${lon}`;
}

// Fonction pour afficher les utilisateurs dans l'interface
function displayUsers() {
    const usersContainer = document.getElementById("users");

    users.forEach(user => {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = user.name;

        details.appendChild(summary);
        details.addEventListener("click", () => handleUserClick(user));
        usersContainer.appendChild(details);
    });
}

// Fonction pour gérer le clic sur un utilisateur
async function handleUserClick(user) {
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Authorization": "SharedAccessSignature sr=7538b2c8-1794-42b9-b335-9912463a7f44&sig=1LdrUt0nT2ixy5bIduIgXFzdXgTt%2BcDKQFM3tNyFTWo%3D&skn=TestAPI&se=1769076649330",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateUserData(user, data);
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
    }
}

// Mettre à jour l'interface utilisateur avec les données récupérées
function updateUserData(user, data) {
    const { ambient_light, emergency, heart_rate, obstacle_distance } = data.decodedPayload;

    const usersContainer = document.getElementById("users");

    const userDetails = Array.from(usersContainer.children).find(detail => {
        return detail.querySelector("summary").textContent === user.name;
    });

    userDetails.innerHTML = `
        <summary>${user.name}</summary>
        <p>Heart Rate: ${heart_rate}</p>
        <p>Obstacle Distance: ${obstacle_distance}</p>
        <p>Emergency: ${emergency}</p>
        <p>Ambient Light: ${ambient_light}</p>
    `;

    showPosition(user.lat, user.lon, user.name); // Met à jour la carte
}

// Initialisation de l'application
function initApp() {
    displayUsers(); // Afficher les utilisateurs
}

window.onload = initApp;
