// Fetch and display extra info for a listing on the home page
async function toggleExtraInfo(carId) {
  const infoDiv = document.getElementById(`extra-info-${carId}`);

  infoDiv.textContent = 'Loading...';

  try {
    const response = await fetch(`/api/cars/${carId}/info`);

    if (!response.ok) {
      throw new Error('Server returned an error response');
    }

    const data = await response.json();

    const date = new Date(data.createdAt).toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-GB');

    infoDiv.innerHTML = `<small>Posted: ${date} (Refreshed: ${time})</small>`;
  } catch (error) {
    console.error(error);
    infoDiv.textContent = 'Failed to load data.';
    infoDiv.style.color = 'red';
  }
}

window.toggleExtraInfo = toggleExtraInfo;

// Handle image deletion via DELETE API
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.delete-btn');

  buttons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      const currentButton = e.currentTarget;
      const id = currentButton.getAttribute('data-id');

      if (!confirm('Are you sure you want to delete this image?')) {
        return;
      }

      try {
        const response = await fetch(`/api/photos/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          // Remove the photo card from the DOM
          const card = currentButton.closest('.photo-card');
          if (card) {
            card.remove();
          }
          alert('Image deleted successfully!');
        } else {
          alert(`Error: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        alert('Could not reach the server.');
      }
    });
  });
});
