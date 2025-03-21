# app.py - Flask API for Video Highlight Generation
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import threading
import time
import shutil
import logging
from werkzeug.utils import secure_filename

# Import video processing functions
import moviepy.editor as mp
import whisper
import subprocess
import pandas as pd

# Import new modules
from utils.scene_intensity import analyze_scene_intensity
from utils.sentiment_analysis import analyze_sentiment


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm'}
MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max upload size

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)
os.makedirs('temp', exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Dictionary to store job status
jobs = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Video processing function
def process_video(video_path, job_id, num_highlights=3, highlight_duration=(20, 30)):
    """Process a video file to generate highlights"""
    try:
        job_folder = os.path.join(RESULTS_FOLDER, job_id)
        os.makedirs(job_folder, exist_ok=True)
        
        # Update job status
        jobs[job_id]['status'] = 'processing'
        jobs[job_id]['progress'] = 10
        
        # Load the video file
        clip = mp.VideoFileClip(video_path)
        total_duration = clip.duration
        logger.info(f"Video loaded. Duration: {total_duration:.2f} seconds")
        
        # Update progress
        jobs[job_id]['progress'] = 20
        
        # Check if audio exists
        has_audio = clip.audio is not None
        
        # Extract audio and transcribe if available
        transcript = None
        if has_audio:
            audio_path = os.path.join('temp', f"{job_id}_audio.wav")
            clip.audio.write_audiofile(audio_path)
            
            # Update progress
            jobs[job_id]['progress'] = 40
            
            # Load whisper model and transcribe
            try:
                model = whisper.load_model("base")
                result = model.transcribe(audio_path)
                transcript = result['text']
                logger.info("Transcription completed")
                
                # Save transcript
                with open(os.path.join(job_folder, 'transcript.txt'), 'w') as f:
                    f.write(transcript)
            except Exception as e:
                logger.error(f"Transcription error: {str(e)}")
            
            # Remove temporary audio file
            if os.path.exists(audio_path):
                os.remove(audio_path)
        
        # Update progress
        jobs[job_id]['progress'] = 60
        
        # Run scene detection
        scenes_file = os.path.abspath(os.path.join('temp', f"{job_id}_scenes.csv"))
        scene_output_dir = os.path.abspath(os.path.join('temp', f"{job_id}_scenes"))
        os.makedirs(scene_output_dir, exist_ok=True)

        # Analyze scene intensity (NEW)
                #  (NEW)

        scene_times = []
        if scenes_df is not None and len(scenes_df) > 0:
            scene_times = [
            (scenes_df.iloc[i]['Start Time (seconds)'], scenes_df.iloc[i]['End Time (seconds)'])
        for i in range(len(scenes_df))
         ]

        intensity_scores = analyze_scene_intensity(video_path, scene_times)
        logger.info(f"Scene intensity analysis completed. Top scenes: {len(intensity_scores)}")

        
        try:
            subprocess.run([
                'scenedetect',
                '--input', video_path,
                '--output', scene_output_dir,
                'detect-content',
                '--threshold', '30',
                'list-scenes',
                '--output', scenes_file
            ], check=True)
            
            logger.info("Scene detection completed")
            scenes_df = None
            
            # Read the CSV file with scene information
            if os.path.exists(scenes_file):
                try:
                    scenes_df = pd.read_csv(scenes_file)
                    logger.info(f"Detected {len(scenes_df)} scenes")
                except Exception as e:
                    logger.error(f"Error reading scene CSV: {str(e)}")
        except Exception as e:
            logger.error(f"Scene detection error: {str(e)}")
            scenes_df = None
        
        # Update progress
        jobs[job_id]['progress'] = 70
        
        # Determine highlights
        highlights = []
        
        # If we have scene data, use it
        if scenes_df is not None and len(scenes_df) > 0:
            for i in range(min(num_highlights, len(scenes_df))):
                start_time = scenes_df.iloc[i]['Start Time (seconds)']
                max_duration = min(highlight_duration[1], scenes_df.iloc[i]['Length (seconds)'])
                end_time = start_time + max_duration
                
                # Ensure we don't exceed clip duration
                if end_time > total_duration:
                    end_time = total_duration
                
                # Ensure minimum duration if possible
                if end_time - start_time < highlight_duration[0] and i < len(scenes_df) - 1:
                    end_time = start_time + highlight_duration[0]
                    if end_time > total_duration:
                        end_time = total_duration
                
                highlights.append((start_time, end_time))
        
        # If we need more highlights or no scenes were detected
        remaining = num_highlights - len(highlights)
        if remaining > 0:
            segment_length = min(highlight_duration[1], total_duration / (remaining + 1))
            for i in range(remaining):
                start_time = (i + 1) * segment_length
                end_time = start_time + segment_length
                if end_time > total_duration:
                    end_time = total_duration
                if start_time < end_time:  # Make sure we have a valid segment
                    highlights.append((start_time, end_time))
        
        # Update progress
        jobs[job_id]['progress'] = 80
        
        # Create highlight videos
        highlight_paths = []
        metadata = []
        
        for i, (start, end) in enumerate(highlights):
            highlight_name = f"highlight_{i+1}.mp4"
            output_path = os.path.join(job_folder, highlight_name)
            
            logger.info(f"Creating highlight {i+1} from {start:.2f}s to {end:.2f}s")
            
            # Create subclip and write to file
            subclip = clip.subclip(start, end)
            subclip.write_videofile(
                output_path, 
                codec='libx264', 
                audio_codec='aac' if has_audio else None,
                threads=2,
                verbose=False,
                logger=None
            )
            
            highlight_paths.append(output_path)
            metadata.append({
                "filename": highlight_name,
                "start_time": start,
                "end_time": end,
                "duration": end - start
            })
            
            # Increment progress as each highlight is completed
            jobs[job_id]['progress'] = 80 + ((i + 1) * 20 // len(highlights))
        
        # Save metadata
        with open(os.path.join(job_folder, 'metadata.json'), 'w') as f:
            import json
            json.dump({
                "original_video": os.path.basename(video_path),
                "total_duration": total_duration,
                "has_audio": has_audio,
                "highlights": metadata,
                "transcript": transcript
            }, f, indent=2)
        
        # Clean up
        clip.close()
        
        # Update job status to complete
        jobs[job_id]['status'] = 'complete'
        jobs[job_id]['progress'] = 100
        jobs[job_id]['result_files'] = highlight_paths
        jobs[job_id]['metadata'] = metadata
        
        logger.info(f"Job {job_id} completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        # Update job status to failed
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)
        return False

# API Routes
@app.route('/api/upload', methods=['POST'])
def upload_video():
    # Check if the post request has the file part
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    
    # If the user does not select a file
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Create a new job ID
        job_id = str(uuid.uuid4())
        
        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_{filename}")
        file.save(file_path)
        
        # Get processing parameters
        num_highlights = int(request.form.get('num_highlights', 3))
        min_duration = int(request.form.get('min_duration', 20))
        max_duration = int(request.form.get('max_duration', 30))
        
        # Initialize job status
        jobs[job_id] = {
            'id': job_id,
            'filename': filename,
            'file_path': file_path,
            'status': 'queued',
            'progress': 0,
            'created_at': time.time(),
            'num_highlights': num_highlights,
            'highlight_duration': (min_duration, max_duration)
        }
        
        # Start processing in a background thread
        threading.Thread(
            target=process_video,
            args=(file_path, job_id, num_highlights, (min_duration, max_duration))
        ).start()
        
        return jsonify({
            'job_id': job_id,
            'status': 'queued',
            'message': 'Video upload successful. Processing started.'
        }), 202
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id].copy()
    
    # Don't return internal file paths
    if 'file_path' in job:
        del job['file_path']
    if 'result_files' in job:
        del job['result_files']
    
    return jsonify(job), 200

@app.route('/api/results/<job_id>', methods=['GET'])
def get_job_results(job_id):
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    if job['status'] != 'complete':
        return jsonify({
            'status': job['status'],
            'progress': job['progress'],
            'message': 'Job is not complete yet'
        }), 202
    
    # Return links to download the highlights
    highlight_urls = []
    for i, metadata in enumerate(job.get('metadata', [])):
        highlight_urls.append({
            'id': i + 1,
            'filename': metadata['filename'],
            'url': f"/api/download/{job_id}/{metadata['filename']}",
            'duration': metadata['duration'],
            'start_time': metadata['start_time'],
            'end_time': metadata['end_time']
        })
    
    return jsonify({
        'job_id': job_id,
        'status': 'complete',
        'highlights': highlight_urls,
        # Include download link for transcript if available
        'transcript_url': f"/api/transcript/{job_id}" if os.path.exists(os.path.join(RESULTS_FOLDER, job_id, 'transcript.txt')) else None
    }), 200

@app.route('/api/download/<job_id>/<filename>', methods=['GET'])
def download_file(job_id, filename):
    # Validate job exists
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    # Validate job is complete
    job = jobs[job_id]
    if job['status'] != 'complete':
        return jsonify({'error': 'Job is not complete yet'}), 400
    
    # Validate filename
    file_path = os.path.join(RESULTS_FOLDER, job_id, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(file_path, as_attachment=True)

@app.route('/api/transcript/<job_id>', methods=['GET'])
def get_transcript(job_id):
    # Validate job exists
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    # Validate transcript exists
    transcript_path = os.path.join(RESULTS_FOLDER, job_id, 'transcript.txt')
    if not os.path.exists(transcript_path):
        return jsonify({'error': 'Transcript not available'}), 404
    
    return send_file(transcript_path, as_attachment=True)

@app.route('/api/cleanup', methods=['POST'])
def cleanup_old_jobs():
    """Clean up old jobs to free up disk space"""
    try:
        # Get cutoff time (default: 24 hours)
        hours = int(request.json.get('hours', 24))
        cutoff_time = time.time() - (hours * 3600)
        
        deleted_jobs = []
        for job_id, job in list(jobs.items()):
            if job.get('created_at', 0) < cutoff_time:
                # Delete job files
                if 'file_path' in job and os.path.exists(job['file_path']):
                    os.remove(job['file_path'])
                
                # Delete result folder
                job_folder = os.path.join(RESULTS_FOLDER, job_id)
                if os.path.exists(job_folder):
                    shutil.rmtree(job_folder)
                
                # Remove job from memory
                del jobs[job_id]
                deleted_jobs.append(job_id)
        
        return jsonify({
            'message': f'Cleaned up {len(deleted_jobs)} old jobs',
            'deleted_jobs': deleted_jobs
        }), 200
    except Exception as e:
        return jsonify({'error': f'Cleanup failed: {str(e)}'}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'active_jobs': len(jobs),
        'version': '1.0.0'
    }), 200

if __name__ == '__main__':
    # Install required packages if not already installed
    try:
        import pkg_resources
        required_packages = ['moviepy', 'scenedetect[opencv]', 'whisper', 'spacy', 'flask', 'flask-cors']
        installed = {pkg.key for pkg in pkg_resources.working_set}
        missing = [pkg for pkg in required_packages if pkg.split('[')[0] not in installed]
        
        if missing:
            logger.info(f"Installing missing packages: {missing}")
            import sys
            import subprocess
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
            
            # Special case for whisper
            if 'whisper' in missing:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'git+https://github.com/openai/whisper.git'])
    except Exception as e:
        logger.warning(f"Package check failed: {str(e)}")
    
    # Run the Flask application
    app.run(host='0.0.0.0', port=5000, debug=True)