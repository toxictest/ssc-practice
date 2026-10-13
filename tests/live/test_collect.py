import importlib.util
from pathlib import Path
import unittest

path = Path(__file__).resolve().parents[2] / 'scripts/live/collect.py'
spec = importlib.util.spec_from_file_location('collector', path)
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)
SOURCE = {'id': 'pib', 'name': 'PIB', 'allowedHosts': ['pib.gov.in']}
STAMP = '2026-10-13T10:00:00Z'

class FeedTests(unittest.TestCase):
    def test_rss_normalizes_links_deduplicable_ids_and_html(self):
        data = b'<rss><channel><item><title><![CDATA[<b>A &amp; B</b>]]></title><link>https://pib.gov.in/a?utm_source=rss&amp;id=1</link><pubDate>Tue, 13 Oct 2026 10:00:00 +0530</pubDate></item></channel></rss>'
        item = c.parse_feed(data, SOURCE, STAMP)[0]
        self.assertEqual(item['title'], 'A & B')
        self.assertEqual(item['url'], 'https://pib.gov.in/a?id=1')
        self.assertTrue(item['publishedAt'].endswith('+05:30'))
        self.assertEqual(item['id'], c.parse_feed(data, SOURCE, '2026-10-14T10:00:00Z')[0]['id'])
    def test_atom(self):
        data = b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom headline</title><link href="https://pib.gov.in/a"/><updated>2026-10-13T10:00:00Z</updated></entry></feed>'
        self.assertEqual(c.parse_feed(data, SOURCE, STAMP)[0]['title'], 'Atom headline')
    def test_unknown_dates_are_not_fabricated(self):
        self.assertIsNone(c.parse_date('Tue, 13 Oct 2026 16:25:00'))
        self.assertIsNone(c.parse_date('nonsense'))
        data = b'<rss><channel><item><title>No date</title><link>https://pib.gov.in/a</link></item></channel></rss>'
        self.assertIsNone(c.parse_feed(data, SOURCE, STAMP)[0]['publishedAt'])
    def test_rejects_dtd_html_and_oversized_payloads(self):
        for data in [b'<!DOCTYPE rss><rss/>', '<!DOCTYPE rss><rss/>'.encode('utf-16'), b'<!ENTITY x "attack"><rss/>', b'<html>blocked</html>', b'x' * (c.MAX_BYTES + 1)]:
            with self.assertRaises(ValueError): c.parse_feed(data, SOURCE, STAMP)
    def test_rejects_external_private_or_script_urls(self):
        for url in ['javascript:alert(1)', 'http://127.0.0.1/a', 'https://pib.gov.in.evil.example/a', 'https://evil.example/a', 'https://user:password@pib.gov.in/a']:
            with self.assertRaises(ValueError): c.canonical_url(url, SOURCE['allowedHosts'])
    def test_source_failure_is_explicit_and_non_destructive(self):
        _, status = c.fetch_source({**SOURCE, 'url': 'https://evil.example/feed'}, STAMP)
        self.assertFalse(status['ok'])
        self.assertIsNone(status['lastSuccessAt'])
        self.assertIn('allowlisted', status['error'])

if __name__ == '__main__': unittest.main()
