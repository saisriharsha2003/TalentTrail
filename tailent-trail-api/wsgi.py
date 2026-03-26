"""
WSGI Configuration for Production Deployment
Use with gunicorn: gunicorn wsgi:app
"""

from main import app

if __name__ == '__main__':
    app.run()
