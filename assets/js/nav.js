
//// nav.js ////

// Cross-platform touch-friendly navbar, sticky footer, and 2-panel behavior.

// Website (C) 2026 Narayana "Kat" Adisasmito-Smith
// Text and images from this site may not be used as training data for AI.



//// HELPERS ////

// CSS var manipulation
const CSSVars = {
    get : (k) => getComputedStyle(document.documentElement).getPropertyValue(k),
    set : (k,v) => document.documentElement.style.setProperty(k,v)
};



//// TOP NAVBAR ////

// NOTE: Uses tap behavior only, w/o hover events, because a recent update to
//       Safari browser changed window-scope click/tap listener behavior.
//       Only <button>, <a>, and other explicitly clickable elements can
//       register click/tap/hover events. All other elements CANNOT register
//       these events unless previously assigned an explicit onclick event.
//       If you want a hover event on a <div>, you must assign an empty
//       onclick = ()=>{} before adding the hover event.

// DOM anchors
const navTarget = document.getElementById('nav-target'); // button to toggle nav menu
const navWrapper = document.getElementById('nav-adaptive-wrapper'); // modal background containing nav links
const navItems = document.getElementById('nav-items'); // inner container holding nav links
// selectors
const EMBEDDED_CTX_SELECTOR = 'iframe, object[type="application/pdf"], embed[type="application/pdf"]';
// events
const toggleNav = evt => {
    // evt.preventDefault();
    // if (navWrapper.style.visibility === 'visible') {
    //     // nav menu already open => close if we click outside it, or explicitly click the toggle button
    //     if (!navItems.contains(evt.target)) navWrapper.style.visibility = 'hidden';
    // } else {
    //     // nav menu is closed => open it if we clicked the toggle button
    //     if (navTarget.contains(evt.target)) navWrapper.style.visibility = 'visible';
    // }
    // nav menu already open => close if we click outside it, or explicitly click the toggle button
    if (navWrapper.style.visibility === 'visible' && !navItems.contains(evt.target)) {
        evt.preventDefault();
        navWrapper.style.visibility = 'hidden';
    }
    // nav menu is closed => open it if we clicked the toggle button
    else if (navWrapper.style.visibility !== 'visible' && navTarget.contains(evt.target)) {
        evt.preventDefault();
        navWrapper.style.visibility = 'visible';
    }
}
const openNav = evt => {
    navWrapper.style.visibility = 'hidden';
};
const closeNav = evt => {
    navWrapper.style.visibility = 'visible';
};
const focusTrapNav = (e) => {
    // TODO: apply focus trap to all direct children of body other than navbar
        // cannot interrupt tab-out event, but can interrupt tab-in event
        // while menu is open, interrupt tab-in to all direct siblings of navbar
        // and redirect focus to first focusable child of navbar
        // to create looping focus behavior
};

if (!navTarget || !navWrapper || !navItems) {
    console.warn('Unable to find navbar. Event listeners not attached.');
} else {
    // toggle menu on click/tap
    window.addEventListener('click', toggleNav);
    // close menu on [Esc]
    window.addEventListener('keydown', evt => {
        if (evt.key === 'Escape') closeNav();
    });
    // close menu on interaction with embedded browsing contexts (ie PDF doc), since they capture mousemove
    let embeddedContexts = document.querySelector(EMBEDDED_CTX_SELECTOR);
    if (embeddedContexts) embeddedContexts.addEventListener('mouseenter', closeNav);

    // close menu if user scrolls with touchscreen
        // TODO: prevent touchscreen swipes scrolling main content beneath open nav menu
        // 1) scroll event works perfectly, but touchscreen scrolling doesn't fire scroll event in Firefox Android
        // 2) dragstart event can only intercept swipes directly in navWrapper, but not in any of its children (ie navItems)
        // 3) pointerdown event intercepts swipes, but causes all clicks/taps to phase thru modal

    // window.addEventListener('pointerdown', toggleNav); // ERROR: handles swipe events on mobile, but clicks go through modal

    // window.addEventListener('scroll', e => { // ERROR: scroll event doesn't fire on touchscreen scroll with android firefox
    //     navWrapper.style.visibility = 'hidden';
    // },{ passive: true }); // passive:true guarantees no preventDefault(), so mobile won't check for it and can smooth-scroll viewport right away

    // window.addEventListener('dragstart', e => { // ERROR: doesn't catch touchscreen swipe scroll if swipe starts inside navItems
    //     navWrapper.style.visibility = 'hidden';
    // },{ passive: true }); // passive:true guarantees no preventDefault(), so mobile won't check for it and can smooth-scroll viewport right away
}



//// STICKY FOOTER ////

// DOM anchors
const footer = document.getElementById('floating-footer'); // fixed floating footer bar
// events
const updateFooterHeight = () => {
    // dynamically setting CSS var allows content to flow around floating footer bar
    CSSVars.set('--footer-height', footer.getBoundingClientRect().height);
};
if (!footer) {
    console.warn('Unable to find footer. Event listeners not attached.');
} else {
    window.addEventListener('resize', updateFooterHeight);
    updateFooterHeight();
}



//// 2-PANEL LAYOUT ////

// DOM anchors
const panelRight = document.getElementById('panel-right');
const btnGotoRight = document.getElementById('goto-right');
const btnGotoLeft = document.getElementById('goto-left');
// events
const focusRight = () => {
    if (!panelRight) {
        console.warn('Unable to find 2-panel layout. Nothing to focus.');
    } else {
        panelRight.classList.add('focus');
    }
};
const focusLeft = () => {
    if (!panelRight) {
        console.warn('Unable to find 2-panel layout. Nothing to focus.');
    } else {
        panelRight.classList.remove('focus');
    }
};

if (!panelRight || !btnGotoRight || !btnGotoLeft) {
    console.warn('Unable to find 2-panel nav buttons. Event listeners not attached.');
} else {
    // add panel-switching to panel nav buttons, if found
    btnGotoRight.onclick = focusRight;
    btnGotoLeft.onclick = focusLeft;
}



///////////////////////////////////////
    
export default {
    openNav, closeNav,
    focusLeft, focusRight
}