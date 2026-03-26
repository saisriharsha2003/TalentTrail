"""
WSGI Configuration for Production Deployment
Use with gunicorn: gunicorn wsgi:app
"""

from main import app

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)