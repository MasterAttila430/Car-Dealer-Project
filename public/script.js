// Extra infó betöltése a főoldalon
async function toggleExtraInfo(carId) {
  const infoDiv = document.getElementById(`extra-info-${carId}`);

  infoDiv.textContent = 'Betöltés...';

  try {
    const response = await fetch(`/api/cars/${carId}/info`);

    if (!response.ok) {
      throw new Error('Hiba a szerver válaszában');
    }

    const data = await response.json();

    const date = new Date(data.createdAt).toLocaleDateString('hu-HU');
    const time = new Date().toLocaleTimeString('hu-HU');

    // Tartalom megjelenítése
    infoDiv.innerHTML = `<small>Feltöltve: ${date} (Frissítve: ${time})</small>`;
  } catch (error) {
    console.error(error);
    infoDiv.textContent = 'Hiba történt az adatok betöltésekor.';
    infoDiv.style.color = 'red';
  }
}

window.toggleExtraInfo = toggleExtraInfo;

// KÉP TÖRLÉSE FUNKCIÓ
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.delete-btn');

  buttons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      const currentButton = e.currentTarget;
      const id = currentButton.getAttribute('data-id');

      if (!confirm('Biztosan törölni akarod ezt a képet?')) {
        return;
      }

      try {
        const response = await fetch(`/api/photos/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          const card = currentButton.closest('.photo-card');
          if (card) {
            card.remove();
          }
          alert('Sikeres törlés!');
        } else {
          alert(`Hiba történt: ${data.error || 'Ismeretlen hiba'}`);
        }
      } catch (err) {
        console.error(err);
        alert('Nem sikerült elérni a szervert.');
      }
    });
  });
});
