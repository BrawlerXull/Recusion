from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
import pickle
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Define YouTube API scopes
YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/yt-analytics.readonly']

def authenticate_youtube(client_id, client_secret, redirect_uri):
    """
    Authenticate using OAuth direct credentials and return YouTube API client.
    """
    try:
        # Define token file
        token_pickle = 'youtube_token.pickle'
        creds = None
        
        # Check if token already exists
        if os.path.exists(token_pickle):
            with open(token_pickle, 'rb') as token:
                creds = pickle.load(token)
        
        # Refresh token if expired or get new token
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # Create flow using client config
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
                    client_config, YOUTUBE_SCOPES
                )
                flow.redirect_uri = redirect_uri
                creds = flow.run_local_server(port=3005)  # Make sure this matches

            # Save new token for future use
            with open(token_pickle, 'wb') as token:
                pickle.dump(creds, token)

        # Build the YouTube API client
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

def get_video_analytics(youtube, video_id, start_date, end_date):
    """
    Fetch analytics data for a specific video.
    
    Parameters:
    - youtube: Authenticated YouTube API client
    - video_id: YouTube video ID
    - start_date: Start date for analytics (format: 'YYYY-MM-DD')
    - end_date: End date for analytics (format: 'YYYY-MM-DD')
    
    Returns:
    - analytics_data: Analytics data for the video
    """
    try:
        # Request analytics data for the uploaded video
        request = youtube.analytics().reports().query(
            ids=f'channel=={video_id}',
            startDate=start_date,
            endDate=end_date,
            metrics='views,likes,dislikes,comments,subscribersGained,subscribersLost',
            filters=f'video=={video_id}'
        )
        
        response = request.execute()
        
        # Log the analytics data
        logger.info(f"Analytics Data for Video ID {video_id}: {response}")
        
        # Return the analytics data
        return response

    except Exception as e:
        logger.error(f"Failed to fetch video analytics: {str(e)}")
        raise

def get_authenticated_channel_id(youtube):
    """
    Get the authenticated user's YouTube channelId.
    """
    try:
        # Request the authenticated user's channel details
        request = youtube.channels().list(
            part='snippet,contentDetails',
            mine=True  # This ensures we're fetching the authenticated user's channel
        )
        
        # Execute the request
        response = request.execute()
        
        # Extract channelId from the response
        if 'items' in response and len(response['items']) > 0:
            channel_id = response['items'][0]['id']
            return channel_id
        else:
            raise Exception("No channel found for the authenticated user.")
    
    except Exception as e:
        logger.error(f"Failed to fetch channel ID: {str(e)}")
        raise


def get_all_video_ids(youtube):
    """
    Fetch all video IDs from a specific channel.
    
    Parameters:
    - youtube: Authenticated YouTube API client
    - channel_id: The channel's ID to fetch videos from
    
    Returns:
    - video_ids: List of video IDs for the channel
    """
    try:
        video_ids = []

        channel_id = get_authenticated_channel_id(youtube=youtube)
        
        # Fetch the list of videos from the channel
        request = youtube.channels().list(
            part='contentDetails',
            id=channel_id
        )
        response = request.execute()
        
        # Extract playlist ID of uploaded videos
        playlist_id = response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
        
        # Fetch the video IDs from the playlist
        request = youtube.playlistItems().list(
            part='snippet',
            playlistId=playlist_id,
            maxResults=50  # Adjust as needed
        )
        response = request.execute()
        
        # Collect video IDs
        for item in response['items']:
            video_ids.append(item['snippet']['resourceId']['videoId'])
        
        # Log the video IDs
        logger.info(f"Fetched {len(video_ids)} video IDs from channel {channel_id}")
        
        return video_ids
    
    except Exception as e:
        logger.error(f"Failed to fetch video IDs: {str(e)}")
        raise

def get_video_analytics_for_all_videos(youtube, start_date, end_date):
    """
    Fetch analytics for all videos in a channel.
    
    Parameters:
    - youtube: Authenticated YouTube API client
    - channel_id: The channel's ID to fetch videos from
    - start_date: Start date for analytics (format: 'YYYY-MM-DD')
    - end_date: End date for analytics (format: 'YYYY-MM-DD')
    
    Returns:
    - analytics_data: List of analytics data for all videos
    """
    channel_id = get_authenticated_channel_id(youtube=youtube)
    video_ids = get_all_video_ids(youtube, channel_id)
    
    all_analytics_data = []
    
    for video_id in video_ids:
        analytics_data = get_video_analytics(youtube, video_id, start_date, end_date)
        all_analytics_data.append(analytics_data)
    
    # Return the analytics data for all videos
    return all_analytics_data
