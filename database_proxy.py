#!/usr/bin/env python3
import json
import psycopg2
import psycopg2.extras
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import sys

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'timemanagement',
    'user': 'sdadmin',
    'password': '04D8lt1+9^sG/!Dj'
}

class DatabaseProxyHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
    def _send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        path = urlparse(self.path).path
        
        if path == '/health':
            self._send_json_response(200, {
                'status': 'Database proxy running',
                'timestamp': '2025-12-11T08:45:00.000Z'
            })
        else:
            self._send_json_response(404, {'error': 'Endpoint not found'})
    
    def do_POST(self):
        try:
            path = urlparse(self.path).path
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode())
            
            if path == '/query':
                self._handle_query(request_data)
            elif path == '/transaction':
                self._handle_transaction(request_data)
            else:
                self._send_json_response(404, {'error': 'Endpoint not found'})
                
        except Exception as e:
            self._send_json_response(500, {'error': str(e)})
    
    def _handle_query(self, data):
        try:
            query = data.get('query')
            params = data.get('params', [])
            
            if not query:
                self._send_json_response(400, {'error': 'Query is required'})
                return
            
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            cursor.execute(query, params)
            
            if cursor.description:
                rows = cursor.fetchall()
                result = [dict(row) for row in rows]
            else:
                result = []
            
            conn.commit()
            cursor.close()
            conn.close()
            
            self._send_json_response(200, {
                'success': True,
                'rows': result,
                'rowCount': cursor.rowcount
            })
            
        except Exception as e:
            self._send_json_response(500, {
                'success': False,
                'error': str(e)
            })
    
    def _handle_transaction(self, data):
        try:
            queries = data.get('queries', [])
            
            if not queries:
                self._send_json_response(400, {'error': 'Queries array is required'})
                return
            
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            results = []
            
            for query_data in queries:
                query = query_data.get('query')
                params = query_data.get('params', [])
                
                cursor.execute(query, params)
                
                if cursor.description:
                    rows = cursor.fetchall()
                    result = [dict(row) for row in rows]
                else:
                    result = []
                
                results.append({
                    'rows': result,
                    'rowCount': cursor.rowcount
                })
            
            conn.commit()
            cursor.close()
            conn.close()
            
            self._send_json_response(200, {
                'success': True,
                'results': results
            })
            
        except Exception as e:
            conn.rollback()
            self._send_json_response(500, {
                'success': False,
                'error': str(e)
            })

if __name__ == '__main__':
    PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = HTTPServer(('0.0.0.0', PORT), DatabaseProxyHandler)
    print(f'Database proxy server running on port {PORT}')
    print('Available endpoints:')
    print('- GET /health')
    print('- POST /query')
    print('- POST /transaction')
    server.serve_forever()