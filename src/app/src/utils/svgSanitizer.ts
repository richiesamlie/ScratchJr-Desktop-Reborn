const DANGEROUS_ELEMENTS = new Set([
    'script',
    'foreignobject',
    'iframe',
    'object',
    'embed',
    'applet',
    'meta',
    'link',
    'style',
    'animate',
    'animatemotion',
    'animatetransform',
    'set',
    'use',
    'audio',
    'video',
]);

function isSafeSvgHref (value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
        return true;
    }
    const normalized = trimmed.replace(/[\x00-\x20]+/g, '').toLowerCase();
    if (
        normalized.startsWith('javascript:') ||
        normalized.startsWith('vbscript:') ||
        normalized.startsWith('http:') ||
        normalized.startsWith('https:') ||
        normalized.startsWith('file:') ||
        normalized.startsWith('//')
    ) {
        return false;
    }
    return trimmed.startsWith('#') || normalized.startsWith('data:image/');
}

/**
 * Traverses an SVG root element and all descendants in a static snapshot,
 * removing dangerous elements, inline event handler attributes (on*),
 * and unsafe href / xlink:href references.
 */
export function sanitizeSvgElement (root: Element | null | undefined): void {
    if (!root) {
        return;
    }
    const descendants = typeof root.querySelectorAll === 'function'
        ? Array.from(root.querySelectorAll('*'))
        : Array.from(root.getElementsByTagName('*'));
    const elements: Element[] = [root, ...descendants];

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const tagName = (el.localName || el.nodeName || '').toLowerCase();
        if (DANGEROUS_ELEMENTS.has(tagName)) {
            if (el !== root && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            continue;
        }
        if (!el.attributes) {
            continue;
        }
        const attrs = Array.from(el.attributes);
        for (let j = 0; j < attrs.length; j++) {
            const attr = attrs[j];
            const attrName = attr.name.toLowerCase();
            if (attrName.startsWith('on')) {
                el.removeAttribute(attr.name);
                continue;
            }
            if (attrName === 'href' || attrName === 'xlink:href' || attr.localName?.toLowerCase() === 'href') {
                if (!isSafeSvgHref(attr.value || '')) {
                    el.removeAttribute(attr.name);
                    if (typeof el.removeAttributeNS === 'function') {
                        try {
                            el.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
                        } catch (_) {
                            // Ignore namespace removal errors
                        }
                    }
                }
            }
        }
    }
}

function stripDangerousSvgRegex (svgText: string): string {
    return svgText
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<script[^>]*\/>/gi, '')
        .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
        .replace(/<foreignObject[^>]*\/>/gi, '')
        .replace(/<(iframe|object|embed|applet|meta|link|style|animate|animateMotion|animateTransform|set|use|audio|video)\b[\s\S]*?<\/\1>/gi, '')
        .replace(/<(iframe|object|embed|applet|meta|link|style|animate|animateMotion|animateTransform|set|use|audio|video)\b[^>]*\/>/gi, '')
        .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s(?:xlink:)?href\s*=\s*(?:"\s*(?:javascript:|vbscript:|https?:|file:|\/\/)[^"]*"|'\s*(?:javascript:|vbscript:|https?:|file:|\/\/)[^']*')/gi, '');
}

/**
 * Parses an SVG string, sanitizes its DOM tree, and serializes back to XML.
 * Falls back to regex stripping when DOMParser/XMLSerializer are unavailable.
 */
export function sanitizeSvgString (svgText: string): string {
    if (!svgText || typeof svgText !== 'string') {
        return '';
    }
    const preCleaned = stripDangerousSvgRegex(svgText);
    if (typeof DOMParser !== 'undefined' && typeof XMLSerializer !== 'undefined') {
        try {
            const xmlDoc = new DOMParser().parseFromString(preCleaned, 'text/xml');
            if (
                xmlDoc &&
                xmlDoc.documentElement &&
                xmlDoc.getElementsByTagName('parsererror').length === 0
            ) {
                sanitizeSvgElement(xmlDoc.documentElement);
                return new XMLSerializer().serializeToString(xmlDoc.documentElement);
            }
        } catch (_) {
            // Fall through to regex-cleaned string
        }
    }
    return preCleaned;
}
