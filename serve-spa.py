import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # Serve static files if they exist, otherwise serve index.html (SPA fallback)
        file_path = os.path.join(DIRECTORY, self.path.lstrip('/'))
        if os.path.isfile(file_path):
            super().do_GET()
        elif self.path.startswith('/assets/') or self.path.startswith('/static/'):
            super().do_GET()
        else:
            self.path = '/index.html'
            super().do_GET()
    
    def log_message(self, format, *args):
        sys.stdout.write(f"[SPA] {format % args}\n")
        sys.stdout.flush()

with socketserver.TCPServer(("0.0.0.0", PORT), SPAHandler) as httpd:
    print(f"SPA server running on http://0.0.0.0:{PORT}")
    sys.stdout.flush()
    httpd.serve_forever()
