const createHeader = () => {
    const app = document.getElementById("app");
    
    const header = document.createElement("header");
    header.className = "header";
    
    header.innerHTML = `
        <div class="container">
            <h1 class="logo">💭 Frases Inspiradoras</h1>
            <nav class="nav">
                <button id="theme-toggle-btn" class="btn btn-secondary">dark mode</button>
                <button id="new-quote-btn" class="btn btn-primary">Nueva Frase</button>
            </nav>
        </div>
    `;
    
    app.insertBefore(header, app.firstChild);
    
    console.log("✅ Header creado");
};

export { createHeader };

