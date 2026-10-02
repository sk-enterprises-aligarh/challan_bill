import http.server
import socketserver
import sys

PORT = 8088

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent caching so browser immediately gets fresh app code
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    server_address = ('0.0.0.0', PORT)
    try:
        with ThreadingHTTPServer(server_address, NoCacheHandler) as httpd:
            print(f"SK ENTERPRISES Server running at http://localhost:{PORT}")
            sys.stdout.flush()
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}", file=sys.stderr)
        sys.exit(1)
