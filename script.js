document.addEventListener('DOMContentLoaded', () => {
    // Sadece Kitap Sayfasında Çalışsın
    if (document.querySelector('.story-container')) {
        initBook();
    } else {
        // Ana Sayfadaysak Loader'ı kaldır
        gsap.to("#loader", { duration: 0.5, opacity: 0, display: "none" });
    }
});

function initBook() {
    let currentSlide = 1;
    const totalSlides = 13;
    let isAnimating = false;
    let soundEnabled = false;

    const bgLayer = document.getElementById('bgLayer');
    const pageNum = document.getElementById('pageNumber');
    const soundBtn = document.getElementById('soundToggle');
    const bgMusic = document.getElementById('bgMusic');
    const sfxTurn = document.getElementById('sfxPageTurn');

    // Loader'ı kaldır
    gsap.to("#loader", { duration: 0.8, opacity: 0, display: "none" });
    animateSlideIn(1);

    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundBtn.innerText = soundEnabled ? "🔊" : "🔇";
            if (soundEnabled) {
                bgMusic.volume = 0.2;
                bgMusic.play().catch(() => {});
            } else {
                bgMusic.pause();
            }
        });
    }

    window.nextSlide = function() { if (currentSlide < totalSlides && !isAnimating) changeSlide(currentSlide + 1); };
    window.prevSlide = function() { if (currentSlide > 1 && !isAnimating) changeSlide(currentSlide - 1); };

    function changeSlide(targetSlide) {
        isAnimating = true;
        if(soundEnabled && sfxTurn) { sfxTurn.currentTime = 0; sfxTurn.play(); }
        const direction = targetSlide > currentSlide ? -50 : 50;

        gsap.to(`#slide-${currentSlide}`, {
            duration: 0.5,
            xPercent: direction,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.set(`#slide-${currentSlide}`, { visibility: "hidden" });
                currentSlide = targetSlide;
                if(pageNum) pageNum.innerText = `${currentSlide} / ${totalSlides}`;
                changeBackgroundMood();
                animateSlideIn(direction * -1);
            }
        });
    }

    function animateSlideIn(fromDirection) {
        const slide = document.getElementById(`slide-${currentSlide}`);
        gsap.set(slide, { visibility: "visible", xPercent: fromDirection, opacity: 0 });

        gsap.to(slide, {
            duration: 0.6,
            xPercent: 0,
            opacity: 1,
            ease: "back.out(1)",
            onComplete: () => { isAnimating = false; }
        });

        const img = slide.querySelector('.story-img');
        const textArea = slide.querySelector('.text-area');

        if(img) {
            gsap.fromTo(img, 
                { scale: 0.8, y: 50, opacity: 0 }, 
                { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.7)" }
            );
        }

        if(textArea) {
            textArea.scrollTop = 0;
            gsap.fromTo(textArea.children, 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2 }
            );
        }
    }

    function changeBackgroundMood() {
        let colors = "";
        if (currentSlide <= 3) colors = "linear-gradient(180deg, #dff9fb 0%, #c7ecee 100%)";
        else if (currentSlide <= 6) colors = "linear-gradient(180deg, #daf5e8 0%, #b8e9d5 100%)";
        else if (currentSlide <= 11) colors = "linear-gradient(180deg, #e0dcfc 0%, #c4bbf5 100%)";
        else colors = "linear-gradient(180deg, #ffeaa7 0%, #fab1a0 100%)";
        
        if(bgLayer) gsap.to(bgLayer, { background: colors, duration: 1 });
    }

    // --- ÖNEMLİ DEĞİŞİKLİK ---
    // Dokunmatik kaydırma (Swipe) özellikleri kaldırıldı.
    // Klavye desteği devam ediyor.
    document.addEventListener('keydown', e => {
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
    });
}