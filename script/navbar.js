
//// navmenu.js ////

// Cross-platform touch-friendly navbar click behavior.

// Website (C) 2026 Narayana "Kat" Adisasmito-Smith
// Text and images from this site may not be used as training data for AI.



(() => {
    // CSS var manipulation
    const CSSVars = {
        get : (k) => getComputedStyle(document.documentElement).getPropertyValue(k),
        set : (k,v) => document.documentElement.style.setProperty(k,v)
    };

    // DOM anchors
    const navTarget = document.getElementById('nav-target'); // button to toggle nav menu
    const navWrapper = document.getElementById('nav-adaptive-wrapper'); // modal background containing nav links
    const navItems = document.getElementById('nav-items'); // inner container holding nav links
    const footer = document.getElementById('floating-footer'); // fixed floating footer bar
    // selectors
    const EMBEDDED_CTX_SELECTOR = 'iframe, object[type="application/pdf"], embed[type="application/pdf"]';

    // toggle menu on click/tap
    const toggleNav = evt => {
        evt.preventDefault();
        if (navWrapper.style.visibility === 'visible') {
            // nav menu already open => close if we click outside it, or explicitly click the toggle button
            if (!navItems.contains(evt.target)) navWrapper.style.visibility = 'hidden';
        } else {
            // nav menu is closed => open it if we clicked the toggle button
            if (navTarget.contains(evt.target)) navWrapper.style.visibility = 'visible';
        }
    }
    if (!navTarget || !navWrapper || !navItems) {
        console.warn('Unable to find navbar. Event listeners not attached.');
    } else {
        window.addEventListener('click', toggleNav);
        // window.addEventListener('pointerdown', toggleNav); // TODO: handles swipe events on mobile, but clicks go through modal
    }
    // TODO: re-impl hover==tap touchscreen behavior in Safari browser
        // recent safari update messes with window-scope click/tap listeners
        // only <button> and other explicitly clickable elements will register event
        // <div> and other non-clickable elems CANNOT register events unless given explicit onclick

    // // close menu if user scrolls with touchscreen
    // window.addEventListener('scroll', e => { // TODO: scroll event doesn't fire on touchscreen scroll with android firefox
    //     navWrapper.style.visibility = 'hidden';
    // },{ passive: true }); // passive:true guarantees no preventDefault(), so mobile won't check for it and can smooth-scroll viewport right away
    // window.addEventListener('dragstart', e => { // TODO: doesn't catch touchscreen swipe scroll if swipe starts inside navItems
    //     navWrapper.style.visibility = 'hidden';
    // },{ passive: true }); // passive:true guarantees no preventDefault(), so mobile won't check for it and can smooth-scroll viewport right away

    // close menu if user interacts with embedded browsing contexts (ie a PDF doc), since they capture mousemove
    let embeddedContexts = document.querySelector(EMBEDDED_CTX_SELECTOR);
    if (embeddedContexts) embeddedContexts.addEventListener('mouseenter', e => {
        navWrapper.style.visibility = 'hidden';
    });

    // allow content to flow around floating footer bar, if found
    const updateFooterHeight = () => {
        CSSVars.set('--footer-height', footer.getBoundingClientRect().height);
    };
    if (!footer) {
        console.warn('Unable to find footer. Event listeners not attached.');
    } else {
        window.addEventListener('resize', updateFooterHeight);
        updateFooterHeight();
    }

    // add panel-switching to panel nav buttons, if found
    const panelRight = document.getElementById('panel-right');
    const gotoRight = document.getElementById('goto-right');
    const gotoLeft = document.getElementById('goto-left');
    if (!panelRight || !gotoRight || !gotoLeft) {
        console.warn('Unable to find 2-panel nav buttons. Event listeners not attached.');
    } else {
        gotoRight.onclick = () => panelRight.classList.add('focus');
        gotoLeft.onclick = () => panelRight.classList.remove('focus');
    }
})();
