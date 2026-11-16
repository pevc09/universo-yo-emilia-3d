# Servidor local: sirve site/ y recibe los videos renderizados (POST /upload?name=archivo.mp4).
import http.server, os, re, sys, urllib.parse
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def do_POST(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        name = (q.get('name') or [''])[0]
        if u.path != '/upload' or not re.fullmatch(r'[a-z0-9_-]+\.(mp4|webm|jpg|png)', name):
            self.send_error(400); return
        n = int(self.headers.get('Content-Length', 0)); data = self.rfile.read(n)
        os.makedirs(os.path.join(ROOT, 'videos'), exist_ok=True)
        with open(os.path.join(ROOT, 'videos', name), 'wb') as f: f.write(data)
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')
    def log_message(self, *a): pass
H.extensions_map.update({'.js': 'text/javascript', '.mjs': 'text/javascript', '.mp4': 'video/mp4'})
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8377
http.server.ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
