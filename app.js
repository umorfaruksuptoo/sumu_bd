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
    const btnPreview = document.getElementById('btn-preview');
    const btnMusic = document.getElementById('btn-music');
    const toast = document.getElementById('toast');

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

    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();

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

        btnPreview.innerHTML = '<span>⏪</span> Back to Countdown';
        showToast("🎉 Happy Birthday Sumiya! 💖✨");
    }

    function returnToCountdown() {
        celebrationSection.classList.remove('active');
        countdownSection.style.display = 'flex';
        celebrationEngine.stopCelebration();

        if (window.soundEngine) {
            window.soundEngine.playAmbientMusic(true);
            btnMusic.innerHTML = '<span>🎶</span> Ambient Music';
        }

        btnPreview.innerHTML = '<span>✨</span> Preview Midnight Reveal';
        hasTriggeredCelebration = false;
        showToast("Returned to Countdown mode");
    }

    // Toggle Preview / Test Mode
    btnPreview.addEventListener('click', () => {
        isPreviewMode = !isPreviewMode;
        if (isPreviewMode) {
            triggerMidnightCelebration();
        } else {
            returnToCountdown();
        }
    });

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
            cakeStatus.innerHTML = "✨ Wish Granted! May all your dreams come true, Sumiya! 💖✨";
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

    // Default Letter Text
    const defaultLetter = `Dearest Sumiya,

On this most special day, I wish you endless happiness, boundless joy, and dreams that unfold into breathtaking reality.

You bring such warmth, kindness, and grace to everyone around you. May this new year of your life be filled with sweet laughter, unforgettable memories, peaceful days, and radiant success in everything you strive for.

Always keep smiling and shining your brightest. The world is a much happier place with you in it.

Wishing you the happiest and most magical Birthday ever! 🌸💖✨`;

    // Load saved letter or default
    const savedLetter = localStorage.getItem('sumiya_birthday_letter');
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
        const newText = prompt("Customize your birthday letter for Sumiya:", currentText);
        if (newText !== null && newText.trim() !== "") {
            letterContent.textContent = newText;
            localStorage.setItem('sumiya_birthday_letter', newText);
            showToast("Letter updated successfully! 💌");
        }
    });

    // =========================================
    // FLOATING BALLOONS PLAYGROUND
    // =========================================
    const balloonItems = document.querySelectorAll('.balloon-item');
    const balloonMessage = document.getElementById('balloon-message');

    const wishes = [
        "🌟 Sumiya, your radiant smile brightens up the darkest of days!",
        "💎 You are truly one of a kind—treasured, adored, and deeply appreciated.",
        "🚀 May this upcoming year lift you higher than the brightest stars!",
        "🌸 Wishing you endless laughter, peaceful mornings, and joyful nights.",
        "🍰 May your year ahead be as sweet, warm, and delightful as you are!",
        "✨ Never stop dreaming big, because you are capable of wonders!"
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
    // POLAROID MEMORY WALL (With Photo Upload)
    // =========================================
    const polaroidUploadBtns = document.querySelectorAll('.polaroid-upload-btn');
    const photoFileInput = document.getElementById('photo-file-input');
    let currentUploadCard = null;

    // Load saved custom photos from localStorage
    document.querySelectorAll('.polaroid-card').forEach((card, index) => {
        const savedPhoto = localStorage.getItem(`sumiya_photo_${index}`);
        if (savedPhoto) {
            const img = card.querySelector('.polaroid-img-box img');
            if (img) img.src = savedPhoto;
        }
    });

    polaroidUploadBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentUploadCard = btn.closest('.polaroid-card');
            photoFileInput.click();
        });
    });

    photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentUploadCard) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Data = event.target.result;
                const img = currentUploadCard.querySelector('.polaroid-img-box img');
                if (img) img.src = base64Data;

                const cardIndex = Array.from(document.querySelectorAll('.polaroid-card')).indexOf(currentUploadCard);
                localStorage.setItem(`sumiya_photo_${cardIndex}`, base64Data);

                showToast("Photo added to memory wall! 📸");
                if (window.soundEngine) {
                    window.soundEngine.playChime(600);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // =========================================
    // MYSTERY GIFT BOX
    // =========================================
    const giftBox = document.getElementById('gift-box');
    const giftReward = document.getElementById('gift-reward');

    giftBox.addEventListener('click', () => {
        if (giftReward.style.display !== 'block') {
            giftBox.style.transform = 'scale(1.15) rotate(10deg)';
            setTimeout(() => {
                giftBox.style.transform = 'scale(1)';
                giftReward.style.display = 'block';
                if (window.soundEngine) {
                    window.soundEngine.playChime(784);
                }
                showToast("Gift opened! 🎁 A golden birthday voucher for Sumiya!");
            }, 300);
        }
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
