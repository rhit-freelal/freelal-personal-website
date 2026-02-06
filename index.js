const slides = document.querySelectorAll(".slides img");
let slideIndex = 0;
let intervalId = null;

document.addEventListener("DOMContentLoaded", function() {
    initializeSlider();

    const plusButton = document.getElementById('plusButton');
    const slider = document.querySelector('.slider');

    if (plusButton && slider) {
        plusButton.addEventListener('click', function() {
            slider.classList.add('enlarged');
            plusButton.style.display = 'none';

            let xButton = document.createElement('button');
            xButton.innerHTML = 'x';
            xButton.id = 'xButton';
            slider.appendChild(xButton);

            xButton.addEventListener('click', function() {
                slider.classList.remove('enlarged');
                plusButton.style.display = 'block';
                xButton.remove();
            });
        });
    }

    // Ensure these event listeners are added only once
    const nextButton = document.querySelector(".next");
    const prevButton = document.querySelector(".previous");

});

function initializeSlider() {
    if (slides.length > 0) {
        slides[slideIndex].classList.add("displaySlide");
        startInterval(3000);
    }
}

function startInterval(interval) {
    clearInterval(intervalId);
    intervalId = setInterval(nextSlide, interval);
}

function showSlide(index) {
    console.log("Showing slide:", index); // Debugging line
    slideIndex = index % slides.length;
    if (slideIndex < 0) {
        slideIndex = slides.length - 1;
    }
    slides.forEach((slide, i) => {
        slide.classList.toggle("displaySlide", i === slideIndex);
    });
}

function prevSlide() {
    showSlide(slideIndex - 1);
    startInterval(3000);  // Reset to 6 seconds after user interaction
}

function nextSlide() {
    showSlide(slideIndex + 1);
    startInterval(3000);  // Reset to 6 seconds after user interaction
}








