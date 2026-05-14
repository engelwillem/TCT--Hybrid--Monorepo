// Linkify bible references inside HTML content to VerseHub.
//
// Design goal: simple + safe enough for admin-provided HTML,
// without trying to parse theology-level edge cases.

type MatchInfo = {
    bookRaw: string;
    bookSlug: string;
    chapter: string;
    verseStart: string;
    verseEnd?: string;
    fullMatch: string;
};

// Indonesian/English abbreviations -> canonical VerseHub ID book_code.
// URL format must be /versehub/id/{book_code}-{chapter}-{verse}
const BOOK_TO_SLUG: Record<string, string> = {
    // Ephesians
    ef: 'ef',
    eph: 'ef',
    'ef.': 'ef',
    efs: 'ef',
    efesus: 'ef',

    // Philippians
    flp: 'flp',
    'flp.': 'flp',
    php: 'flp',
    phil: 'flp',
    fil: 'flp',
    'fil.': 'flp',
    filipi: 'flp',

    // Acts
    kis: 'kis',
    'kis.': 'kis',
    acts: 'kis',
    act: 'kis',

    // Corinthians
    '1 kor': '1kor',
    '1 kor.': '1kor',
    '1kor': '1kor',
    '1kor.': '1kor',
    '1cor': '1kor',
    '2 kor': '2kor',
    '2 kor.': '2kor',
    '2kor': '2kor',
    '2kor.': '2kor',
    '2cor': '2kor',

    // Peter
    '1 ptr': '1ptr',
    '1 ptr.': '1ptr',
    '1ptr': '1ptr',
    '1pet': '1ptr',
    '2 ptr': '2ptr',
    '2 ptr.': '2ptr',
    '2ptr': '2ptr',
    '2pet': '2ptr',

    // Colossians
    kol: 'kol',
    'kol.': 'kol',
    col: 'kol',

    // Philemon
    flm: 'flm',
    'flm.': 'flm',
    phm: 'flm',
    phlm: 'flm',
    filemon: 'flm',

    // Psalms
    mzm: 'mzm',
    'mzm.': 'mzm',
    ps: 'mzm',
    'ps.': 'mzm',
    psa: 'mzm',
    'psa.': 'mzm',
};

function normalizeBook(raw: string) {
    return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

function tryParseRef(s: string): MatchInfo | null {
    // Examples we want:
    // Ef. 3:1
    // 2 Kor. 4:7-12
    // Kis. 9:16
    // Flp 4:4
    // Filemon 15

    // Regex notes:
    // - Optional leading number for books like 1 Kor / 2 Kor
    // - Book token may include dots
    // - Optional spaces
    // Support:
    // Ef. 3: 1
    // Flp. 1: 1-3
    // Kis. 9: 16
    // (Optional) remove spaces after ':'
    const r = /\b((?:[1-3]\s*)?[A-Za-zÀ-ÿ]+\.?)(?:\s+([A-Za-zÀ-ÿ]+\.?))?\s*(\d+)\s*(?::\s*(\d+)(?:\s*-\s*(\d+))?)?\b/;
    const m = s.match(r);
    if (!m) return null;

    const part1 = m[1] ?? '';
    const part2 = m[2] ?? '';
    const chapter = m[3];
    const verseStart = m[4];
    const verseEnd = m[5];

    const bookRaw = (part1 + (part2 ? ' ' + part2 : '')).trim();
    const bookNorm = normalizeBook(bookRaw);
    const bookSlug = BOOK_TO_SLUG[bookNorm] ?? BOOK_TO_SLUG[bookNorm.replace(/\.$/, '')];
    if (!bookSlug) return null;

    // If no verse specified, we don't link (too ambiguous).
    if (!verseStart) return null;

    return {
        bookRaw,
        bookSlug,
        chapter,
        verseStart,
        verseEnd,
        fullMatch: m[0],
    };
}

function linkifySingleVerseWithoutColon(input: string) {
    // Handle Filemon 15 / Filemon 15, 16 (no chapter)
    // We map Filemon => phm, chapter assumed 1.
    const r = /\b(Filemon|Flm\.?|PHM)\s+(\d+)(?:\s*,\s*(\d+))?\b/gi;
    return input.replace(r, (match, _book, v1, v2) => {
        const versePart = v2 ? `${v1}-${v2}` : `${v1}`;
        const href = `/versehub/id/flm-1-${versePart}`;
        return `<a href="${href}" data-versehub="1" class="underline underline-offset-4" target="_self">${match}</a>`;
    });
}

function buildVerseHubHref(info: MatchInfo) {
    const versePart = info.verseEnd
        ? `${info.verseStart}-${info.verseEnd}`
        : info.verseStart;
    return `/versehub/id/${info.bookSlug}-${info.chapter}-${versePart}`;
}

// Avoid linking inside existing anchors.
const ANCHOR_TAG = /<a\b[^>]*>[\s\S]*?<\/a>/gi;

export function linkifyBibleRefs(html: string): string {
    if (!html) return html;

    // Temporarily protect anchor tags.
    const anchors: string[] = [];
    const protectedHtml = html.replace(ANCHOR_TAG, (a) => {
        const key = `__TCT_ANCHOR_${anchors.length}__`;
        anchors.push(a);
        return key;
    });

    // Replace bible refs in plain text segments.
    let replaced = protectedHtml.replace(/\b(?:[1-3]\s*)?[A-Za-zÀ-ÿ]+\.?\s*(?:[A-Za-zÀ-ÿ]+\.?\s*)?\d+\s*:\s*\d+(?:\s*-\s*\d+)?\b/g, (match) => {
        const info = tryParseRef(match);
        if (!info) return match;

        const href = buildVerseHubHref(info);
        return `<a href="${href}" data-versehub="1" class="underline underline-offset-4" target="_self">${match}</a>`;
    });

    // Special-case: Filemon without chapter (common Indonesian formatting)
    replaced = linkifySingleVerseWithoutColon(replaced);

    // Restore anchors.
    let out = replaced;
    anchors.forEach((a, i) => {
        out = out.replace(`__TCT_ANCHOR_${i}__`, a);
    });

    return out;
}
