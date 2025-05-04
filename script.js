document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const canvasContainer = document.querySelector('.canvas-container');

    // Brush indicator elements
    const brushTypeIndicator = document.getElementById('brush-type-indicator');
    const brushSizeIndicator = document.getElementById('brush-size-indicator');
    const chaosLevelIndicator = document.getElementById('chaos-level-indicator');

    // Resize canvas to fill container
    function resizeCanvas() {
        canvas.width = canvasContainer.clientWidth;
        canvas.height = canvasContainer.clientHeight;

        // Add a subtle grid pattern to the canvas
        drawCanvasBackground();
    }

    function drawCanvasBackground() {
        // Save current drawing state
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Clear canvas and draw grid if needed
        // We're not actually drawing the grid here as it's handled by CSS
        // but you could add more complex background patterns here

        // Restore drawing state
        ctx.putImageData(imageData, 0, 0);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Brush settings
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let brushType = 'normal';
    let brushSize = 10;
    let chaosLevel = 5;

    // Initialize brush indicators
    updateBrushIndicators();

    // Interference elements
    let lastInterferenceTime = 0;
    const interferenceInterval = 3000; // 3 seconds

    // Color utilities
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function getRandomTransparentColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const a = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        const { offsetX, offsetY } = getCoordinates(e);
        lastX = offsetX;
        lastY = offsetY;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getCoordinates(e) {
        let offsetX, offsetY;

        if (e.type.includes('touch')) {
            const rect = canvas.getBoundingClientRect();
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;
        } else {
            offsetX = e.offsetX;
            offsetY = e.offsetY;
        }

        return { offsetX, offsetY };
    }

    function draw(e) {
        if (!isDrawing) return;

        const { offsetX, offsetY } = getCoordinates(e);

        // Apply chaos to brush size
        const chaosMultiplier = chaosLevel / 5; // 0.2 to 2.0
        const randomizedSize = brushSize * (1 + (Math.random() - 0.5) * chaosMultiplier);

        switch (brushType) {
            case 'normal':
                drawNormalBrush(offsetX, offsetY, randomizedSize);
                break;
            case 'zigzag':
                drawZigzagBrush(offsetX, offsetY, randomizedSize);
                break;
            case 'splatter':
                drawSplatterBrush(offsetX, offsetY, randomizedSize);
                break;
            case 'ghost':
                drawGhostBrush(offsetX, offsetY, randomizedSize);
                break;
        }

        lastX = offsetX;
        lastY = offsetY;

        // Trigger random interference based on chaos level
        const now = Date.now();
        if (now - lastInterferenceTime > interferenceInterval / chaosMultiplier) {
            triggerRandomInterference();
            lastInterferenceTime = now;
        }
    }

    // Brush implementations
    function drawNormalBrush(x, y, size) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);

        // Random color changes based on chaos level
        if (Math.random() < chaosLevel / 20) {
            ctx.strokeStyle = getRandomColor();
        }

        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Add slight randomness to line
        const jitter = chaosLevel * 0.5;
        const jitterX = x + (Math.random() - 0.5) * jitter;
        const jitterY = y + (Math.random() - 0.5) * jitter;

        ctx.lineTo(jitterX, jitterY);
        ctx.stroke();
    }

    function drawZigzagBrush(x, y, size) {
        ctx.beginPath();
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Random color changes
        if (Math.random() < chaosLevel / 15) {
            ctx.strokeStyle = getRandomColor();
        }

        // Calculate zigzag points
        const amplitude = size * (1 + Math.random() * chaosLevel / 2);
        const segments = 5 + Math.floor(Math.random() * 5);
        const dx = (x - lastX) / segments;
        const dy = (y - lastY) / segments;

        ctx.moveTo(lastX, lastY);

        for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const zigX = lastX + dx * i + Math.sin(progress * Math.PI * 2) * amplitude;
            const zigY = lastY + dy * i + Math.cos(progress * Math.PI * 2) * amplitude;
            ctx.lineTo(zigX, zigY);
        }

        ctx.stroke();
    }

    function drawSplatterBrush(x, y, size) {
        // Main line
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineWidth = size * 0.7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Random color
        ctx.strokeStyle = getRandomColor();
        ctx.lineTo(x, y);
        ctx.stroke();

        // Splatter effect
        const splatterCount = Math.floor(5 + Math.random() * chaosLevel * 2);
        const maxDistance = size * chaosLevel;

        for (let i = 0; i < splatterCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * maxDistance;
            const splatterX = x + Math.cos(angle) * distance;
            const splatterY = y + Math.sin(angle) * distance;
            const splatterSize = size * (0.1 + Math.random() * 0.3);

            ctx.beginPath();
            ctx.arc(splatterX, splatterY, splatterSize, 0, Math.PI * 2);
            ctx.fillStyle = getRandomTransparentColor();
            ctx.fill();
        }
    }

    function drawGhostBrush(x, y, size) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);

        // Fading transparency
        const alpha = 0.1 + Math.random() * 0.6;
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Ghost trail effect
        const trailPoints = 3 + Math.floor(Math.random() * 3);
        const dx = (x - lastX) / trailPoints;
        const dy = (y - lastY) / trailPoints;

        for (let i = 1; i <= trailPoints; i++) {
            const trailX = lastX + dx * i + (Math.random() - 0.5) * chaosLevel * 2;
            const trailY = lastY + dy * i + (Math.random() - 0.5) * chaosLevel * 2;

            ctx.lineTo(trailX, trailY);
            ctx.stroke();

            // Start a new path segment with decreasing opacity
            if (i < trailPoints) {
                ctx.beginPath();
                ctx.moveTo(trailX, trailY);
                const fadeAlpha = alpha * (1 - i / trailPoints);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${fadeAlpha})`;
            }
        }
    }

    // Interference effects
    function triggerRandomInterference() {
        const interferenceType = Math.floor(Math.random() * 4);

        switch (interferenceType) {
            case 0:
                shakeCanvas();
                break;
            case 1:
                colorBleed();
                break;
            case 2:
                randomShapes();
                break;
            case 3:
                autonomousDraw();
                break;
        }
    }

    function shakeCanvas() {
        canvas.classList.add('shake');
        setTimeout(() => {
            canvas.classList.remove('shake');
        }, 200);
    }

    function colorBleed() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 20 + Math.random() * 50 * (chaosLevel / 5);

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, getRandomTransparentColor());
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function randomShapes() {
        const shapeCount = 1 + Math.floor(Math.random() * chaosLevel / 2);

        for (let i = 0; i < shapeCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 10 + Math.random() * 30;

            ctx.beginPath();
            ctx.fillStyle = getRandomTransparentColor();

            const shapeType = Math.floor(Math.random() * 3);
            switch (shapeType) {
                case 0: // Circle
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    break;
                case 1: // Square
                    ctx.rect(x - size/2, y - size/2, size, size);
                    break;
                case 2: // Triangle
                    ctx.moveTo(x, y - size/2);
                    ctx.lineTo(x + size/2, y + size/2);
                    ctx.lineTo(x - size/2, y + size/2);
                    ctx.closePath();
                    break;
            }

            ctx.fill();
        }
    }

    function autonomousDraw() {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const length = 50 + Math.random() * 100;
        const steps = 10 + Math.floor(Math.random() * 20);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineWidth = 1 + Math.random() * 5;
        ctx.strokeStyle = getRandomTransparentColor();

        let x = startX;
        let y = startY;

        for (let i = 0; i < steps; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = length / steps;

            x += Math.cos(angle) * distance;
            y += Math.sin(angle) * distance;

            ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopDrawing();
    });

    // UI controls
    document.getElementById('clear-canvas').addEventListener('click', () => {
        // Add a confirmation animation
        const clearButton = document.getElementById('clear-canvas');
        clearButton.innerHTML = '<i class="fas fa-question-circle"></i> 确定?';
        clearButton.style.background = 'linear-gradient(to bottom, #ff9800, #f57c00)';

        // Create a timeout to reset the button if not clicked again
        const resetTimeout = setTimeout(() => {
            clearButton.innerHTML = '<i class="fas fa-trash-alt"></i> 清空画布';
            clearButton.style.background = 'linear-gradient(to bottom, var(--danger-color), #c4001d)';
        }, 2000);

        // Set a flag to track if this is the confirmation click
        if (!clearButton.dataset.confirming) {
            clearButton.dataset.confirming = 'true';
            return;
        }

        // If we get here, it's the second click (confirmation)
        clearTimeout(resetTimeout);
        clearButton.dataset.confirming = '';

        // Add a fade-out effect to the canvas content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // Create a fading animation
        let opacity = 1;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                clearButton.innerHTML = '<i class="fas fa-trash-alt"></i> 清空画布';
                clearButton.style.background = 'linear-gradient(to bottom, var(--danger-color), #c4001d)';
                return;
            }

            // Clear and redraw with decreasing opacity
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = opacity;
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.globalAlpha = 1;
        }, 50);
    });

    document.getElementById('brush-size').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        updateBrushIndicators();

        // Visual feedback on slider change
        const sizeSlider = document.getElementById('brush-size');
        sizeSlider.style.boxShadow = `0 0 10px var(--primary-light)`;
        setTimeout(() => {
            sizeSlider.style.boxShadow = 'none';
        }, 300);
    });

    document.getElementById('chaos-level').addEventListener('input', (e) => {
        chaosLevel = parseInt(e.target.value);
        updateBrushIndicators();

        // Visual feedback on slider change with color based on chaos level
        const chaosSlider = document.getElementById('chaos-level');
        let glowColor = chaosLevel <= 3 ? 'var(--success-color)' :
                        chaosLevel <= 7 ? 'var(--warning-color)' :
                        'var(--danger-color)';
        chaosSlider.style.boxShadow = `0 0 10px ${glowColor}`;
        setTimeout(() => {
            chaosSlider.style.boxShadow = 'none';
        }, 300);

        // Shake the canvas slightly when chaos level is high
        if (chaosLevel > 7) {
            canvas.classList.add('shake');
            setTimeout(() => {
                canvas.classList.remove('shake');
            }, 300);
        }
    });

    // Function to update brush indicators
    function updateBrushIndicators() {
        // Update brush type indicator
        let brushIcon = '';
        switch (brushType) {
            case 'normal':
                brushIcon = '<i class="fas fa-palette" style="color: #ff4081;"></i>';
                break;
            case 'zigzag':
                brushIcon = '<i class="fas fa-bolt" style="color: #00b0ff;"></i>';
                break;
            case 'splatter':
                brushIcon = '<i class="fas fa-spray-can" style="color: #ffab00;"></i>';
                break;
            case 'ghost':
                brushIcon = '<i class="fas fa-ghost" style="color: #aa00ff;"></i>';
                break;
        }
        brushTypeIndicator.innerHTML = brushIcon;

        // Update size indicator
        brushSizeIndicator.textContent = brushSize;
        brushSizeIndicator.style.width = Math.min(30 + brushSize/2, 60) + 'px';
        brushSizeIndicator.style.height = Math.min(30 + brushSize/2, 60) + 'px';

        // Update chaos level indicator with color coding
        chaosLevelIndicator.textContent = chaosLevel;

        // Color the chaos indicator based on level
        if (chaosLevel <= 3) {
            chaosLevelIndicator.style.background = 'var(--success-color)';
        } else if (chaosLevel <= 7) {
            chaosLevelIndicator.style.background = 'var(--warning-color)';
        } else {
            chaosLevelIndicator.style.background = 'var(--danger-color)';
        }
    }

    // Brush selection with enhanced visual feedback
    const brushButtons = document.querySelectorAll('.brush-options button');

    brushButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            brushButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button with animation
            button.classList.add('active');

            // Add a subtle animation to the canvas
            canvas.style.transform = 'scale(0.98)';
            setTimeout(() => {
                canvas.style.transform = 'scale(1)';
            }, 200);

            // Set brush type
            brushType = button.id.replace('-brush', '');

            // Set initial color based on brush type
            switch (brushType) {
                case 'normal':
                    ctx.strokeStyle = '#ff4081';
                    break;
                case 'zigzag':
                    ctx.strokeStyle = '#00b0ff';
                    break;
                case 'splatter':
                    ctx.strokeStyle = '#ffab00';
                    break;
                case 'ghost':
                    ctx.strokeStyle = 'rgba(170, 0, 255, 0.5)';
                    break;
            }

            // Update the brush indicators
            updateBrushIndicators();
        });
    });

    // Initialize with default brush
    ctx.strokeStyle = '#ff4081';
});
