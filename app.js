/**
 * Magical Birthday Website - Main Controller
 * Handles Countdown, State Transitions, Cake blowing, Balloons, Letter, and Photos
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Engines
    const celebrationEngine = new CelebrationEngine('fx-canvas');
    let isPreviewMode = false;
    let countdownInterval = null;
    let hasTriggeredCelebration = false;

    // Elements
    const countdownSection = document.getElementById('countdown-section');
    const celebrationSection = document.getElementById('celebration-section');
    const btnMusic = document.getElementById('btn-music');
    const toast = document.getElementById('toast');

    // Live Clock display for Current Time
    function updateLiveClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

        const elClockNav = document.getElementById('current-clock-nav');
        const elClockHero = document.getElementById('current-clock-hero');
        if (elClockNav) elClockNav.textContent = strTime;
        if (elClockHero) elClockHero.textContent = strTime;
    }
    updateLiveClock();

    // Timer Elements
    const elHours = document.getElementById('hours');
    const elMinutes = document.getElementById('minutes');
    const elSeconds = document.getElementById('seconds');

    // Calculate Midnight Target Time (12:00 AM tonight - Sept 14, 2026 GMT+6 Bangladesh Time)
    function getTargetMidnight() {
        const now = Date.now();
        // Exact Bangladesh Standard Time (+06:00) midnight
        const targetBangladesh = new Date('2026-09-14T00:00:00+06:00').getTime();
        const endOfBirthday = new Date('2026-09-14T23:59:59+06:00').getTime();

        if (now < targetBangladesh) {
            return targetBangladesh;
        } else if (now <= endOfBirthday) {
            // Already her birthday! Target has passed, celebration will trigger immediately
            return targetBangladesh;
        }

        // Fallback for future dates: tonight midnight
        const target = new Date();
        target.setHours(24, 0, 0, 0);
        return target.getTime();
    }

    let targetTime = getTargetMidnight();

    // =========================================
    // COUNTDOWN LOGIC
    // =========================================
    function updateCountdown() {
        const now = Date.now();
        const diff = targetTime - now;

        if (diff <= 0) {
            if (!hasTriggeredCelebration) {
                hasTriggeredCelebration = true;
                triggerMidnightCelebration();
            }
            if (elHours) elHours.textContent = '00';
            if (elMinutes) elMinutes.textContent = '00';
            if (elSeconds) elSeconds.textContent = '00';
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (elHours) elHours.textContent = String(hours).padStart(2, '0');
        if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
        if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');

        // Heartbeat effect during last 5 seconds
        if (diff <= 5500 && diff > 500) {
            document.querySelectorAll('.timer-box').forEach(box => {
                box.style.transform = 'scale(1.08)';
                box.style.borderColor = '#ff5e8e';
            });
            setTimeout(() => {
                document.querySelectorAll('.timer-box').forEach(box => {
                    box.style.transform = 'scale(1)';
                });
            }, 300);

            if (window.soundEngine) {
                window.soundEngine.playHeartbeat();
            }
        }
    }

    function tick() {
        updateLiveClock();
        updateCountdown();
    }
    countdownInterval = setInterval(tick, 1000);
    tick();

    // =========================================
    // TRANSITION TO CELEBRATION
    // =========================================
    function triggerMidnightCelebration() {
        countdownSection.style.display = 'none';
        celebrationSection.classList.add('active');
        celebrationEngine.triggerCelebrationExplosion();

        if (window.soundEngine) {
            window.soundEngine.playHappyBirthdayMelody(true);
            btnMusic.classList.add('active');
            btnMusic.innerHTML = '<span>🎵</span> Playing Birthday Song';
        }

        showToast("🎉 Happy Birthday Sumaiya Binte Islam! 💖✨");
    }

    // Expose for testing if ever needed via console
    window.triggerMidnightCelebration = triggerMidnightCelebration;

    // =========================================
    // MUSIC TOGGLE
    // =========================================
    btnMusic.addEventListener('click', () => {
        if (!window.soundEngine) return;
        window.soundEngine.init();

        if (window.soundEngine.isPlayingMusic) {
            window.soundEngine.stopMusic();
            btnMusic.classList.remove('active');
            btnMusic.innerHTML = '<span>🔇</span> Music Off';
            showToast("Music paused");
        } else {
            if (celebrationSection.classList.contains('active')) {
                window.soundEngine.playHappyBirthdayMelody(true);
                btnMusic.innerHTML = '<span>🎵</span> Playing Birthday Song';
            } else {
                window.soundEngine.playAmbientMusic(true);
                btnMusic.innerHTML = '<span>🎶</span> Ambient Music';
            }
            btnMusic.classList.add('active');
            showToast("Music playing");
        }
    });

    // =========================================
    // INTERACTIVE BIRTHDAY CAKE & CANDLES
    // =========================================
    const candles = document.querySelectorAll('.candle');
    const btnBlowAll = document.getElementById('btn-blow-all');
    const cakeStatus = document.getElementById('cake-status');

    candles.forEach((candle, idx) => {
        candle.addEventListener('click', () => {
            if (!candle.classList.contains('blown')) {
                extinguishCandle(candle);
                checkAllCandles();
            }
        });
    });

    function extinguishCandle(candle) {
        candle.classList.add('blown');
        if (window.soundEngine) {
            window.soundEngine.playCandleBlow();
        }
    }

    function checkAllCandles() {
        const allBlown = Array.from(candles).every(c => c.classList.contains('blown'));
        if (allBlown) {
            cakeStatus.innerHTML = "✨ Wish Granted! May your entire life be filled with boundless beauty and joy, Sumaiya! 💖✨";
            if (window.soundEngine) {
                window.soundEngine.playChime(659.25);
            }
            showToast("All candles blown out! 🎂 Your wish is sealed with the stars!");
        }
    }

    btnBlowAll.addEventListener('click', () => {
        candles.forEach((candle, idx) => {
            setTimeout(() => {
                extinguishCandle(candle);
                if (idx === candles.length - 1) {
                    checkAllCandles();
                }
            }, idx * 180);
        });
    });

    // =========================================
    // WAX ENVELOPE & LETTER MODAL
    // =========================================
    const envelope = document.getElementById('envelope');
    const letterModal = document.getElementById('letter-modal');
    const btnCloseLetter = document.getElementById('btn-close-letter');
    const btnEditLetter = document.getElementById('btn-edit-letter');
    const letterContent = document.getElementById('letter-content');

    // Default Letter Text with deep affection & beautiful life wishes
    const defaultLetter = `Dearest Sumaiya Binte Islam,

Today is the most special day because it belongs to you. There are things I have always wanted to tell you from the bottom of my heart.

Truth is, I really, really like you—far more than any words could ever express. You have such a pure, gentle soul and a radiant presence that brings calm, warmth, and genuine happiness into my life. Every single time you smile, the whole world seems so much more beautiful.

On your birthday, my deepest prayer is for your life. I pray with all my heart that your entire life becomes as extraordinary, peaceful, and sweet as you are. May Allah bless your journey with boundless joy, good health, serene mornings, and radiant success in everything you strive for. May sadness never touch your heart, and may every silent dream and wish of yours blossom into reality.

Always keep smiling and shining your brightest. You are truly cherished, adored, and deeply special.

Wishing you the happiest, most magical Birthday ever, Sumaiya! 🌸💖✨`;

    // Load saved letter or default
    const savedLetter = localStorage.getItem('sumaiya_birthday_letter');
    if (letterContent) {
        letterContent.textContent = savedLetter || defaultLetter;
    }

    envelope.addEventListener('click', () => {
        envelope.classList.add('opened');
        if (window.soundEngine) {
            window.soundEngine.playChime(523.25);
        }
        setTimeout(() => {
            letterModal.classList.add('active');
        }, 500);
    });

    btnCloseLetter.addEventListener('click', () => {
        letterModal.classList.remove('active');
        setTimeout(() => {
            envelope.classList.remove('opened');
        }, 400);
    });

    letterModal.addEventListener('click', (e) => {
        if (e.target === letterModal) {
            letterModal.classList.remove('active');
            setTimeout(() => {
                envelope.classList.remove('opened');
            }, 400);
        }
    });

    btnEditLetter.addEventListener('click', () => {
        const currentText = letterContent.textContent;
        const newText = prompt("Customize your birthday letter for Sumaiya:", currentText);
        if (newText !== null && newText.trim() !== "") {
            letterContent.textContent = newText;
            localStorage.setItem('sumaiya_birthday_letter', newText);
            showToast("Letter updated successfully! 💌");
        }
    });

    // =========================================
    // FLOATING BALLOONS PLAYGROUND
    // =========================================
    const balloonItems = document.querySelectorAll('.balloon-item');
    const balloonMessage = document.getElementById('balloon-message');

    const wishes = [
        "💖 Sumaiya, I really like you so much—you bring so much light into my life!",
        "🌸 Praying that your whole life is blessed with pure peace, love, and boundless beauty!",
        "✨ Your smile is my absolute favorite thing in this entire universe.",
        "🌟 May Allah shower Sumaiya Binte Islam with endless happiness and health!",
        "💎 You are truly one of a kind—gentle, precious, and irreplaceable.",
        "🎂 Happy Birthday to the most wonderful and sweetest person!"
    ];

    balloonItems.forEach((balloon, index) => {
        balloon.addEventListener('click', () => {
            const sphere = balloon.querySelector('.balloon-sphere');
            if (sphere && !sphere.classList.contains('balloon-pop-burst')) {
                sphere.classList.add('balloon-pop-burst');
                if (window.soundEngine) {
                    window.soundEngine.playBalloonPop();
                }

                // Show compliment
                const wishText = wishes[index % wishes.length];
                balloonMessage.innerHTML = `<span>🎈</span> ${wishText}`;
                balloonMessage.style.display = 'block';

                showToast("Pop! 🎈 A sweet wish was unlocked!");

                // Respawn balloon after 5 seconds
                setTimeout(() => {
                    sphere.classList.remove('balloon-pop-burst');
                }, 5000);
            }
        });
    });

    // =========================================
    // =========================================
    // HEARTFELT TRIBUTE CARDS INTERACTION
    // =========================================
    const tributeCards = document.querySelectorAll('.tribute-card');
    const chimeNotes = [523.25, 587.33, 659.25, 783.99]; // Gentle melodic chimes

    tributeCards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(1.03) translateY(-4px)';
            card.style.borderColor = '#ffd166';
            if (window.soundEngine) {
                window.soundEngine.playChime(chimeNotes[idx % chimeNotes.length]);
            }
            setTimeout(() => {
                card.style.transform = '';
                card.style.borderColor = '';
            }, 400);
        });
    });

    // =========================================
    // TOAST NOTIFICATION UTILITY
    // =========================================
    let toastTimeout = null;
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }
});
