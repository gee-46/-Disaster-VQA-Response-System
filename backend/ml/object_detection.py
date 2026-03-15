import os
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO

class ObjectDetector:
    def __init__(self, model_name="yolov8n.pt"):
        self.model_name = model_name
        self.model = None
        self.is_loaded = False

    def load_model(self):
        print(f"[ObjectDetector] Loading YOLO model {self.model_name}...")
        try:
            # Ultralytics YOLO auto-downloads the model if not present
            self.model = YOLO(self.model_name)
            self.is_loaded = True
            print("[ObjectDetector] YOLO model loaded successfully.")
        except Exception as e:
            print(f"[ObjectDetector] Error loading YOLO model: {e}")
            self.is_loaded = False

    def detect_objects(self, image: Image.Image) -> tuple[Image.Image, list]:
        if not self.is_loaded or self.model is None:
            print("[ObjectDetector] Model not loaded. Returning original image.")
            return image, []

        try:
            # Convert PIL Image to OpenCV format (BGR)
            # Ensure it's RGB before conversion to avoid alpha channel issues
            img_rgb = image.convert("RGB")
            open_cv_image = np.array(img_rgb) 
            open_cv_image = open_cv_image[:, :, ::-1].copy() # RGB to BGR

            # Run YOLO inference
            results = self.model(open_cv_image, verbose=False)
            
            detected_objects = []
            
            # results is a list of Results objects, usually one per image
            if not results:
                return image, []
                
            result = results[0]
            
            # Extract bounding boxes, classes, and confidences
            boxes = result.boxes
            if boxes is not None:
                for idx, box in enumerate(boxes):
                    # Get box coordinates (x1, y1, x2, y2)
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    
                    # Get confidence and class id
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    label = self.model.names[cls_id]
                    
                    detected_objects.append({
                        "label": label,
                        "confidence": round(conf, 4),
                        "box": [x1, y1, x2, y2]
                    })
                    
                    # Draw bounding box on the OpenCV image
                    color = (0, 255, 0) # Green box
                    thickness = max(2, int(max(open_cv_image.shape[0], open_cv_image.shape[1]) / 400))
                    cv2.rectangle(open_cv_image, (x1, y1), (x2, y2), color, thickness)
                    
                    # Draw label background
                    label_text = f"{label} {conf:.2f}"
                    font_scale = max(0.5, thickness / 4)
                    font_thickness = max(1, thickness - 1)
                    
                    (text_width, text_height), baseline = cv2.getTextSize(
                        label_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness
                    )
                    
                    cv2.rectangle(
                        open_cv_image, 
                        (x1, y1 - text_height - baseline - 5), 
                        (x1 + text_width, y1), 
                        color, 
                        -1 # Filled rectangle
                    )
                    
                    # Draw text
                    cv2.putText(
                        open_cv_image, 
                        label_text, 
                        (x1, y1 - baseline - 2), 
                        cv2.FONT_HERSHEY_SIMPLEX, 
                        font_scale, 
                        (0, 0, 0), # Black text 
                        font_thickness
                    )

            # Convert back to PIL Image
            annotated_img_rgb = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2RGB)
            annotated_pil_image = Image.fromarray(annotated_img_rgb)
            
            return annotated_pil_image, detected_objects
            
        except Exception as e:
            print(f"[ObjectDetector] Error during detection: {e}")
            # Fallback to original image on error to maintain backwards compatibility
            return image, []

# Global singleton for the object detector
object_detector = ObjectDetector()
