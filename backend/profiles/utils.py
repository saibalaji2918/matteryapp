import base64
from io import BytesIO
from PIL import Image, ImageFilter
from django.core.exceptions import ValidationError

def compress_image_to_base64(image_file, max_size=(800, 800), quality=75):
    """
    Compresses an uploaded image using Pillow, converts it to JPEG, and returns it as a Base64 string.
    """
    try:
        # Open the image file
        img = Image.open(image_file)
        
        # Convert RGBA/P to RGB if necessary for JPEG format
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background for transparent images
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[3])
            else:
                background.paste(img)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Resize image if it exceeds max dimensions, preserving aspect ratio
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to memory buffer
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=quality)
        buffer.seek(0)
        
        # Encode to Base64
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"data:image/jpeg;base64,{img_base64}"
    except Exception as e:
        raise ValidationError(f"Error processing and compressing image: {str(e)}")

def blur_base64_image(base64_str, blur_radius=30):
    """
    Decodes a base64 image string, applies a heavy Gaussian blur, and returns the blurred image as base64.
    """
    if not base64_str:
        return ""
    
    try:
        # Strip header if present
        header = ""
        if ',' in base64_str:
            header, base64_data = base64_str.split(',', 1)
        else:
            base64_data = base64_str
            
        # Decode and open image
        image_bytes = base64.b64decode(base64_data)
        img = Image.open(BytesIO(image_bytes))
        
        # Apply heavy blur
        blurred_img = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))
        
        # Save to buffer
        buffer = BytesIO()
        blurred_img.save(buffer, format='JPEG')
        buffer.seek(0)
        
        # Encode back to base64
        blurred_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"{header},{blurred_base64}" if header else f"data:image/jpeg;base64,{blurred_base64}"
    except Exception:
        # Fallback to returning original if blur fails (though it shouldn't)
        return base64_str
