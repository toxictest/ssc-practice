"""Non-AI RSS/Atom headline collector. No article scraping or MCQ generation."""
import concurrent.futures
import datetime as dt
import email.utils
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
from urllib.request import Request, build_opener, HTTPRedirectHandler
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
MAX_BYTES = 2_000_000
MAX_ITEMS = 2000

def now_iso():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')

def host_allowed(host, hosts):
    return bool(host) and any(host == h or host.endswith('.' + h) for h in hosts)

def canonical_url(value, hosts):
    p = urlsplit(value.strip())
    if p.scheme not in ('http', 'https') or p.username or p.password or p.port not in (None, 80, 443):
        raise ValueError('Unsupported source URL')
    if not host_allowed(p.hostname, hosts):
        raise ValueError('Source host is not allowlisted')
    # Explicit source-domain allowlist; no localhost, user-entered URLs or public CORS proxy.
    query = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True)
             if not k.lower().startswith('utm_') and k.lower() not in ('fbclid', 'gclid')]
    return urlunsplit(('https', p.netloc.lower(), p.path or '/', urlencode(query), ''))

class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)

def clean_text(value):
    parser = TextOnly()
    parser.feed(html.unescape(value or ''))
    return re.sub(r'\s+', ' ', ' '.join(parser.parts)).strip()[:500]

def parse_date(value):
    if not value:
        return None
    try:
        date = email.utils.parsedate_to_datetime(value)
    except (TypeError, ValueError):
        try:
            date = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError:
            return None
    # Preserve uncertainty: RBI may publish a timestamp without a zone.
    # It is not relabelled as UTC or silently inferred to be current.
    return date.isoformat() if date.tzinfo else None

def text_of(node, name):
    for child in node:
        if child.tag.split('}')[-1] == name:
            return ''.join(child.itertext()).strip()
    return ''

def parse_feed(data, source, fetched_at):
    if len(data) > MAX_BYTES or re.search(br'<!\s*(?:DOCTYPE|ENTITY)', data.replace(b'\x00', b''), re.I):
        raise ValueError('Oversized XML or prohibited DTD/entity declaration')
    root = ET.fromstring(data)
    if root.tag.split('}')[-1] not in ('rss', 'feed', 'RDF'):
        raise ValueError('Response is not RSS/Atom')
    result = []
    for node in root.iter():
        if node.tag.split('}')[-1] not in ('item', 'entry'):
            continue
        title = clean_text(text_of(node, 'title'))
        link = text_of(node, 'link')
        if not link:
            for child in node:
                if child.tag.split('}')[-1] == 'link' and child.get('rel', 'alternate') == 'alternate':
                    link = child.get('href', '')
                    break
        try:
            url = canonical_url(link, source['allowedHosts'])
        except (ValueError, TypeError):
            continue
        if not title:
            continue
        original_date = text_of(node, 'pubDate') or text_of(node, 'published') or text_of(node, 'updated')
        result.append({
            'id': hashlib.sha256(url.encode()).hexdigest()[:24], 'title': title,
            'url': url, 'sourceId': source['id'], 'sourceName': source['name'],
            'publishedAt': parse_date(original_date), 'sourceDateText': original_date[:120],
            'firstSeenAt': fetched_at, 'lastSeenAt': fetched_at,
        })
        if len(result) >= 150:
            break
    if not result:
        raise ValueError('No valid allowlisted feed items; possible upstream block/change')
    return result

class SafeRedirect(HTTPRedirectHandler):
    def __init__(self, hosts):
        self.hosts = hosts
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return super().redirect_request(req, fp, code, msg, headers, canonical_url(newurl, self.hosts))

def fetch_source(source, timestamp):
    try:
        url = canonical_url(source['url'], source['allowedHosts'])
        req = Request(url, headers={'User-Agent': 'SSCPracticeFeedReader/1.0 (non-AI RSS reader)', 'Accept': 'application/rss+xml, application/atom+xml, text/xml, application/xml'})
        with build_opener(SafeRedirect(source['allowedHosts'])).open(req, timeout=20) as response:
            data = response.read(MAX_BYTES + 1)
        items = parse_feed(data, source, timestamp)
        return items, {'id': source['id'], 'name': source['name'], 'feedUrl': url, 'ok': True, 'checkedAt': timestamp, 'lastSuccessAt': timestamp, 'count': len(items), 'error': None}
    except Exception as exc:
        return [], {'id': source['id'], 'name': source['name'], 'feedUrl': source['url'], 'ok': False, 'checkedAt': timestamp, 'lastSuccessAt': None, 'count': 0, 'error': str(exc)[:250]}

def main():
    sources = json.loads((ROOT / 'content/live-sources.json').read_text())['sources']
    sources = [s for s in sources if s.get('enabled')]
    destination = ROOT / 'public/live/research.json'
    previous = json.loads(destination.read_text()) if destination.exists() else {'items': [], 'sources': []}
    timestamp = now_iso()
    archive = {item['id']: item for item in previous.get('items', [])}
    prev_status = {s['id']: s for s in previous.get('sources', [])}
    statuses = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        for items, status in executor.map(lambda s: fetch_source(s, timestamp), sources):
            if not status['ok']:
                status['lastSuccessAt'] = prev_status.get(status['id'], {}).get('lastSuccessAt')
            statuses.append(status)
            for item in items:
                item['firstSeenAt'] = archive.get(item['id'], item)['firstSeenAt']
                archive[item['id']] = item
    # Re-observed old headlines do not become "new". Original first-seen dates are retained.
    items = sorted(archive.values(), key=lambda i: i['firstSeenAt'], reverse=True)[:MAX_ITEMS]
    snapshot = {'schemaVersion': 1, 'checkedAt': timestamp, 'sources': statuses, 'items': items}
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(destination)
    for s in statuses:
        print(f"{s['name']}: {'OK' if s['ok'] else 'FAILED'} ({s['count']} items) {s['error'] or ''}")
    print(f'Research archive: {len(items)} headlines. No questions auto-generated/approved.')
    # A complete upstream outage is visible in the JSON and logs but does not delete old data or block the app build.
    if not any(s['ok'] for s in statuses):
        print('WARNING: all feeds failed; retained archive is stale.', file=sys.stderr)

if __name__ == '__main__':
    main()
