/**
 * =====================================================
 * BIDÈ — Gallery JavaScript
 * =====================================================
 * Fonctionnalités de la galerie :
 * - Filtres par catégorie
 * - Lightbox (zoom photo)
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', function () {

    // ========================
    // FILTRES GALERIE
    // ========================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');

    filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Update active button
            filterButtons.forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(function (item) {
                const category = item.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';

                    setTimeout(function () {
                        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.transition = 'opacity 0.3s ease';
                    item.style.opacity = '0';

                    setTimeout(function () {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ========================
    // LIGHTBOX
    // ========================
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    let visibleImages = [];

    function getVisibleImages() {
        visibleImages = [];
        document.querySelectorAll('.gallery-grid .gallery-item').forEach(function (item) {
            if (item.style.display !== 'none') {
                visibleImages.push(item);
            }
        });
    }

    function openLightbox(index) {
        getVisibleImages();
        currentImageIndex = index;
        const img = visibleImages[currentImageIndex].querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        const img = visibleImages[currentImageIndex].querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    }

    function showNext() {
        currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        const img = visibleImages[currentImageIndex].querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    }

    // Attach click events to gallery items
    galleryItems.forEach(function (item) {
        item.addEventListener('click', function () {
            getVisibleImages();
            const index = visibleImages.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    // Lightbox controls
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrev);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNext);
    }

    // Close on overlay click
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
});
