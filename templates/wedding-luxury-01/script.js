async function loadData() {
  const response = await fetch('data.json');
  const data = await response.json();

  document.getElementById('bride').textContent = data.bride;
  document.getElementById('groom').textContent = data.groom;
  document.getElementById('date').textContent = data.date;
  document.getElementById('time').textContent = data.time;
  document.getElementById('message').textContent = data.message;
  document.getElementById('venue').textContent = data.venue;
  document.getElementById('address').textContent = data.address;
  document.getElementById('mapLink').href = data.mapUrl;
  document.getElementById('whatsappLink').href = `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`;

  const schedule = document.getElementById('schedule');
  schedule.innerHTML = data.schedule.map(item => `<div class="schedule-item"><strong>${item.time}</strong><span>${item.title}</span></div>`).join('');

  startCountdown(data.date, data.time);
}

function startCountdown(dateText, timeText) {
  const target = new Date(`${dateText} ${timeText}`).getTime();
  const el = document.getElementById('countdown');
  function tick() {
    const diff = target - Date.now();
    if (Number.isNaN(target) || diff <= 0) {
      el.textContent = 'The celebration is here';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    el.textContent = `${days} days · ${hours} hours · ${minutes} minutes`;
  }
  tick();
  setInterval(tick, 60000);
}

loadData();
