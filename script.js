document.addEventListener('DOMContentLoaded', () => {
    // Basic smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // FAQ Accordion Logic
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion-content').style.maxHeight = null;
            });

            // If it wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.accordion-content');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Countdown and Dynamic Pricing Logic
    const deadlineStr = "2026-03-26T00:00:00+03:00"; // March 26 at 00:00 MSK (deadline)
    const deadline = new Date(deadlineStr).getTime();

    // Elements to update
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');
    const heroPriceBtn = document.getElementById('hero-price');

    // We also need to update the price text lower down in block 7
    // Let's grab the subtitle in block 7 to change the text conditionally
    const formSubtitle = document.querySelector('#register .hero-subtitle');

    function updateTimer() {
        const now = new Date().getTime();
        const distance = deadline - now;

        if (distance < 0) {
            // Deadline passed: Change Prices
            clearInterval(timerInterval);

            // Hide the countdown block completely
            const urgencyBox = document.querySelector('.urgency-tag');
            if (urgencyBox) urgencyBox.style.display = 'none';

            // Change Hero Button Price
            if (heroPriceBtn) {
                heroPriceBtn.innerText = "Занять место за 6 000 ₽";
            }
            // Update form instructions
            if (formSubtitle) {
                formSubtitle.innerText = "Стоимость участия: 6 000 ₽. Оставьте контакты, чтобы получить ссылку на оплату и схему проезда.";
            }
            return;
        }

        // Calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result
        if (daysEl) daysEl.innerText = days < 10 ? "0" + days : days;
        if (hoursEl) hoursEl.innerText = hours < 10 ? "0" + hours : hours;
        if (minsEl) minsEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        if (secsEl) secsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
    }

    // Run first time, then interval
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    // Form Submission Logic (Google Sheets Preparation)
    const form = document.getElementById('registration-form');
    const formResponse = document.getElementById('form-response');
    const submitBtn = document.getElementById('submit-btn');

    // PLACEHOLDER: The user will need to paste their Google Apps Script Web App URL here.
    const googleAppsScriptURL = "https://script.google.com/macros/s/AKfycbxeylE9jpeX4c-tpTpIuN2Hh2VLW85jOIZGn8AI9xAMa6CbwRr198hC123d5AKtvoVa/exec";

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // UI Update during submission
            submitBtn.innerText = "Формируем счет...";
            submitBtn.disabled = true;

            const formData = new FormData(form);
            formData.append('timestamp', new Date().toLocaleString("ru-RU"));

            // 1. Send data precisely to Google Sheets (Silent mode)
            if (googleAppsScriptURL && googleAppsScriptURL !== "ВАШ_URL_ИЗ_GOOGLE_АПП_СКРИПТА") {
                fetch(googleAppsScriptURL, {
                    method: 'POST',
                    body: formData
                }).catch(err => console.error('Error logging to Google Sheets:', err));
            }

            // 1a. Send event to VK Ads (Pixel tracking)
            if (typeof _tmr !== 'undefined') {
                _tmr.push({ type: 'reachGoal', id: 3750161, goal: 'booking' });
            }

            // 2. Trigger T-Bank Payment Widget
            
            // Calculate current price based on deadline
            const now = new Date().getTime();
            const currentPrice = (now > deadline) ? 6000 : 5000;
            
            // Get user inputs
            const userName = document.getElementById('form-name').value;
            const userPhone = document.getElementById('form-phone').value;

            // Prepare exactly the format T-Bank script expects
            // We create a temporary HTML form in memory strictly for the T-Bank script to read
            const tbankForm = document.createElement('form');
            
            // Required T-Bank fields
            tbankForm.innerHTML = `
                <input type="hidden" name="terminalkey" value="1773258249881">
                <input type="hidden" name="frame" value="false">
                <input type="hidden" name="language" value="ru">
                <input type="hidden" name="receipt" value="">
                
                <!-- Redirect URLs after payment -->
                <input type="hidden" name="successAddUrl" value="https://axel7257.github.io/?payment=success">
                <input type="hidden" name="failAddUrl" value="https://axel7257.github.io/?payment=fail">
                
                <!-- Order specifics -->
                <input type="hidden" name="amount" value="${currentPrice}">
                <input type="hidden" name="order" value="SEM_PRIHODKO_${Date.now()}">
                <input type="hidden" name="description" value="Участие в очном семинаре О.Г. Приходько (3 апреля 2026)">
                
                <!-- Customer info -->
                <input type="hidden" name="name" value="${userName}">
                <input type="hidden" name="phone" value="${userPhone}">
            `;

            // Reset UI and Open Widget
            setTimeout(() => {
                submitBtn.innerText = "Оставить заявку";
                submitBtn.disabled = false;
                
                // Call the T-Bank proprietary function loaded from tinkoff_v2.js
                if (typeof pay === 'function') {
                    pay(tbankForm);
                } else {
                    formResponse.innerText = "❌ Ошибка загрузки платежного шлюза. Попробуйте обновить страницу.";
                    formResponse.style.color = "var(--color-accent)";
                    formResponse.style.display = "block";
                }
            }, 500);
        });
    }

});
