/**
 * =====================================================
 * BIDÈ — FAQ JavaScript
 * =====================================================
 * Fonctionnalités de la FAQ :
 * - Recherche / filtrage des questions
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', function () {

    // ========================
    // FAQ SEARCH
    // ========================
    const faqSearch = document.querySelector('#faqSearch');
    const accordionItems = document.querySelectorAll('.faq-page .accordion-item');

    if (faqSearch && accordionItems.length > 0) {
        faqSearch.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();

            accordionItems.forEach(function (item) {
                const question = item.querySelector('.accordion-button');
                const answer = item.querySelector('.accordion-body');
                const questionText = question ? question.textContent.toLowerCase() : '';
                const answerText = answer ? answer.textContent.toLowerCase() : '';

                if (query === '' || questionText.includes(query) || answerText.includes(query)) {
                    item.style.display = 'block';
                    item.style.opacity = '0';
                    setTimeout(function () {
                        item.style.transition = 'opacity 0.3s ease';
                        item.style.opacity = '1';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(function () {
                        item.style.display = 'none';
                    }, 300);
                }
            });

            // Show "no results" message
            const visibleItems = document.querySelectorAll('.faq-page .accordion-item[style*="display: block"], .faq-page .accordion-item:not([style*="display: none"])');
            let noResults = document.querySelector('#faqNoResults');

            if (visibleItems.length === 0 && query !== '') {
                if (!noResults) {
                    noResults = document.createElement('div');
                    noResults.id = 'faqNoResults';
                    noResults.className = 'text-center py-5';
                    noResults.innerHTML = '<i class="bi bi-search fs-1 text-muted mb-3"></i>' +
                        '<p class="text-muted">Aucun résultat trouvé pour votre recherche.</p>';
                    document.querySelector('.faq-page .accordion').parentNode.appendChild(noResults);
                }
                noResults.style.display = 'block';
            } else if (noResults) {
                noResults.style.display = 'none';
            }
        });
    }
});
