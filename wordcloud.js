function createWordCloud() {
return "<canvas class='wordcloud' width='1178' height='650' style='width: 1178px; height: 650px;'></canvas>"
}

function createWordcloudControls(t) {
	recurse(t,function(x) {x.attr( "style", "" );x.attr("class","");})
	$(t).addClass("player wordcloud")
	$(t).prepend("<thead></thead>")
	$(t).find("tbody tr:eq(0)").prependTo($(t).find("thead"))
	$(t).find("thead tr td:eq(0)").addClass("playername")
	$(t).find("tbody tr").removeClass().wrap('<tbody></tbody>')
	$(t).find("tbody>tbody").appendTo($(t))
	$(t).find("tbody:eq(0)").remove()
	$(t).find("tbody").removeClass().addClass("loaded")
}

function initialiseWordCloud() {
  canvas = $("canvas.wordcloud")[0];
  ctx = canvas.getContext('2d');
  stage = $(".scont")[0]
  wc_resize()
  addMany({ Root: 500 });
  wc_frame()
}


const palette = ["#60a5fa", "#a78bfa", "#34d399", "#f87171", "#fbbf24", "#22d3ee", "#fb7185"];
const words = [];
//const $ = s => document.querySelector(s);

//const canvas = $("#canvas");
//const stage = $("#stage");
//const ctx = canvas.getContext('2d');
//const input = $("#input");
//const unique = $("#unique");

let width = 1;
let height = 1;
//let dpr = 1;

const norm = w => w.trim().toLocaleLowerCase();
const display = w => w.trim().replace(/\s+/g, " ");

function hash(t) {
	let h = 2166136261;
	for (let i = 0; i < t.length; i++) {
		h = Math.imul(h ^ t.charCodeAt(i), 16777619);
	}
	return h >>> 0;
}

function fontSize(n) {
	return Math.min(160, 9 + 16 * Math.pow(n, .62));
}

function makeWord(text, count = 1) {
	const seed = hash(norm(text));
	const side = seed % 4;
	const w = 110;
	let x, y;

	if (side === 0) {
		x = -w;
		y = seed % height;
	} else if (side === 1) {
		x = width;
		y = seed % height;
	} else if (side === 2) {
		x = seed % width;
		y = -w;
	} else {
		x = seed % width;
		y = height + w;
	}

	return {
		key: norm(text),
		text: display(text),
		count,
		x,
		y,
		vx: 0,
		vy: 0,
		age: 0,
		colour: palette[seed % palette.length],
		pulse: 1.22
	};
}

function sync() {
	//unique.textContent = words.length;
}

function add(raw, amount = 1) {
	const text = display(typeof raw === "string" ? raw : "");
	if (!text) return;

	const n = Math.max(1, Math.floor(Number(amount) || 1));
	const w = words.find(v => v.key === norm(text));

	if (w) {
		w.count += n;
		w.pulse = 1.32;
	} else {
		words.push(makeWord(text, n));
		sync();
	}
}

/* function remove(raw, amount = 1) {
	const key = norm(typeof raw === "string" ? raw : "");
	const i = words.findIndex(w => w.key === key);
	if (i === -1) return false;

	const n = Math.max(1, Math.floor(Number(amount) || 1));
	if (words[i].count > n) {
		words[i].count -= n;
		words[i].pulse = 1.12; // Adjusted structural variable mismatch from source snippet
	} else {
		words.splice(i, 1);
		sync();
	}
	return true;
} */

/* function removeAll(raw) {
	const key = norm(typeof raw === "string" ? raw : "");
	for (let i = words.length - 1; i >= 0; i--) {
		if (words[i].key === key) words.splice(i, 1);
	}
	sync();
} */

/* function reset() {
	words.length = 0;
	sync();
} */

function addMany(items) {
	if (Array.isArray(items)) {
		items.forEach(i => typeof i === "string" ? add(i) : add(i.word, i.count));
	} else {
		Object.entries(items || {}).forEach(([w, c]) => add(w, c));
	}
}

//window.wordcloud = {
//	add,
//	addMany,
//	remove,
//	removeAll,
//	reset,
//	getwords: () => words.map(({ text, count }) => ({ word: text, count }))
//};

function wc_resize() {
	const r = stage.getBoundingClientRect();
	width = Math.max(320, r.width);
	height = Math.max(400, r.height);
	dpr = Math.min(window.devicePixelRatio || 1, 2);

	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

//new ResizeObserver(resize).observe(stage);
//resize();

function bounds(w) {
	const size = fontSize(w.count) * w.pulse;
	ctx.font = `700 ${size}px system-ui`;
	const textMetrics = ctx.measureText(w.text);
	return {
		width: textMetrics.width,
		height: size * 1.08,
		size
	};
}

function resolve() {
	for (let pass = 0; pass < 30; pass++) {
		let hit = false;
		for (let i = 0; i < words.length; i++) {
			for (let j = i + 1; j < words.length; j++) {
				const a = words[i];
				const b = words[j];
				const bA = bounds(a);
				const bB = bounds(b);
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const ox = (bA.width + bB.width) / 2 + 10 - Math.abs(dx);
				const oy = (bA.height + bB.height) / 2 + 10 - Math.abs(dy);
				if (ox > 0 && oy > 0) {
					hit = true;
					if (ox < oy) {
						const dir = dx > 0 ? 1 : -1;
						const m = ox / 2 + .1;
						a.x += dir * m;
						b.x -= dir * m;
						a.vx *= .2;
						b.vx *= .2;
					} else {
						const dir = dy > 0 ? 1 : -1;
						const m = oy / 2 + .1;
						a.y += dir * m;
						b.y -= dir * m;
						a.vy *= .2;
						b.vy *= .2;
					}
				}
			}
		}
		if (!hit) break;
	}
}

function wc_frame() {
	ctx.clearRect(0, 0, width, height);
	const cx = width / 2;
	const cy = height / 2;
	for (const w of words) {
		w.age++;
		w.pulse = 1 + (w.pulse - 1) * .09;
		const dx = cx - w.x;
		const dy = cy - w.y;
		const d = Math.hypot(dx, dy) || 1;
		const a = Math.min(.60, d * .00150);
		w.vx += (dx / d) * a;
		w.vy += (dy / d) * a;
		const speed = Math.hypot(w.vx, w.vy);
		const damping = speed < .4 ? .35 : .70;
		w.vx *= damping;
		w.vy *= damping;
		if (Math.hypot(w.vx, w.vy) < .025) {
			w.vx = 0;
			w.vy = 0;
		}
		w.x += w.vx;
		w.y += w.vy;
	}
	resolve();
	for (const w of words) {
		const b = bounds(w);
		const hw = Math.min(b.width / 2 + 6, width / 2 - 2);
		const hh = Math.min(b.height / 2 + 6, height / 2 - 2);
		w.x = Math.max(hw, Math.min(width - hw, w.x));
		w.y = Math.max(hh, Math.min(height - hh, w.y));
	}
	resolve();
	for (const w of words) {
		const b = bounds(w);
		ctx.save();
		ctx.translate(w.x, w.y);
		console.log("wc_frame "+w.x+" "+w.y)
		ctx.globalAlpha = Math.min(1, w.age / 22);
		ctx.font = `700 ${b.size}px system-ui`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.shadowColor = w.colour + '55';
		ctx.shadowBlur = 10;
		ctx.fillStyle = w.colour;
		ctx.fillText(w.text, 0, 0);
		ctx.restore();
	}
	requestAnimationFrame(wc_frame);
}

/* function parse(fn) {
	input.value.split(',').map(s => s.trim()).filter(Boolean).forEach(fn);
	input.value = '';
} */

// $('#form').onsubmit = e => {
// e.preventDefault();
// parse(add);
// };
// $('#remove').onclick = () => parse(remove);
// $('#reset').onclick = reset;
// addMany({ Root: 500 });
// frame();