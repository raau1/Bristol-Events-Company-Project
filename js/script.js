$(function () {

/*  Navbar login state */
const user       = localStorage.getItem('bristolUser');
const isLoggedIn = Boolean(user);
  
if (isLoggedIn) {
	$('#navUserAction')
	.text('MY ITINERARY')
	.attr('href', 'itinerary.html');
	$('#userDropdown').show();

	$('#mobileUserAction')
	.text('My Itinerary')
	.attr('href', 'itinerary.html');
	$('#mobileProfileLink').removeClass('d-none');
	$('#mobileLogout').removeClass('d-none');
}

$('#logoutBtn').on('click', () => {
	localStorage.removeItem('bristolUser');
	location.href = 'index.html';
});

/* Mobile menu toggle */
$('#mobileMenuBtn').on('click', () => {
	$('#mobileMenu').toggleClass('d-none');

	if (isLoggedIn) {
	$('#mobileUserAction')
		.text('My Itinerary')
		.attr('href', 'itinerary.html');
	$('#mobileProfileLink').removeClass('d-none');
	$('#mobileLogout').removeClass('d-none');
	} else {
	$('#mobileUserAction')
		.text('Sign Up / Login')
		.attr('href', 'login.html');
	$('#mobileProfileLink').addClass('d-none');
	$('#mobileLogout').addClass('d-none');
	}
});

/* Mobile log out */

$('#mobileLogout').on('click', () => {
	localStorage.removeItem('bristolUser');
	location.href = 'index.html';
});

/* “login.html” fake-auth */
if (location.pathname.endsWith('login.html')) {
	$('#loginForm').on('submit', e => {
	e.preventDefault();
	const uname = $('#user').val().trim() || 'guest';
	localStorage.setItem('bristolUser', uname);
	location.href = 'index.html';
	});
}

/* “signup.html” fake-auth */
if (location.pathname.endsWith('signup.html')) {
	$('#signupForm').on('submit', e => {
	e.preventDefault();
	const uname = $('#user').val().trim() || 'guest';
	localStorage.setItem('bristolUser', uname);
	location.href = 'index.html';
	});
}

/* Profile Page */
if (location.pathname.endsWith('profile.html')) {

// preload saved data
const stored      = JSON.parse(localStorage.getItem('userProfile') || '{}');
const currentUser = stored.username || user || '';
$('#profileUsername').val(currentUser);
$('#profileEmail')  .val(stored.email    || '');

// avatar-picker preload
const avatarToSelect = stored.avatar || 'default-pfp.png';
$(`#avatarPicker input[value="${avatarToSelect}"]`).prop('checked', true);

// preload “About Me”
const MAX_CHARS = 500;
$('#profileAbout').val(stored.about || '');
$('#aboutCharCount').text(
`${$('#profileAbout').val().length}/${MAX_CHARS}`
);

// enforce cap
$('#profileAbout').on('input', function () {
let txt = this.value;
if (txt.length > MAX_CHARS) {
	txt = txt.slice(0, MAX_CHARS);
	$(this).val(txt);
}
$('#aboutCharCount').text(`${txt.length}/${MAX_CHARS}`);
});

// save handler with final validation
$('#profileForm').on('submit', e => {
e.preventDefault();
const aboutText = $('#profileAbout').val().trim();
if (aboutText.length > MAX_CHARS) {
	alert(
	`“About Me” must be ${MAX_CHARS} characters or less. ` +
	`You have ${aboutText.length}.`
	);
	return;
}
const updated = {
	username: $('#profileUsername').val().trim(),
	email:    $('#profileEmail')   .val().trim(),
	avatar:   $('#avatarPicker input[name="avatar"]:checked').val(),
	about:    aboutText
};
localStorage.setItem('userProfile', JSON.stringify(updated));
localStorage.setItem('bristolUser', updated.username);
alert('Profile saved!');
$('#navUserAction').text('MY ITINERARY');
});
}

/*  Index – Filter Panel */
$('#filterToggle').on('click', () => {
	$('#filterBox').toggleClass('d-none');
	$('#filterArrow').text($('#filterBox').hasClass('d-none') ? '▾' : '▴');
});

$('#clearFilters').on('click', () => {
	// 1) clear the inputs
	$('#filterBox input[type="checkbox"]').prop('checked', false);
	$('#titleFilter,#descFilter').val('');
	// 2) reset to the original 8-card view
	resetPagination();
	});

$('#applyFilters').on('click', () => {
	applyFilters();
	$('#filterBox').addClass('d-none');
	$('#filterArrow').text('▾');
});


/* CARD CLICK in event.html */
$(document).on('click', '.event-card', function () {
	const $c = $(this);
	const data = {
	title: $c.find('.card-header').text(),
	image: $c.find('img').attr('src'),
	alt  : $c.find('img').attr('alt'),
	desc : $c.data('desc') || '',
	tags : ($c.data('tags') || '').toString()
	};
	localStorage.setItem('selectedEvent', JSON.stringify(data));
	location.href = 'event.html';
});


/* EVENT DETAILS PAGE */
if (location.pathname.endsWith('event.html')) {

	const ev = JSON.parse(localStorage.getItem('selectedEvent') || '{}');

	// populate static bits
	$('#eventTitle').text(ev.title || 'Unknown event');
	$('#eventImage').attr({ src: ev.image, alt: ev.alt });
	$('#eventDesc').text(ev.desc || ev.alt || '');

	const tagBadges = (ev.tags || '')
	.split(',')
	.filter(t => t.trim())
	.map(t => `<span class="badge bg-purple me-1">${t.trim()}</span>`)
	.join('');
	$('#eventTags').html(tagBadges || '—');

	// helpers for save/remove
	const KEY = 'savedEvents';
	const getSaved = () => JSON.parse(localStorage.getItem(KEY) || '[]');
	const setSaved = arr => localStorage.setItem(KEY, JSON.stringify(arr));
	const isSaved  = t => getSaved().some(e => e.title === t);

    // SAVE / REMOVE buttons */
	if (!isLoggedIn) {
	$('#saveBtn')
		.removeClass('d-none')
		.text('Save')
		.off('click')
		.on('click', () => location.href = 'login.html');
	$('#removeBtn').addClass('d-none');
	} else {
	const savedNow = isSaved(ev.title);
	$('#saveBtn').toggleClass('d-none',  savedNow).text('Save');
	$('#removeBtn').toggleClass('d-none', !savedNow);

	$('#saveBtn').off('click').on('click', () => {
		if (!isSaved(ev.title)) setSaved([...getSaved(), ev]);
		$('#saveBtn').addClass('d-none');
		$('#removeBtn').removeClass('d-none');
		alert('Event saved!');
	});

	$('#removeBtn').off('click').on('click', () => {
		setSaved(getSaved().filter(e => e.title !== ev.title));
		$('#removeBtn').addClass('d-none');
		$('#saveBtn').removeClass('d-none');
		alert('Event removed.');
	});
	}

	// similar events (same first tag) w/ 8-at-a-time + Load more
	const master    = JSON.parse(localStorage.getItem('allCardData') || '[]');
	const firstTag  = (ev.tags || '').split(',')[0]?.trim();

	// full filtered list
	const similarAll = master.filter(
	e => e.title !== ev.title && e.tags.includes(firstTag)
	);

	const CHUNK = 8;
	let shown = 0;
	const $similarRow = $('#similarEvents');

	// render the next CHUNK
	function renderSimilar() {
	// take next CHUNK
	const slice = similarAll.slice(shown, shown + CHUNK);
	// if first batch, clear out any old cards
	if (shown === 0) $similarRow.empty();
	// append cards
	$similarRow.append(slice.map(cardMarkup).join(''));
	shown += slice.length;
	// hide button when shown everything
	$('#similarLoadMoreBtn').toggle(similarAll.length > shown);
	}

	// initial render
	renderSimilar();

	// only insert a Load-more button if there's more to show
	if (similarAll.length > CHUNK) {
	const $btn = $(
		'<div class="text-center my-4">'+
		'<button id="similarLoadMoreBtn" class="btn btn-purple">'+
			'Load more similar events'+
		'</button>'+
		'</div>'
	);
	// insert after the similar events row
	$btn.insertAfter('#similarEvents');
	// wire up click to render next batch
	$('#similarLoadMoreBtn').on('click', renderSimilar);
	}

	$('#similarToggle').on('click', () => {
	$('#similarBox').toggleClass('d-none');
	$('#similarArrow').text($('#similarBox').hasClass('d-none') ? '▾' : '▴');
	});

	/* SHARE OVERLAY */
	$('#shareBtn').on('click', e => {
		e.stopPropagation();
		$('#shareBackdrop').removeClass('d-none');
	});

	$('#shareClose, #shareBackdrop').on('click', function (e) {
		if (this.id === 'shareBackdrop' && e.target !== this) return;
		$('#shareBackdrop').addClass('d-none');
	});

	$('#shareX').on('click', () => 
		openShare(`https://twitter.com/intent/tweet?url=${encLoc()}&text=${encTxt()}`));
	
	$('#shareFb').on('click', () =>
		openShare(`https://www.facebook.com/sharer/sharer.php?u=${encLoc()}&quote=${encTxt()}`));
	
	$('#shareCopy').on('click', async function () {
	try {
		await navigator.clipboard.writeText(location.href);
		flashBtn(this, 'Copied!');
	} catch {
		alert('Copy failed – copy from the address‑bar instead.');
	}
	});

	function encLoc () { return encodeURIComponent(location.href); }
	function encTxt () { return encodeURIComponent(`Check out this event: ${ev.title}`); }
	function openShare (u) { window.open(u, '_blank', 'noopener'); }

	function flashBtn (btn, txt) {
		const $b = $(btn), orig = $b.text();
		$b.text(txt).prop('disabled', true);
		setTimeout(() => $b.text(orig).prop('disabled', false), 2000);
	}
}


/* ITINERARY PAGE */
if (location.pathname.endsWith('itinerary.html')) {

	if (!isLoggedIn) { location.href = 'login.html'; return; }

	// cards per load
	const CHUNK = 8;
	const savedAll = JSON.parse(localStorage.getItem('savedEvents') || '[]');
	const allCards = JSON.parse(localStorage.getItem('allCardData') || '[]');

	// build recommendation list from tag overlap
	const tagPool = new Set(savedAll.flatMap(e => e.tags.split(',').map(t => t.trim())));
	const recList = allCards.filter(
	e => !savedAll.some(s => s.title === e.title) &&
			e.tags.split(',').some(t => tagPool.has(t.trim()))
	);

	// section state objects
	const savedSec = makeSection(savedAll , '#savedBox', '#savedEventsRow', '#loadMoreSaved');
	const recSec   = makeSection(recList , '#recBox'  , '#recEventsRow' , '#loadMoreRec');

	renderFirst(savedSec); renderFirst(recSec);

	$('#savedToggle').on('click', () => toggleBar(savedSec, '#savedArrow'));
	$('#recToggle'  ).on('click', () => toggleBar(recSec  , '#recArrow'));

	savedSec.$btn.on('click', () => loadMore(savedSec));
	recSec  .$btn.on('click', () => loadMore(recSec));

	// helpers
	function makeSection (items, boxSel, rowSel, btnSel) {
	return { items, shown: 0,
				$box: $(boxSel), $row: $(rowSel), $btn: $(btnSel) };
	}

	function renderFirst (s) {
	if (!s.items.length) {
		s.$row.html('<p class="text-muted">Nothing here yet.</p>');
		return;
	}
		const slice = s.items.slice(0, CHUNK);
		s.$row.html(slice.map(cardMarkup).join(''));
		s.shown = slice.length;
		s.$btn.toggleClass('d-none', s.shown >= s.items.length);
	}

	function loadMore (s) {
		const slice = s.items.slice(s.shown, s.shown + CHUNK);
		s.$row.append(slice.map(cardMarkup).join(''));
		s.shown += slice.length;
		s.$btn.toggleClass('d-none', s.shown >= s.items.length);
	}

	function toggleBar (s, arrowSel) {
		s.$box.toggleClass('d-none');
		$(arrowSel).text(s.$box.hasClass('d-none') ? '▾' : '▴');
	}
}


/* INDEX HELPERS + LOAD MORE */
function applyFilters() {
	// Clear any old “no results” message
	$('#noResultsMessage').remove();

	// collect filter inputs
	const selTags = $('#filterBox input[type="checkbox"]:checked')
		.map((_, cb) => cb.id.toLowerCase()).get();
	const tSearch = $('#titleFilter').val().trim().toLowerCase();
	const dSearch = $('#descFilter').val().trim().toLowerCase();

	const CHUNK = 8;
	const $cols  = $('.event-card').closest('.col-md-3');

	// perform filtering
	$cols.each((_, col) => {
	const $c   = $(col).find('.event-card');
	const tags = ($c.data('tags')  || '').toLowerCase();
	const head = $c.find('.card-header').text().toLowerCase();
	const desc = ($c.data('desc') || '').toLowerCase();

	const tagPass   = !selTags.length || selTags.some(t => tags.includes(t));
	const titlePass = !tSearch    || head.includes(tSearch);
	const descPass  = !dSearch    || desc.includes(dSearch);

	$(col).toggle(tagPass && titlePass && descPass);
	});

	// grab only the cards still visible
	const $filtered = $cols.filter(':visible');

	// NO-RESULTS
	if ($filtered.length === 0) {
		// hide all cards
		$cols.hide();
		// show message
		$('#eventContainer').append(`
			<div id="noResultsMessage" class="col-12">
			<p class="text-center text-muted my-5">
				No events match your filters.
			</p>
			</div>
		`);
		// hide load-more button
		$('#loadMoreBtn').hide();
		return;
	}

	// normal chunked pagination
	$filtered.hide()
			.slice(0, CHUNK)
			.show();

	// wire up Load-more button
	$('#loadMoreBtn')
	.off('click')
	.toggle($filtered.length > CHUNK)
	.on('click', function () {
		$filtered.filter(':hidden')
				.slice(0, CHUNK)
				.fadeIn();
		if ($filtered.filter(':hidden').length === 0) {
		$(this).hide();
		}
	});
}

function resetPagination() {
	// clear any no results message
	$('#noResultsMessage').remove();

	const CHUNK = 8;
	const $cols  = $('.event-card').closest('.col-md-3');
	$cols.hide();
	$cols.slice(0, CHUNK).show();
	$('#loadMoreBtn').toggle($cols.filter(':hidden').length > 0);
}

if (location.pathname.endsWith('index.html') || location.pathname === '/') {

	const CHUNK = 8;
	const $cols = $('.event-card').closest('.col-md-3');
	$cols.slice(CHUNK).hide();

	$('<div class="text-center my-4">' +
	'<button id="loadMoreBtn" class="btn btn-purple">Load more events</button>' +
	'</div>').insertAfter('#eventContainer');

	$('#loadMoreBtn').on('click', function () {
		const hidden = $cols.filter(':hidden').slice(0, CHUNK).fadeIn();
		if ($cols.filter(':hidden').length === 0) $(this).hide();
	});

	// cache full dataset for other pages
	const dataset = $('.event-card').map(function () {
		const $c = $(this);
		return {
			title: $c.find('.card-header').text(),
			image: $c.find('img').attr('src'),
			alt  : $c.find('img').attr('alt'),
			desc : $c.data('desc') || '',
			tags : ($c.data('tags') || '').toString()
		};
	}).get();
	localStorage.setItem('allCardData', JSON.stringify(dataset));

}

/* bootstrap-card column */
function cardMarkup (e) {
	return `<div class="col-md-3">
	<div class="card event-card h-100 text-center"
			data-tags="${e.tags}" data-desc="${e.desc}">
		<div class="card-header">${e.title}</div>
		<img src="${e.image}" class="card-img-top" alt="${e.alt}">
	</div>
	</div>`;
}


});
