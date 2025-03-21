# Object Tracking with Zoom Effect using OpenCV

This project demonstrates how to perform real-time object tracking in a video using OpenCV, with an additional zoom functionality. The object (person, for example) is tracked using the CSRT (Channel and Spatial Reliability Tracking) algorithm, and users can zoom into the selected object by pressing specific keys. This is ideal for applications where you want to follow and focus on a moving object in a video, such as a person in a security camera feed or tracking a player in sports footage.

## Features
- **Object Tracking:** Tracks an object across frames using the CSRT tracker.
- **Zooming:** Allows zooming into the tracked object by modifying the zoom factor.
- **Real-time Update:** Continuously updates the tracking and zoom effect while the video plays.
- **Keyboard Controls:** Allows interaction with the tracking and zooming through keyboard inputs.

## Requirements

To run this project, you will need:
- Python 3.x
- OpenCV library (preferably 4.5.1 or newer)
- A video file to test the tracker

You can install OpenCV via pip if you haven't already:
pip install opencv-python opencv-contrib-python

## Setup

1. Clone or download this repository to your local machine.
2. Make sure you have the required dependencies installed (OpenCV).
3. Place the video file you want to track in the same directory or specify its full path.

## Code Explanation

The script performs the following steps:

1. **Loading the Video:**
   - The video file is loaded using `cv2.VideoCapture()`.
   - The user is prompted to select a region of interest (ROI) from the first frame of the video. This defines the object to be tracked.

2. **Tracking Initialization:**
   - The tracker (`cv2.legacy.TrackerCSRT_create()`) is initialized with the selected bounding box around the object in the first frame.

3. **Tracking Loop:**
   - The video is processed frame by frame.
   - For each frame, the tracker attempts to update the object's position.
   - If successful, a green bounding box is drawn around the object, showing its updated location.
   
4. **Zoom Effect:**
   - The region of interest is cropped from the frame and resized based on the current zoom factor.
   - The zoomed-in portion of the frame is centered within the original frame.

5. **User Interaction (Keyboard Controls):**
   - `'a'` key: Zoom in by increasing the zoom factor.
   - `'b'` key: Reset zoom to the original size.
   - `'q'` key: Quit the program and close the video window.

6. **Display the Video:**
   - The updated frame is displayed using `cv2.imshow()` in a window named "Tracking".

## Keyboard Controls
- **'a'** – Zoom in on the tracked object (increases zoom factor).
- **'b'** – Reset the zoom back to normal (zoom factor = 1).
- **'q'** – Quit the application and close the video window.

## Usage

1. **Run the script:**
   - Once the script is run, it will ask you to select an object to track. Use your mouse to draw a bounding box around the object you want to track.
   
2. **Track the Object:**
   - The object will be tracked across all subsequent frames.
   - You can zoom into the tracked object by pressing the `'a'` key to increase the zoom factor, and press `'b'` to reset the zoom.
   - Press `'q'` to exit the program.

python track_object_with_zoom.py

## Code Breakdown

Here’s a brief explanation of the core sections of the script:

### 1. **Loading Video and ROI Selection:**

video_path = r"C:\Users\tanse\Downloads\6387-191695740_small.mp4"
cap = cv2.VideoCapture(video_path)

# Check if the video was successfully opened
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Read the first frame and select ROI (Region of Interest)
ret, frame = cap.read()
bbox = cv2.selectROI("Select Person", frame, fromCenter=False, showCrosshair=True)
cv2.destroyAllWindows()

- This part loads the video and prompts the user to select the object to track in the first frame.

### 2. **Tracker Initialization:**

tracker = cv2.legacy.TrackerCSRT_create()  # Initialize CSRT tracker
tracker.init(frame, bbox)  # Initialize tracker with the first frame and ROI


- The CSRT tracker is initialized and set up with the selected bounding box in the first frame.

### 3. **Tracking and Zooming in the Loop:**

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    success, bbox = tracker.update(frame)  # Update tracker with the current frame
    if success:
        # Draw bounding box around the tracked object
        p1 = (int(bbox[0]), int(bbox[1]))
        p2 = (int(bbox[0] + bbox[2]), int(bbox[1] + bbox[3]))
        cv2.rectangle(frame, p1, p2, (0, 255, 0), 2)

- In this loop, the tracker updates the position of the bounding box as the object moves in the video.
- If tracking is successful, a green bounding box is drawn around the object.

### 4. **Zooming Functionality:**

if zoom_factor != 1.0:
    x, y, w, h = [int(v) for v in bbox]
    cropped = frame[y:y+h, x:x+w]  # Crop region of interest (ROI)
    
    # Resize the cropped region based on zoom factor
    zoomed_frame = cv2.resize(cropped, None, fx=zoom_factor, fy=zoom_factor, interpolation=cv2.INTER_LINEAR)
    
    # Fit the zoomed region back into the original frame
    zoomed_height, zoomed_width = zoomed_frame.shape[:2]
    y_offset = max(0, (frame.shape[0] - zoomed_height) // 2)
    x_offset = max(0, (frame.shape[1] - zoomed_width) // 2)
    frame[y_offset:y_offset+zoomed_height, x_offset:x_offset+zoomed_width] = zoomed_frame

- The zoom effect is applied by cropping the tracked object and resizing it based on the current zoom factor. The zoomed region is then centered back into the original frame.

### 5. **User Input for Zoom and Exit:**

key = cv2.waitKey(1) & 0xFF
if key == ord('q'):
    break
elif key == ord('a'):
    zoom_factor += 0.1  # Increase zoom factor
elif key == ord('b'):
    zoom_factor = 1.0  # Reset zoom to original size

- The program listens for keyboard inputs to control zoom and exit the program.

## Contributing

Feel free to fork this project, submit issues, or contribute by creating pull requests.

## License

This project is open-source and available under the MIT License.
