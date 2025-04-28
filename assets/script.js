document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("header nav ul li a");
  const sections = document.querySelectorAll("main section");
  const sidebar = document.querySelector("header");
  const mainContent = document.querySelector("main");
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const topHeader = document.querySelector(".top-header");

  // Toggle sidebar functionality
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    if (topHeader) {
      topHeader.style.left = sidebar.classList.contains("collapsed") ? 
        `${getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed-width')}` : 
        `${getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')}`;
    }
  });

  // Function to show the section active and hide the others
  function showSection(sectionId) {
    sections.forEach(section => {
      if ("#" + section.id === sectionId) {
        section.classList.remove("hidden");
      } else {
        section.classList.add("hidden");
      }
    });
  }
  
  // Mostrar Dashboard por defecto y ocultar el resto
  showSection("#dashboard");

  // Manejar la navegación por pestañas
  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const targetSection = link.getAttribute("href");
      showSection(targetSection);
      // Actualizar la clase activa en las pestañas
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      history.pushState(null, '', targetSection);
    });
  });

  // Remove reportes link handler if it exists
  const reportesLink = document.querySelector('a[href="#reportes"]');
  if (reportesLink) {
    reportesLink.parentElement.remove();
  }

  // Manejar botones del footer del sidebar
  const footerLinks = document.querySelectorAll(".sidebar-footer-btn");
  footerLinks.forEach(link => {
    if (link.getAttribute("href") !== "login.php") {
      link.addEventListener("click", event => {
        event.preventDefault();
        const targetSection = link.getAttribute("href");
        showSection(targetSection);
        // Remover clase activa de todas las pestañas del nav principal
        navLinks.forEach(l => l.classList.remove("active"));
        history.pushState(null, '', targetSection);
      });
    }
  });



  // Function to populate birthdays section
  function populateBirthdaysSection(users) {
    const currentMonthContainer = document.getElementById('current-month-birthdays');
    const nextMonthContainer = document.getElementById('next-month-birthdays');
    
    if (!currentMonthContainer || !nextMonthContainer) return;
    
    // Clear containers
    currentMonthContainer.innerHTML = '';
    nextMonthContainer.innerHTML = '';
    
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    
    // Sort users by birthday proximity
    const usersBirthdays = users.map(user => {
      // Parse birth date (format DD/MM/YYYY)
      const [day, month, year] = user.fechaNacimiento.split('/').map(Number);
      
      // Create date objects for this year's birthday
      const birthdateThisYear = new Date(now.getFullYear(), month - 1, day);
      
      // If the birthday already occurred this year, calculate for next year
      if (birthdateThisYear < now) {
        birthdateThisYear.setFullYear(now.getFullYear() + 1);
      }
      
      // Calculate days until birthday
      const daysUntil = Math.ceil((birthdateThisYear - now) / (1000 * 60 * 60 * 24));
      
      return {
        ...user,
        birthMonth: month - 1, // 0-based month
        birthDay: day,
        daysUntil,
        birthDate: birthdateThisYear
      };
    });
    
    // Sort by days until birthday
    usersBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
    
    // Filter for current month and next month
    const currentMonthBirthdays = usersBirthdays.filter(user => user.birthMonth === currentMonth);
    const nextMonthBirthdays = usersBirthdays.filter(user => user.birthMonth === nextMonth);
    
    // Display message if no birthdays
    if (currentMonthBirthdays.length === 0) {
      currentMonthContainer.innerHTML = '<p class="no-data">No hay cumpleaños este mes</p>';
    }
    
    if (nextMonthBirthdays.length === 0) {
      nextMonthContainer.innerHTML = '<p class="no-data">No hay cumpleaños el próximo mes</p>';
    }
    
    // Get month names
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Create birthday cards for current month
    currentMonthBirthdays.forEach(user => {
      createBirthdayCard(user, currentMonthContainer, monthNames);
    });
    
    // Create birthday cards for next month
    nextMonthBirthdays.forEach(user => {
      createBirthdayCard(user, nextMonthContainer, monthNames);
    });
  }
  
  function createBirthdayCard(user, container, monthNames) {
    const card = document.createElement('div');
    card.className = 'birthday-card';
    
    // Get initials for avatar
    const nameParts = user.nombre.split(' ');
    const initials = nameParts[0].charAt(0) + (nameParts[1] ? nameParts[1].charAt(0) : '');
    
    // Create card content
    card.innerHTML = `
      <div class="birthday-avatar">${initials}</div>
      <div class="birthday-info">
        <h5>${user.nombre}</h5>
        <p>${user.correo}</p>
      </div>
      <div class="birthday-date">
        <div class="birthday-day">${user.birthDay}</div>
        <div class="birthday-month-text">${monthNames[user.birthMonth].substring(0, 3)}</div>
        <div class="birthday-countdown">${user.daysUntil === 0 ? 'Hoy' : 
                                       user.daysUntil === 1 ? 'Mañana' : 
                                       `En ${user.daysUntil} días`}</div>
      </div>
    `;
    
    container.appendChild(card);
  }

  // Call the function to generate user data when the page loads
  generateUserData();

  // Function to create a donut chart
  function createDonutChart(element, percentage, color) {
    const radius = 45; // Adjusted for the new chart size
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Create SVG elements
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100"); // Use hardcoded values
    svg.setAttribute("height", "100");
    svg.setAttribute("viewBox", "0 0 100 100");

    const backgroundCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    backgroundCircle.setAttribute("cx", "50");
    backgroundCircle.setAttribute("cy", "50");
    backgroundCircle.setAttribute("r", radius);
    backgroundCircle.setAttribute("class", "donut-chart-background");
    svg.appendChild(backgroundCircle);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", radius);
    circle.setAttribute("class", "donut-chart-circle");
    circle.setAttribute("stroke", color);
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "50%");
    text.setAttribute("y", "50%");
    text.setAttribute("class", "donut-chart-text");
    text.textContent = `${percentage}%`;
    svg.appendChild(text);

    element.appendChild(svg);
  }

  // Load Google Charts
  google.charts.load('current', {'packages':['corechart', 'line', 'bar']});
  google.charts.setOnLoadCallback(drawCharts);
  
  // Initialize charts using the existing event listener
  const activeUsersChart = document.querySelector("#active-users-chart");
  const reportsTodayChart = document.querySelector("#reports-today-chart");

  if (activeUsersChart) {
    createDonutChart(activeUsersChart, 75, "#da031b");
  }

  if (reportsTodayChart) {
    createDonutChart(reportsTodayChart, 40, "#da031b");
  }
});

function drawCharts() {
  drawUserActivityChart();
  drawReportsDistributionChart();
  drawSystemPerformanceChart();
  drawActiveUsersHourlyChart();
  drawReportsActivityChart();
}

function drawUserActivityChart() {
  const chartElement = document.getElementById('user-activity-chart');
  if (!chartElement) return;
  
  const data = google.visualization.arrayToDataTable([
    ['Mes', 'Activos', 'Nuevos', 'Inactivos'],
    ['Ene', 1000, 400, 200],
    ['Feb', 1170, 460, 250],
    ['Mar', 1260, 520, 300],
    ['Abr', 1030, 540, 350],
    ['May', 1200, 480, 280],
    ['Jun', 1350, 590, 390]
  ]);

  const options = {
    title: '',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors: ['#da031b', '#333', '#620f1e'],
    backgroundColor: 'transparent',
    chartArea: { width: '85%', height: '75%' },
    hAxis: { textStyle: { color: '#555' } },
    vAxis: { textStyle: { color: '#555' } },
    lineWidth: 3,
    pointSize: 5
  };

  const chart = new google.visualization.LineChart(chartElement);
  chart.draw(data, options);
}

function drawReportsDistributionChart() {
  const chartElement = document.getElementById('reports-distribution-chart');
  if (!chartElement) return;
  
  const data = google.visualization.arrayToDataTable([
    ['Categoría', 'Cantidad'],
    ['Errores', 45],
    ['Consultas', 26],
    ['Sugerencias', 15],
    ['Mejoras', 28],
    ['Otros', 6]
  ]);

  const options = {
    title: '',
    pieHole: 0.4,
    colors: ['#da031b', '#620f1e', '#333', '#777', '#aaa'],
    backgroundColor: 'transparent',
    chartArea: { width: '85%', height: '85%' },
    legend: { position: 'right', textStyle: { color: '#555' } }
  };

  const chart = new google.visualization.PieChart(chartElement);
  chart.draw(data, options);
}

function drawSystemPerformanceChart() {
  const chartElement = document.getElementById('system-performance-chart');
  if (!chartElement) return;
  
  const data = google.visualization.arrayToDataTable([
    ['Día', 'Tiempo de Respuesta (ms)', 'Carga (%)'],
    ['Lun', 42, 60],
    ['Mar', 38, 65],
    ['Mié', 54, 68],
    ['Jue', 57, 75],
    ['Vie', 35, 80],
    ['Sáb', 28, 50],
    ['Dom', 25, 45]
  ]);

  const options = {
    title: '',
    seriesType: 'bars',
    series: {1: {type: 'line'}},
    colors: ['#da031b', '#333'],
    backgroundColor: 'transparent',
    chartArea: { width: '85%', height: '75%' },
    hAxis: { textStyle: { color: '#555' } },
    vAxis: { textStyle: { color: '#555' } },
    bar: { groupWidth: '70%' }
  };

  const chart = new google.visualization.ComboChart(chartElement);
  chart.draw(data, options);
}

function drawActiveUsersHourlyChart() {
  const chartElement = document.getElementById('active-users-hourly-chart');
  if (!chartElement) return;
  
  const data = google.visualization.arrayToDataTable([
    ['Hora', 'Usuarios'],
    ['00:00', 24],
    ['02:00', 18],
    ['04:00', 12],
    ['06:00', 25],
    ['08:00', 78],
    ['10:00', 135],
    ['12:00', 158],
    ['14:00', 143],
    ['16:00', 126],
    ['18:00', 115],
    ['20:00', 87],
    ['22:00', 45]
  ]);

  const options = {
    title: '',
    curveType: 'function',
    legend: { position: 'none' },
    colors: ['#da031b'],
    backgroundColor: 'transparent',
    chartArea: { width: '85%', height: '75%' },
    hAxis: { textStyle: { color: '#555' } },
    vAxis: { textStyle: { color: '#555' } },
    lineWidth: 3,
    pointSize: 5,
    areaOpacity: 0.2
  };

  const chart = new google.visualization.AreaChart(chartElement);
  chart.draw(data, options);
}

function drawReportsActivityChart() {
  const chartElement = document.getElementById('reports-activity-chart');
  if (!chartElement) return;
  
  const data = google.visualization.arrayToDataTable([
    ['Semana', 'Reportes Generados', 'Reportes Resueltos'],
    ['Semana 1', 35, 28],
    ['Semana 2', 42, 35],
    ['Semana 3', 38, 33],
    ['Semana 4', 50, 42],
    ['Semana 5', 45, 40]
  ]);

  const options = {
    title: '',
    colors: ['#da031b', '#333'],
    backgroundColor: 'transparent',
    chartArea: { width: '85%', height: '75%' },
    hAxis: { textStyle: { color: '#555' } },
    vAxis: { textStyle: { color: '#555' } },
    legend: { position: 'top' },
    bar: { groupWidth: '75%' }
  };

  const chart = new google.visualization.ColumnChart(chartElement);
  chart.draw(data, options);
}