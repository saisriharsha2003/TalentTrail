from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
import tempfile
import traceback
from werkzeug.utils import secure_filename
from resume_parser import resume_ner_gpt
from job_parser import parse_job_description
from Test.mock_data import resume_data_mock
# from compute_score import compute_similarity
from docx import Document

app = Flask(__name__)
CORS(app, support_credentials=True)

UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
@cross_origin(supports_credentials=True)
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'TalenTrail API is running',
        'version': '1.0.0'
    }), 200


@app.route('/parse_resume', methods=['POST'])
@cross_origin(supports_credentials=True)
def parse_resume():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Allowed: PDF, DOCX, DOC'}), 400
        
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(temp_path)
        
        try:
            resume_data = resume_ner_gpt(temp_path)
            return jsonify({
                'success': True,
                'resume_data': resume_data,
                'filename': filename
            }), 200
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass
    
    except Exception as e:
        return jsonify({'error': f'Resume parsing failed: {str(e)}'}), 500


@app.route('/parse_job', methods=['POST'])
@cross_origin(supports_credentials=True)
def parse_job():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Allowed: PDF, DOCX, DOC, TXT'}), 400
        
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(temp_path)

        try:
            print("📄 Parsing file:", filename)

            ext = filename.rsplit('.', 1)[1].lower()

            if ext == "pdf":
                job_data = parse_job_description(temp_path)

            elif ext == "txt":
                with open(temp_path, "r", encoding="utf-8") as f:
                    text = f.read()
                job_data = parse_job_description(text)

            elif ext in ["doc", "docx"]:
                doc = Document(temp_path)
                text = "\n".join([p.text for p in doc.paragraphs])
                job_data = parse_job_description(text)

            else:
                return jsonify({'error': 'Unsupported format'}), 400

            print("🧠 Parsed Output:", job_data)

            if not job_data or not isinstance(job_data, dict):
                return jsonify({'error': 'Parser returned invalid data'}), 500

            if "jobTitle" not in job_data:
                return jsonify({'error': 'Parser failed to extract required fields'}), 500

            return jsonify({
                "success": True,
                "job_data": job_data
            }), 200

        except Exception as inner_error:
            print("❌ ERROR INSIDE PARSER:")
            traceback.print_exc()

            return jsonify({
                'error': f'Parsing failed: {str(inner_error)}'
            }), 500

        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass

    except Exception as e:
        print("❌ OUTER ERROR:")
        traceback.print_exc()

        return jsonify({
            'error': f'Job parsing failed: {str(e)}'
        }), 500


# @app.route('/compute_score', methods=['POST'])
# @cross_origin(supports_credentials=True)
# def compute_score():
#     try:
#         sent1 = request.form.get('sent1')
#         sent2 = request.form.get('sent2')
        
#         if not sent1 or not sent2:
#             return jsonify({
#                 'error': 'Both sent1 and sent2 parameters are required'
#             }), 400
        
#         similarity_score = compute_similarity(sent1, sent2)
        
#         return jsonify({
#             'success': True,
#             'similarity_score': similarity_score,
#             'sent1_preview': sent1[:100] + ('...' if len(sent1) > 100 else ''),
#             'sent2_preview': sent2[:100] + ('...' if len(sent2) > 100 else '')
#         }), 200

#     except Exception as e:
#         return jsonify({'error': f'Score computation failed: {str(e)}'}), 500


@app.route('/api/endpoints', methods=['GET'])
@cross_origin(supports_credentials=True)
def list_endpoints():
    endpoints = {
        'health': {
            'path': '/health',
            'method': 'GET',
            'description': 'Health check endpoint'
        },
        'parse_resume': {
            'path': '/parse_resume',
            'method': 'POST',
            'description': 'Parse resume file (PDF, DOCX, DOC)'
        },
        'parse_job': {
            'path': '/parse_job',
            'method': 'POST',
            'description': 'Parse job description (PDF, DOCX, DOC, TXT)'
        },
        'compute_score': {
            'path': '/compute_score',
            'method': 'POST',
            'description': 'Compute semantic similarity between two texts'
        }
    }
    
    return jsonify({'endpoints': endpoints}), 200


@app.route('/', methods=['GET'])
@cross_origin(supports_credentials=True)
def index():
    return jsonify({
        'name': 'TalenTrail Unified API',
        'version': '1.0.0'
    }), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': str(error)
    }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)