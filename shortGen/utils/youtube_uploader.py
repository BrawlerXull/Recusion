from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow  # Add this import
import pickle

import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Define YouTube API scopes
YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

def authenticate_youtube(client_id, client_secret, redirect_uri):
    """
    Authenticate using OAuth direct credentials and return YouTube API client.
    
    Parameters:
    - client_id: OAuth client ID
    - client_secret: OAuth client secret
    - redirect_uri: Authorized redirect URI
    
    Returns:
    - youtube: Authenticated YouTube API client
    """
    try:
        # If we have saved credentials, load them
        creds = None
        token_pickle = 'youtube_token.pickle'
        
        if os.path.exists(token_pickle):
            with open(token_pickle, 'rb') as token:
                creds = pickle.load(token)
        
        # If credentials don't exist or are invalid, get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # Create flow directly using client credentials
                client_config = {
                    "installed": {
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "redirect_uris": [redirect_uri],
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token"
                    }
                }
                
                flow = InstalledAppFlow.from_client_config(
                    client_config, YOUTUBE_SCOPES)
                flow.redirect_uri = redirect_uri
                creds = flow.run_local_server(port=3005)  # Match your redirect URI port
            
            # Save credentials for future runs
            with open(token_pickle, 'wb') as token:
                pickle.dump(creds, token)
        
        youtube = build('youtube', 'v3', credentials=creds)
        logger.info("YouTube API authenticated successfully")
        return youtube
    except Exception as e:
        logger.error(f"YouTube authentication failed: {str(e)}")
        raise
def upload_video(youtube, video_path, title, description, category_id='22', tags=None):
    """
    Upload video to YouTube.
    
    Parameters:
    - youtube: Authenticated YouTube API client
    - video_path: Path to the video file to upload
    - title: Title of the YouTube video
    - description: Description of the YouTube video
    - category_id: YouTube category ID (default: '22' for People & Blogs)
    - privacy_status: Privacy status of the video (public, private, unlisted)
    - tags: List of tags for the video
    
    Returns:
    - video_id: YouTube video ID
    - upload_status: Status of the upload
    """
    
    privacy_status = 'unlisted'
    try:
        # Check if video file exists
        if not os.path.exists(video_path):
            logger.error(f"Video file not found: {video_path}")
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        # Set default tags if not provided
        if tags is None:
            tags = ['AI', 'Highlights', 'Video Processing']

        # Create request body
        request_body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': tags,
                'categoryId': category_id
            },
            'status': {
                'privacyStatus': privacy_status,
                'selfDeclaredMadeForKids': False
            }
        }

        # Create a media file for upload
        media_file = MediaFileUpload(
            video_path, 
            chunksize=1024*1024,  # Use 1MB chunks
            resumable=True, 
            mimetype='video/mp4'
        )

        logger.info(f"Starting YouTube upload for {os.path.basename(video_path)}")
        
        # Upload video to YouTube
        request = youtube.videos().insert(
            part='snippet,status',
            body=request_body,
            media_body=media_file
        )
        
        # Execute request with progress reporting
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.info(f"Uploaded {int(status.progress() * 100)}%")
        
        # Extract video ID and upload status
        video_id = response.get('id')
        upload_status = response.get('status', {}).get('uploadStatus')
        
        logger.info(f"Upload complete for video ID: {video_id}, Status: {upload_status}")
        
        # Return video ID and status
        return video_id, upload_status
        
    except Exception as e:
        logger.error(f"YouTube upload failed: {str(e)}")
        raise
