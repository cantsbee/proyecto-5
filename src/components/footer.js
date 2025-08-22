const createFooter = () => {
    const app = document.getElementById("app");
    
    const footer = document.createElement("footer");
    footer.className = "footer";
    
    footer.innerHTML = `
        <div class="container">
            <p>&copy; 2025 pa q te inspires. Hecho con ❤️ y muchas lágrimas</p>
            <p class="api-credit">Frases obtenidas de APIs públicas gratuitas</p>
        </div>
    `;
    
    app.appendChild(footer);
    
    console.log("✅ Footer creado ");
};

export { createFooter };

