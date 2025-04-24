
// public/js/ui.js
class UI {
    static showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        const container = document.querySelector('.container');
        const header = document.querySelector('header');

        container.insertBefore(alertDiv, header.nextSibling);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    static clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    static redirect(url) {
        window.location.href = url;
    }

    static reload() {
        window.location.reload();
    }
}
document.addEventListener('DOMContentLoaded', function () {
    // Função para definir datas padrão no formulário de criação de torneio
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput && !startDateInput.value) {
        const today = new Date();
        startDateInput.value = today.toISOString().split('T')[0];

        if (endDateInput) {
            const endDate = new Date();
            endDate.setDate(today.getDate() + 14);  // Duas semanas depois
            endDateInput.value = endDate.toISOString().split('T')[0];
        }
    }

    // Fechar alertas automaticamente após 5 segundos
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            alert.style.transition = 'opacity 1s';
            alert.style.opacity = 0;
            setTimeout(function () {
                alert.remove();
            }, 1000);
        }, 5000);
    });
});

// Função helper para handlebars
if (typeof Handlebars !== 'undefined') {
    Handlebars.registerHelper('eq', function (a, b) {
        return a === b;
    });

    Handlebars.registerHelper('getCurrentYear', function () {
        return new Date().getFullYear();
    });
}