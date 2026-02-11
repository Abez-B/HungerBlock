import cv2
import numpy as np
from PIL import Image
import io

class FreshnessDetector:
    def __init__(self):
        """Initialize freshness detector using color and texture analysis"""
        self.hsv_ranges = {
            'fresh': {
                'lower': np.array([30, 40, 40]),
                'upper': np.array([90, 255, 255])
            },
            'ripe': {
                'lower': np.array([10, 100, 100]),
                'upper': np.array([30, 255, 255])
            },
            'spoiled': {
                'lower': np.array([0, 50, 50]),
                'upper': np.array([10, 255, 150])
            }
        }
    
    def analyze(self, image_file):
        """
        Analyze food freshness from image
        Returns: dict with freshness score (0-100) and category
        """
        # Read image
        img_pil = Image.open(image_file.stream).convert('RGB')
        img = np.array(img_pil)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        
        # Convert to HSV color space
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Calculate color distribution
        fresh_mask = cv2.inRange(hsv, self.hsv_ranges['fresh']['lower'], 
                                 self.hsv_ranges['fresh']['upper'])
        ripe_mask = cv2.inRange(hsv, self.hsv_ranges['ripe']['lower'], 
                                self.hsv_ranges['ripe']['upper'])
        spoiled_mask = cv2.inRange(hsv, self.hsv_ranges['spoiled']['lower'], 
                                   self.hsv_ranges['spoiled']['upper'])
        
        # Calculate ratios
        total_pixels = img.shape[0] * img.shape[1]
        fresh_ratio = np.count_nonzero(fresh_mask) / total_pixels
        ripe_ratio = np.count_nonzero(ripe_mask) / total_pixels
        spoiled_ratio = np.count_nonzero(spoiled_mask) / total_pixels
        
        # Calculate brightness (indicator of freshness)
        brightness = np.mean(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
        
        # Calculate texture variance (fresh food has more texture)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        texture_variance = np.var(cv2.Laplacian(gray, cv2.CV_64F))
        
        # Compute freshness score (0-100)
        # Weight: fresh colors (+), brightness (+), texture variance (+), spoiled colors (-)
        score = (
            fresh_ratio * 40 +
            (brightness / 255) * 30 +
            min(texture_variance / 1000, 1) * 20 +
            ripe_ratio * 10 -
            spoiled_ratio * 50
        )
        
        score = max(0, min(100, int(score * 100)))
        
        # Categorize freshness
        if score >= 80:
            category = 'excellent'
            description = 'Food appears very fresh and safe to donate'
        elif score >= 60:
            category = 'good'
            description = 'Food is fresh and suitable for donation'
        elif score >= 40:
            category = 'fair'
            description = 'Food is acceptable but should be consumed soon'
        else:
            category = 'poor'
            description = 'Food may not be suitable for donation'
        
        return {
            'score': score,
            'category': category,
            'description': description,
            'metrics': {
                'brightness': round(brightness, 2),
                'texture_variance': round(float(texture_variance), 2),
                'color_distribution': {
                    'fresh': round(fresh_ratio * 100, 2),
                    'ripe': round(ripe_ratio * 100, 2),
                    'spoiled': round(spoiled_ratio * 100, 2)
                }
            }
        }
