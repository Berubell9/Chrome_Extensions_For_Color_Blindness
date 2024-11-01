document.addEventListener("DOMContentLoaded", () => {
    const colorInput = document.getElementById('colorInput');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
  
    if (colorInput && hexValue && rgbValue) {
      colorInput.addEventListener('input', function () {
        const color = this.value;
        hexValue.textContent = color;
        rgbValue.textContent = hexToRgb(color);
      });
    } else {
      console.error("One or more elements (colorInput, hexValue, rgbValue) not found in the DOM.");
    }
    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
 });
  

  