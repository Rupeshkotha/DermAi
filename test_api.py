import requests
import json
from PIL import Image
import io
import os

def test_detection():
    # API endpoint
    url = "http://localhost:8000/detect"
    
    # Load a test image
    try:
        # Check if test image exists
        image_path = "test_images/test.jpg"
        if not os.path.exists(image_path):
            print(f"Error: Test image not found at {image_path}")
            return
            
        image = Image.open(image_path)
        
        # Convert image to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Prepare the request
        files = {
            "file": ("image.jpg", img_byte_arr, "image/jpeg")
        }
        
        # Make the request
        print("Sending request to API...")
        response = requests.post(url, files=files)
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            print("\nPrediction Results:")
            print(f"Detected Disease: {result.get('disease_name', 'Unknown')}")
            print(f"Confidence: {result.get('confidence', 0):.2%}")
            print("\nAI Insights:")
            print(result.get('ai_insights', 'No insights available'))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except FileNotFoundError as e:
        print(f"Error: Could not find test image at {image_path}")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure the server is running.")
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        print("Full error details:", e.__class__.__name__)

if __name__ == "__main__":
    test_detection() 