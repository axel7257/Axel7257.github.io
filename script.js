document.addEventListener('DOMContentLoaded', function() {
    // 1. FORM SUBMISSION (PRIORITY)
    var form = document.getElementById('registration-form');
    var submitBtn = document.getElementById('submit-btn');
    var formResponse = document.getElementById('form-response');
    var googleAppsScriptURL = "https://script.google.com/macros/s/AKfycbxeylE9jpeX4c-tpTpIuN2Hh2VLW85jOIZGn8AI9xAMa6CbwRr198hC123d5AKtvoVa/exec";

    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // UI Update
            submitBtn.innerText = "Формируем счет...";
            submitBtn.disabled = true;

            var formData = new FormData(form);
            formData.append('timestamp', new Date().toLocaleString("ru-RU"));

            // UTM Capture (Protected)
            try {
                var urlParams = new URLSearchParams(window.location.search);
                var utmParams = ['utm_source', 'utm_medium', 'utm_campaign'];
                for (var i = 0; i < utmParams.length; i++) {
                    var p = utmParams[i];
                    if (urlParams.has(p)) formData.append(p, urlParams.get(p));
                }
            } catch (e) {}

            // Google Sheets (Silent)
            if (googleAppsScriptURL) {
                fetch(googleAppsScriptURL, { method: 'POST', body: formData })
                    .catch(function(err) { console.error(err); });
            }

            // VK Tracking (Protected)
            try {
                if (typeof _tmr !== 'undefined') {
                    _tmr.push({ type: 'reachGoal', id: 3750161, goal: 'booking' });
                }
            } catch (e) {}

            // Payment Logic
            setTimeout(function() {
                try {
                    var deadline = new Date("2026-03-26T00:00:00+03:00").getTime();
                    var now = new Date().getTime();
                    var price = (now > deadline) ? 6000 : 5000;
                    
                    var nameInput = document.getElementById('form-name');
                    var phoneInput = document.getElementById('form-phone');
                    var uName = nameInput ? nameInput.value : "Участник";
                    var uPhone = phoneInput ? phoneInput.value : "";

                    var tbankForm = document.createElement('form');
                    tbankForm.innerHTML = 
                        '<input type="hidden" name="terminalkey" value="1773258249881">' +
                        '<input type="hidden" name="frame" value="false">' +
                        '<input type="hidden" name="language" value="ru">' +
                        '<input type="hidden" name="amount" value="' + price + '">' +
                        '<input type="hidden" name="order" value="SEM_' + Date.now() + '">' +
                        '<input type="hidden" name="description" value="Семинар О.Г. Приходько">' +
                        '<input type="hidden" name="name" value="' + uName + '">' +
                        '<input type="hidden" name="phone" value="' + uPhone + '">' +
                        '<input type="hidden" name="successAddUrl" value="https://axel7257.github.io/?payment=success">' +
                        '<input type="hidden" name="failAddUrl" value="https://axel7257.github.io/?payment=fail">';

                    if (typeof pay === 'function') {
                        pay(tbankForm);
                    } else {
                        throw new Error("Pay function missing");
                    }
                } catch (err) {
                    submitBtn.innerText = "Оставить заявку";
                    submitBtn.disabled = false;
                    if (formResponse) {
                        formResponse.innerText = "❌ Ошибка: " + err.message;
                        formResponse.style.display = "block";
                        formResponse.style.color = "red";
                    }
                }
            }, 600);
        });
    }

    // 2. FAQ & UI (Secondary)
    try {
        var accordionItems = document.querySelectorAll('.accordion-item');
        accordionItems.forEach(function(item) {
            var header = item.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', function() {
                    var isActive = item.classList.contains('active');
                    accordionItems.forEach(function(el) {
                        el.classList.remove('active');
                        var content = el.querySelector('.accordion-content');
                        if (content) content.style.maxHeight = null;
                    });
                    if (!isActive) {
                        item.classList.add('active');
                        var content = item.querySelector('.accordion-content');
                        if (content) content.style.maxHeight = content.scrollHeight + "px";
                    }
                });
            }
        });
    } catch (e) {}

    // 3. TIMER (Secondary)
    try {
        var deadline = new Date("2026-03-26T00:00:00+03:00").getTime();
        var daysEl = document.getElementById('days');
        var hoursEl = document.getElementById('hours');
        var minsEl = document.getElementById('minutes');
        var secsEl = document.getElementById('seconds');
        
        var timerInterval = setInterval(function() {
            var now = new Date().getTime();
            var dist = deadline - now;
            if (dist < 0) {
                clearInterval(timerInterval);
                return;
            }
            if (daysEl) daysEl.innerText = Math.floor(dist / 86400000);
            if (hoursEl) hoursEl.innerText = Math.floor((dist % 86400000) / 3600000);
            if (minsEl) minsEl.innerText = Math.floor((dist % 3600000) / 60000);
            if (secsEl) secsEl.innerText = Math.floor((dist % 60000) / 1000);
        }, 1000);
    } catch (e) {}

    // 4. SMOOTH SCROLL
    try {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    } catch (e) {}
});
