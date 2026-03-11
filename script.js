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
            submitBtn.innerText = "Отправка...";
            submitBtn.disabled = true;

            const formData = new FormData(form);
            // Append the exact timestamp
            formData.append('timestamp', new Date().toLocaleString("ru-RU"));

            // Send data using Fetch API
            if (googleAppsScriptURL && googleAppsScriptURL !== "ВАШ_URL_ИЗ_GOOGLE_АПП_СКРИПТА") {
                fetch(googleAppsScriptURL, {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        formResponse.innerText = "✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время и вышлем ссылку на оплату (Т-Банк).";
                        formResponse.style.color = "var(--color-primary)";
                        formResponse.style.display = "block";
                        form.reset();
                    })
                    .catch(error => {
                        formResponse.innerText = "❌ Произошла ошибка. Пожалуйста, попробуйте еще раз или напишите нам.";
                        formResponse.style.color = "var(--color-accent)";
                        formResponse.style.display = "block";
                        console.error('Error!', error.message);
                    })
                    .finally(() => {
                        submitBtn.innerText = "Оставить заявку";
                        submitBtn.disabled = false;
                    });
            } else {
                // Mock success if URL is not set yet
                setTimeout(() => {
                    formResponse.innerText = "✅ Заявка отправлена (Демо-режим: URL таблицы еще не подключен). Ссылка на Т-Банк будет отправлена вам позже.";
                    formResponse.style.color = "var(--color-primary)";
                    formResponse.style.display = "block";
                    form.reset();
                    submitBtn.innerText = "Оставить заявку";
                    submitBtn.disabled = false;
                }, 1000);
            }
        });
    }

});
