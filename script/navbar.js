
//// navmenu.js ////

// Cross-platform touch-friendly implementation of dropdown hover menu.

// Website (C) 2025 Narayana "Kat" Adisasmito-Smith
// Text and images from this site may not be used as training data for AI.



(() => {
    // DOM anchors
    const navMenu = document.getElementById('nav-menu');
    const navTarget = document.getElementById('nav-target');
    const navDropdown = document.getElementById('nav-dropdown');
    // selectors
    const EMBEDDED_CTX_SELECTOR = 'iframe, object[type="application/pdf"], embed[type="application/pdf"]';

    // // touchstart fires before mousemove, so block next mousemove if interaction already handled
    // let navDropdownBlockDoubleFire = false;

    // // cross-platform hover/tap dropdown
    // window.addEventListener('mousemove', e => {
    //     if (navDropdownBlockDoubleFire) {
    //         navDropdownBlockDoubleFire = false;
    //         return;
    //     }
    //     if (navMenu.contains(e.target)) {
    //         navDropdown.style.visibility = 'visible';
    //     } else {
    //         navDropdown.style.visibility = 'hidden';
    //     }
    // });
    // // allow touch devices to tap the menu icon to close the dropdown
    // navTarget.addEventListener('touchstart', e => {
    //     if (navDropdown.style.visibility === 'visible') {
    //         navDropdown.style.visibility = 'hidden';
    //         navDropdownBlockDoubleFire = true;
    //     }
    // });

    // toggle menu on click/tap
    const toggleNav = evt => {
        if (navDropdown.style.visibility === 'visible') {
            // nav menu already open => close if we click outside it, or explicitly click the toggle button
            if (!navDropdown.contains(evt.target)) navDropdown.style.visibility = 'hidden';
        } else {
            // nav menu is closed => open it if we clicked the toggle button
            if (navMenu.contains(evt.target)) navDropdown.style.visibility = 'visible';
        }
    }
    window.addEventListener('click', toggleNav);

    // close dropdown if user interacts with embedded browsing contexts, since they capture mousemove
    let embeddedContexts = document.querySelector(EMBEDDED_CTX_SELECTOR);
    if (embeddedContexts) embeddedContexts.addEventListener('mouseenter', e => {
        navDropdown.style.visibility = 'hidden';
    });
})();
