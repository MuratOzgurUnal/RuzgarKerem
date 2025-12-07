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

    // Klavye Yön Tuşları (Slayt Geçişi)
    document.addEventListener('keydown', e => {
        // Eğer oyun modalı açıksa sayfa değiştirmeyi engelle
        if (document.getElementById('gameModal').classList.contains('open')) return;

        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
    });
}

/* =========================================
   YENİ EKLENEN: TEST VE OYUN KODLARI
   ========================================= */

// --- MODAL AÇMA KAPAMA ---
function openQuiz() {
    document.getElementById('quizModal').classList.add('open');
    loadQuestion();
}

function openGame() {
    document.getElementById('gameModal').classList.add('open');
    initMaze();
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// --- TEST (QUIZ) MANTIĞI ---
const questions = [
    {
        q: "Çocuklar hangi hayvanı görmek için gruptan ayrıldılar?",
        options: ["Maymun", "Timsah"],
        correct: 1
    },
    {
        q: "Rüzgar ve arkadaşlarının kurduğu takımın adı neydi?",
        options: ["Küçük Maceracılar", "Orman Dedektifleri"],
        correct: 0
    }
];

let currentQ = 0;
let score = 0;

function loadQuestion() {
    if (currentQ >= questions.length) {
        // Test Bitti
        document.getElementById('quizQuestionArea').style.display = 'none';
        document.getElementById('quizResult').style.display = 'block';
        return;
    }

    document.getElementById('quizQuestionArea').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    
    const qData = questions[currentQ];
    document.getElementById('qText').innerText = (currentQ + 1) + ") " + qData.q;
    document.getElementById('opt0').innerText = qData.options[0];
    document.getElementById('opt1').innerText = qData.options[1];
    
    // Buton renklerini sıfırla
    document.getElementById('opt0').style.background = "#74b9ff";
    document.getElementById('opt1').style.background = "#74b9ff";
}

function checkAnswer(selectedOption) {
    const correctOption = questions[currentQ].correct;
    const btn = document.getElementById('opt' + selectedOption);

    if (selectedOption === correctOption) {
        btn.style.background = "#00b894"; // Yeşil
        score++;
        setTimeout(() => {
            currentQ++;
            loadQuestion();
        }, 1000);
    } else {
        btn.style.background = "#ff7675"; // Kırmızı
        // Yanlış yapsa da geçsin veya tekrar denesin (Burada direkt geçiş yapıyoruz)
        setTimeout(() => {
            alert("Yanlış cevap! Ama sorun değil, devam edelim.");
            currentQ++;
            loadQuestion();
        }, 500);
    }
}

// --- LABİRENT (MAZE) OYUNU ---
const canvas = document.getElementById('mazeCanvas');
let ctx; // Context sonradan alınacak, sayfa yüklendiğinde var olmayabilir

// 1: Duvar, 0: Yol, 2: Oyuncu Başlangıç, 3: Hedef
// Basit 10x10 Labirent
const mazeMap = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,1,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1]
];

let playerPos = { x: 1, y: 1 };
const tileSize = 30; // 300px / 10 kare

function initMaze() {
    if(!canvas) return;
    ctx = canvas.getContext('2d');
    
    // Reset
    playerPos = { x: 1, y: 1 };
    drawMaze();
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < mazeMap.length; y++) {
        for (let x = 0; x < mazeMap[y].length; x++) {
            const tile = mazeMap[y][x];
            if (tile === 1) {
                ctx.fillStyle = "#2c3e50"; // Duvar Rengi
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else if (tile === 3) {
                ctx.fillStyle = "#e74c3c"; // Hedef (Öğretmen)
                ctx.font = "20px Arial";
                ctx.fillText("👩‍🏫", x * tileSize + 2, y * tileSize + 22);
            }
        }
    }

    // Oyuncuyu Çiz (Rüzgar)
    ctx.fillStyle = "#0984e3";
    ctx.beginPath();
    ctx.arc(playerPos.x * tileSize + tileSize/2, playerPos.y * tileSize + tileSize/2, 10, 0, Math.PI * 2);
    ctx.fill();
}

function movePlayer(dx, dy) {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Duvar kontrolü
    if (mazeMap[newY][newX] !== 1) {
        playerPos.x = newX;
        playerPos.y = newY;
        drawMaze();

        // Hedef kontrolü
        if (mazeMap[newY][newX] === 3) {
            setTimeout(() => {
                alert("TEBRİKLER! Rüzgar'ı öğretmene ulaştırdın! 🎉");
                closeModal('gameModal');
            }, 100);
        }
    }
}

// Klavye Desteği (Oyun İçin)
document.addEventListener('keydown', (e) => {
    // Sadece oyun modalı açıksa çalışsın
    const gameModal = document.getElementById('gameModal');
    if (!gameModal || !gameModal.classList.contains('open')) return;

    if (e.key === "ArrowUp") movePlayer(0, -1);
    if (e.key === "ArrowDown") movePlayer(0, 1);
    if (e.key === "ArrowLeft") movePlayer(-1, 0);
    if (e.key === "ArrowRight") movePlayer(1, 0);
});