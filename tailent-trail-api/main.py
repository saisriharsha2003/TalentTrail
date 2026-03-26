from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
import tempfile
from werkzeug.utils import secure_filename

# Import the three modules
from resume_parser import resume_ner_gpt
from job_parser import job_ner_gpt1
from compute_score import compute_similarity

app = Flask(__name__)
CORS(app, support_credentials=True)

# Configure upload folder
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
@cross_origin(supports_credentials=True)
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'TalentTrail API is running',
        'version': '1.0.0'
    }), 200


@app.route('/parse_resume', methods=['POST'])
@cross_origin(supports_credentials=True)
def parse_resume():
    """
    Parse resume file and extract structured candidate information.
    
    Accepts: PDF, DOCX, DOC files
    Returns: Extracted resume data with candidate details, education, experience, skills, etc.
    """
    try:
        # Validate file presence
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file format
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Allowed: PDF, DOCX, DOC'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(temp_path)
        
        try:
            # Parse resume using imported function
            resume_data = resume_ner_gpt(temp_path)
            
            return jsonify({
                'success': True,
                'resume_data': resume_data,
                'filename': filename
            }), 200
            
        finally:
            # Clean up temporary file
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
    """
    Parse job description file and extract structured position information.
    
    Accepts: PDF files only
    Returns: Extracted job data with title, company, skills, experience required, etc.
    """
    try:
        # Validate file presence
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Job parser only accepts PDF
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Job parser requires PDF files only'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(temp_path)
        
        try:
            # Parse job description using imported function
            job_data = job_ner_gpt1(temp_path)
            
            # Map tuple to structured object for cleaner API response
            job_fields = [
                'job_title',
                'company',
                'industry',
                'location',
                'positions_available',
                'start_date',
                'end_date',
                'bill_rate',
                'is_remote',
                'experience_required',
                'it_skills',
                'tools_and_languages',
                'organizational_skills',
                'soft_skills',
                'years_of_experience',
                'educational_qualifications',
                'certifications',
                'other_requirements'
            ]
            
            job_dict = {field: value for field, value in zip(job_fields, job_data)}
            
            return jsonify({
                'success': True,
                'job_data': job_dict,
                'filename': filename
            }), 200
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass
    
    except Exception as e:
        return jsonify({'error': f'Job parsing failed: {str(e)}'}), 500


@app.route('/compute_score', methods=['POST'])
@cross_origin(supports_credentials=True)
def compute_score():
    """
    Compute semantic similarity between two text inputs using BGEM3 embeddings.
    
    Expected params:
        - sent1 (string): First text input
        - sent2 (string): Second text input
    
    Returns: Similarity score as percentage (0-100)
    """
    try:
        # Extract sentences from request
        sent1 = request.form.get('sent1')
        sent2 = request.form.get('sent2')
        
        # Validate inputs
        if not sent1 or not sent2:
            return jsonify({
                'error': 'Both sent1 and sent2 parameters are required'
            }), 400
        
        # Compute similarity score
        similarity_score = compute_similarity(sent1, sent2)
        
        return jsonify({
            'success': True,
            'similarity_score': similarity_score,
            'sent1_preview': sent1[:100] + ('...' if len(sent1) > 100 else ''),
            'sent2_preview': sent2[:100] + ('...' if len(sent2) > 100 else '')
        }), 200

    except Exception as e:
        return jsonify({'error': f'Score computation failed: {str(e)}'}), 500


@app.route('/api/endpoints', methods=['GET'])
@cross_origin(supports_credentials=True)
def list_endpoints():
    """List all available API endpoints and their specifications"""
    endpoints = {
        'health': {
            'path': '/health',
            'method': 'GET',
            'description': 'Health check endpoint',
            'response': {'status': 'healthy', 'message': '...', 'version': '1.0.0'}
        },
        'parse_resume': {
            'path': '/parse_resume',
            'method': 'POST',
            'description': 'Parse resume file (PDF, DOCX, DOC)',
            'content_type': 'multipart/form-data',
            'parameters': {'file': 'Resume document (PDF, DOCX, or DOC)'},
            'response': {
                'success': True,
                'resume_data': ['list of parsed resume information'],
                'filename': 'original_filename'
            }
        },
        'parse_job': {
            'path': '/parse_job',
            'method': 'POST',
            'description': 'Parse job description (PDF only)',
            'content_type': 'multipart/form-data',
            'parameters': {'file': 'Job description (PDF only)'},
            'response': {
                'success': True,
                'job_data': {'job_title': '...', 'company': '...', 'skills': ['...']},
                'filename': 'original_filename'
            }
        },
        'compute_score': {
            'path': '/compute_score',
            'method': 'POST',
            'description': 'Compute semantic similarity between two texts',
            'content_type': 'application/x-www-form-urlencoded',
            'parameters': {
                'sent1': 'First text input',
                'sent2': 'Second text input'
            },
            'response': {
                'success': True,
                'similarity_score': 85.42,
                'sent1_preview': 'preview of first text...',
                'sent2_preview': 'preview of second text...'
            }
        },
        'list_endpoints': {
            'path': '/api/endpoints',
            'method': 'GET',
            'description': 'List all available endpoints with specifications'
        }
    }
    
    return jsonify({'endpoints': endpoints}), 200


@app.route('/', methods=['GET'])
@cross_origin(supports_credentials=True)
def index():
    """Welcome endpoint - shows API information"""
    return jsonify({
        'name': 'TalentTrail Unified API',
        'version': '1.0.0',
        'description': 'Unified API for resume parsing, job parsing, and similarity scoring',
        'author': 'TalentTrail Team',
        'endpoints': {
            'list_all_endpoints': '/api/endpoints',
            'health_check': '/health',
            'parse_resume': '/parse_resume',
            'parse_job': '/parse_job',
            'compute_score': '/compute_score'
        },
        'documentation': 'Visit /api/endpoints for detailed endpoint specifications'
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': '/api/endpoints'
    }), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': str(error)
    }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
