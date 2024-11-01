// https://galactic.ink/labs/Color-Vision/Javascript/Color.Vision.Daltonize.js
$(document).ready(() => {
    if (!window.Color) Color = {};
    if (!window.Color.Vision) Color.Vision = {};

    (function () {
        // Color Vision Deficiency (CVD) Matrix
        var CVDMatrix = {
            Normal: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
            Protanope: [0.0, 2.02344, -2.52581, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
            Deuteranope: [1.0, 0.0, 0.0, 0.494207, 0.0, 1.24827, 0.0, 0.0, 1.0],
            Tritanope: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, -0.395913, 0.801109, 0.0],
        };

        // Daltonize Function
        Color.Vision.Daltonize = function (imageData, type) {
            var data = imageData.data;
            var cvd = CVDMatrix[type];

            var cvd_a = cvd[0],
                cvd_b = cvd[1],
                cvd_c = cvd[2],
                cvd_d = cvd[3],
                cvd_e = cvd[4],
                cvd_f = cvd[5],
                cvd_g = cvd[6],
                cvd_h = cvd[7],
                cvd_i = cvd[8];

            var L, M, S, l, m, s, R, G, B, RR, GG, BB;

            for (var id = 0; id < data.length; id += 4) {
                var r = data[id],
                    g = data[id + 1],
                    b = data[id + 2];

                // RGB to LMS matrix conversion
                L = 17.8824 * r + 43.5161 * g + 4.11935 * b;
                M = 3.45565 * r + 27.1554 * g + 3.86714 * b;
                S = 0.0299566 * r + 0.184309 * g + 1.46709 * b;

                // Simulate color blindness
                l = (cvd_a * L) + (cvd_b * M) + (cvd_c * S);
                m = (cvd_d * L) + (cvd_e * M) + (cvd_f * S);
                s = (cvd_g * L) + (cvd_h * M) + (cvd_i * S);

                // LMS to RGB matrix conversion
                R = (0.0809444479 * l) + (-0.130504409 * m) + (0.116721066 * s);
                G = (-0.0102485335 * l) + (0.0540193266 * m) + (-0.113614708 * s);
                B = (-0.000365296938 * l) + (-0.00412161469 * m) + (0.693511405 * s);

                // Isolate invisible colors to color vision deficiency (calculate error matrix)
                R = r - R;
                G = g - G;
                B = b - B;

                // Shift colors towards visible spectrum (apply error modifications)
                RR = (0.0 * R) + (0.0 * G) + (0.0 * B);
                GG = (0.7 * R) + (1.0 * G) + (0.0 * B);
                BB = (0.7 * R) + (0.0 * G) + (1.0 * B);

                // Add compensation to original values
                R = RR + r;
                G = GG + g;
                B = BB + b;

                // Clamp values
                data[id] = Math.min(255, Math.max(0, R));
                data[id + 1] = Math.min(255, Math.max(0, G));
                data[id + 2] = Math.min(255, Math.max(0, B));
            }
            return imageData;
        };

        // DaltonizeColor Function
        Color.Vision.DaltonizeColor = function (rgb, type) {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            canvas.width = 1;
            canvas.height = 1;

            ctx.fillStyle = "rgb(" + rgb.join(",") + ")";
            ctx.fillRect(0, 0, 1, 1);
            var imageData = ctx.getImageData(0, 0, 1, 1);
            var daltonizedData = Color.Vision.Daltonize(imageData, type);
            return [
                daltonizedData.data[0],
                daltonizedData.data[1],
                daltonizedData.data[2],
            ];
        };
    })();

    var originalColors = [];

    function storeOriginalColors() {
        $elements.each(function () {
            var $el = $(this);
            var computedStyle = $el.css(['backgroundColor', 'color']);
            var bgColor = computedStyle.backgroundColor;
            var textColor = computedStyle.color;

            // เก็บค่าสีต้นฉบับ
            originalColors.push({
                element: $el,
                backgroundColor: bgColor,
                color: textColor
            });
        });
    }

    var $elements = $("body *:not(.btn-container-S *):not(.btn-container-H *)");
    var $images = $("img");

    // เก็บค่าสีต้นฉบับเมื่อเริ่มต้น
    storeOriginalColors();

    // Reset colors function
    function resetColors() {
        // รีเซ็ตสีพื้นหลังและสีข้อความจากค่าสีต้นฉบับ
        originalColors.forEach(function (colorObj) {
            colorObj.element.css({
                backgroundColor: colorObj.backgroundColor,
                color: colorObj.color
            });
        });

        // รีเซ็ตภาพกลับไปที่ต้นฉบับ
        $images.each(function () {
            var $img = $(this);
            if ($img.data("originalSrc")) {
                $img.attr("src", $img.data("originalSrc")); // เปลี่ยนกลับไปที่แหล่งข้อมูลต้นฉบับ
            }
        });
    }

    $("#normalBtn").on("click", () => selectType("Normal"));
    $("#protanopeBtn").on("click", () => selectType("Protanope"));
    $("#deuteranopeBtn").on("click", () => selectType("Deuteranope"));
    $("#tritanopeBtn").on("click", () => selectType("Tritanope"));

    function selectType(type) {
        resetColors();
        if (type !== "Normal") {
            applyDaltonizeToPage(type);
            console.log(type);
        }
        else {
            // Reset saturation slider to default (100%)
            $("#saturationSlider").val(1);
            $("#saturationValue").text("100%");
            adjustSaturation(1);
        }
    }

    // Apply daltonize to page function
    function applyDaltonizeToPage(type) {
        $elements.each(function () {
            var $el = $(this);
            var computedStyle = $el.css(['backgroundColor', 'color']);
            var bgColor = computedStyle.backgroundColor;
            var textColor = computedStyle.color;

            // Daltonize the background color
            if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
                var rgb = getRGBArray(bgColor);
                var daltonizedColor = Color.Vision.DaltonizeColor(rgb, type);
                $el.css("backgroundColor", "rgb(" + daltonizedColor.join(",") + ")");
            }

            // Daltonize the text color
            if (textColor && textColor !== "rgba(0, 0, 0, 0)") {
                var rgbText = getRGBArray(textColor);
                var daltonizedTextColor = Color.Vision.DaltonizeColor(rgbText, type);
                $el.css("color", "rgb(" + daltonizedTextColor.join(",") + ")");
            }
        });

        // Apply Daltonization to images
        daltonizeImages(type);
    }

    // Function to convert color in rgb() format to an array
    function getRGBArray(rgb) {
        return rgb.match(/\d+/g).map(Number);
    }

    // Function to apply daltonization to images
    function daltonizeImages(type) {
        $images.each(function () {
            var $img = $(this);
            // Store original source in data attribute if not already stored
            if (!$img.data("originalSrc")) {
                $img.data("originalSrc", $img.attr("src")); // Store the original source
            }

            // Create a canvas dynamically
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");

            // Set canvas size to match the image
            canvas.width = $img.width();
            canvas.height = $img.height();

            // Draw the original image onto the canvas
            var image = new Image();
            image.crossOrigin = "anonymous"; // Add this line if you load images from external sources
            image.src = $img.attr("src");

            image.onload = function () {
                ctx.drawImage(image, 0, 0, $img.width(), $img.height());
                var imageData = ctx.getImageData(0, 0, $img.width(), $img.height());

                // Apply daltonization to the original image data
                var daltonizedData = Color.Vision.Daltonize(imageData, type);
                ctx.putImageData(daltonizedData, 0, 0);

                // Convert canvas back to image and replace the src
                $img.attr("src", canvas.toDataURL());
            };
        });
    }

    // Saturation adjustment function
    function adjustSaturation(value) {
        $elements.each(function () {
            $(this).css("filter", `saturate(${value})`);
        });
        $("#saturationValue").text(`${Math.round(value * 100)}%`);
    }

    // Event listener สำหรับ slider
    $("#saturationSlider").on("input", function () {
        adjustSaturation(this.value);
    });
});
