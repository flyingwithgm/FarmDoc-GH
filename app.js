// app.js
document.addEventListener('DOMContentLoaded', () => {
    const cropGrid = document.getElementById('crop-grid');
    const analysisSection = document.getElementById('analysis-section');
    const imageUpload = document.getElementById('image-upload');
    const imageCanvas = document.getElementById('image-canvas');
    const resultContainer = document.getElementById('result-container');
    const diseaseResult = document.getElementById('disease-result');
    const resetBtn = document.getElementById('reset-btn');
    
    let selectedCrop = null;
    let cropData = {};
    
    // List of crops with local names
    const crops = [
        { id: 'oil_palm', name: 'Oil Palm', local: 'Abe' },
        { id: 'cocoa', name: 'Cocoa', local: 'Kookoo' },
        { id: 'maize', name: 'Maize', local: 'Dze' },
        { id: 'cassava', name: 'Cassava', local: 'Bankyi' },
        { id: 'yam', name: 'Yam', local: 'Nyame' },
        { id: 'plantain', name: 'Plantain', local: 'Apantu' },
        { id: 'tomato', name: 'Tomato', local: 'Tomato' },
        { id: 'rice', name: 'Rice', local: 'Sasali' },
        { id: 'cowpea', name: 'Cowpea', local: 'Nkotokoto' },
        { id: 'pepper', name: 'Pepper', local: 'Pepa' },
        { id: 'cashew', name: 'Cashew', local: 'Akaju' },
        { id: 'mango', name: 'Mango', local: 'Mango' },
        { id: 'pineapple', name: 'Pineapple', local: 'Ananase' },
        { id: 'sorghum', name: 'Sorghum', local: 'Sorgo' },
        { id: 'groundnut', name: 'Groundnut', local: 'Nut' },
        { id: 'okra', name: 'Okra', local: 'Bamia' },
        { id: 'garden_egg', name: 'Garden Egg', local: 'Garden Egg' },
        { id: 'coconut', name: 'Coconut', local: 'Kɔkɔnut' },
        { id: 'sweet_potato', name: 'Sweet Potato', local: 'Apɔn' },
        { id: 'beans', name: 'Beans', local: 'Beans' }
    ];
    
    // Initialize crop grid
    function initCropGrid() {
        cropGrid.innerHTML = '';
        crops.forEach(crop => {
            const cropBtn = document.createElement('div');
            cropBtn.className = 'crop-btn';
            cropBtn.innerHTML = `
                <div class="crop-icon">🌱</div>
                <div class="crop-name">${crop.name}<br><small>${crop.local}</small></div>
            `;
            cropBtn.addEventListener('click', () => selectCrop(crop));
            cropGrid.appendChild(cropBtn);
        });
    }
    
    // Select a crop for analysis
    function selectCrop(crop) {
        selectedCrop = crop;
        analysisSection.classList.remove('hidden');
        cropGrid.parentElement.classList.add('hidden');
        
        // Load crop data
        loadCropData(crop.id);
    }
    
    // Load crop data from JSON
    async function loadCropData(cropId) {
        try {
            const response = await fetch(`src/diseases/${cropId}.json`);
            cropData = await response.json();
        } catch (error) {
            console.error('Error loading crop ', error);
            cropData = {
                name: selectedCrop.name,
                local_name: selectedCrop.local,
                diseases: []
            };
        }
    }
    
    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    analyzeImage(this);
                };
                img.src = event.target.result;
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Analyze image for disease
    function analyzeImage(img) {
        // Draw image to canvas
        const ctx = imageCanvas.getContext('2d');
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get dominant colors
        const colors = getDominantColors(ctx, img.width, img.height);
        
        // Detect shapes
        const shapes = detectShapes(ctx, img.width, img.height);
        
        // Match with disease data
        const disease = detectDisease(colors, shapes);
        
        // Display result
        displayResult(disease);
    }
    
    // Get dominant colors from image
    function getDominantColors(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const colorMap = {};
        
        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Convert to HSV for better color matching
            const hsv = rgbToHsv(r, g, b);
            const key = `${Math.round(hsv.h/10)*10},${Math.round(hsv.s/0.1)*0.1},${Math.round(hsv.v/0.1)*0.1}`;
            
            if (!colorMap[key]) {
                colorMap[key] = { count: 0, rgb: [r, g, b], hsv };
            }
            colorMap[key].count++;
        }
        
        // Sort by frequency and return top 5
        const sortedColors = Object.values(colorMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        return sortedColors.map(color => color.hsv);
    }
    
    // Simple shape detection
    function detectShapes(ctx, width, height) {
        // For simplicity, we'll use a basic approach
        // In a real app, this would be more sophisticated
        const shapes = {
            circular: false,
            linear: false,
            spots: false
        };
        
        // Sample implementation - in a real app this would analyze pixel patterns
        // For this demo, we'll randomly detect shapes
        shapes.circular = Math.random() > 0.7;
        shapes.linear = Math.random() > 0.7;
        shapes.spots = Math.random() > 0.5;
        
        return shapes;
    }
    
    // Detect disease based on colors and shapes
    function detectDisease(colors, shapes) {
        if (!cropData.diseases || cropData.diseases.length === 0) {
            return {
                name: "No disease data",
                symptoms: "Disease information not available for this crop",
                treatment: "Please consult with an agricultural expert"
            };
        }
        
        // For this demo, we'll match based on color triggers
        for (const disease of cropData.diseases) {
            // Check if any color triggers match
            if (disease.color_triggers) {
                for (const trigger of disease.color_triggers) {
                    if (colors.some(color => isColorMatch(color, trigger))) {
                        return {
                            name: disease.id.replace(/_/g, ' '),
                            symptoms: disease.symptoms,
                            treatment: disease.treatment
                        };
                    }
                }
            }
        }
        
        // If no specific match, return a generic result
        return {
            name: "Unknown Condition",
            symptoms: "Could not identify a specific disease. Consider consulting with an expert.",
            treatment: "Monitor the plant and take preventive measures."
        };
    }
    
    // Check if HSV color matches a named color
    function isColorMatch(hsv, colorName) {
        const hue = hsv.h;
        const saturation = hsv.s;
        const value = hsv.v;
        
        switch(colorName.toLowerCase()) {
            case 'yellow':
                return hue >= 45 && hue <= 75 && saturation > 0.3 && value > 0.5;
            case 'brown':
                return (hue >= 20 && hue <= 45) && saturation > 0.2 && value < 0.7;
            case 'black':
                return value < 0.2;
            case 'green':
                return hue >= 75 && hue <= 165 && saturation > 0.3 && value > 0.2;
            case 'red':
                return (hue >= 330 || hue <= 15) && saturation > 0.4 && value > 0.3;
            default:
                return false;
        }
    }
    
    // Display analysis result
    function displayResult(disease) {
        resultContainer.classList.remove('hidden');
        diseaseResult.innerHTML = `
            <div class="disease-info">
                <div class="disease-name">${disease.name}</div>
                <div class="symptoms"><strong>Symptoms:</strong> ${disease.symptoms}</div>
                <div class="treatment"><strong>Treatment:</strong> ${disease.treatment}</div>
            </div>
        `;
    }
    
    // Reset to crop selection
    resetBtn.addEventListener('click', () => {
        analysisSection.classList.add('hidden');
        cropGrid.parentElement.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        imageUpload.value = '';
    });
    
    // Helper function to convert RGB to HSV
    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        let h, s, v = max;
        
        if (max === 0) {
            s = 0;
        } else {
            s = diff / max;
        }
        
        if (max === min) {
            h = 0;
        } else {
            switch(max) {
                case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
                case g: h = (b - r) / diff + 2; break;
                case b: h = (r - g) / diff + 4; break;
            }
            h *= 60;
        }
        
        return { h, s, v };
    }
    
    // Initialize the app
    initCropGrid();
    
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});
