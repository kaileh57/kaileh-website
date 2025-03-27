import os
import json
import base64
import sys
import subprocess
import importlib.util

def check_and_install_dependencies():
    # Check if Pillow is installed
    pillow_installed = importlib.util.find_spec("PIL") is not None
    
    if not pillow_installed:
        print("Pillow is not installed. Installing it now...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
            print("Pillow installed successfully. ✓")
            print("Restarting script with updated dependencies...")
            
            # Restart the script to ensure Pillow is available
            os.execv(sys.executable, [sys.executable] + sys.argv)
        except Exception as e:
            print(f"Failed to install Pillow: {e}")
            print("Please install it manually with: pip install Pillow")
            sys.exit(1)
    else:
        print("Pillow is installed. ✓")

def download_hle_quiz_data():
    try:
        from datasets import load_dataset
        from tqdm import tqdm
        import re
        from PIL import Image
        
        print("\nDownloading Humanity's Last Exam dataset...")
        
        # Create directories
        os.makedirs("images", exist_ok=True)
        
        try:
            # Load the dataset
            dataset = load_dataset("cais/hle", split="test")
            
            # Initialize the list to store formatted questions
            formatted_questions = []
            
            # Process each question in the dataset
            for i, item in enumerate(tqdm(dataset, desc="Processing questions")):
                try:
                    # Extract base fields
                    question_data = {
                        "id": item["id"],
                        "question": item["question"],
                        "answer": item["answer"],
                        "answer_type": item["answer_type"],
                    }
                    
                    # Add rationale if available
                    if "rationale" in item and item["rationale"]:
                        question_data["rationale"] = item["rationale"]
                    
                    # Add author if available
                    if "author_name" in item and item["author_name"]:
                        question_data["author_name"] = item["author_name"]
                    
                    # Set category - prioritize raw_subject over category
                    if "raw_subject" in item and item["raw_subject"]:
                        question_data["category"] = item["raw_subject"]
                    elif "category" in item and item["category"]:
                        question_data["category"] = item["category"]
                    else:
                        question_data["category"] = "Other"
                    
                    # Handle multiple choice if applicable
                    if item["answer_type"] == "multipleChoice":
                        # Try to extract choices from the question text
                        choices = []
                        if "Answer Choices:" in item["question"]:
                            try:
                                choice_section = item["question"].split("Answer Choices:")[1].strip()
                                choice_matches = re.findall(r'([A-H]\..*?)(?=[A-H]\.|$)', choice_section, re.DOTALL)
                                if choice_matches:
                                    choices = [choice.strip() for choice in choice_matches]
                            except:
                                pass
                        
                        question_data["choices"] = choices
                    
                    # Handle images if present
                    if "image_preview" in item and item["image_preview"] is not None:
                        # For the HTML version, we'll save the image to a file
                        image_id = item["id"]
                        image_filename = f"{image_id}.png"  # Change to PNG to support transparency
                        image_path = os.path.join("images", image_filename)
                        
                        try:
                            # Get the image data
                            image_data = item["image_preview"]
                            
                            # Check if image is already a path or needs to be saved
                            if isinstance(image_data, str) and image_data.startswith("data:image"):
                                # Extract base64 data and save as image
                                try:
                                    base64_data = image_data.split(",")[1]
                                    with open(image_path, "wb") as f:
                                        f.write(base64.b64decode(base64_data))
                                    question_data["image"] = image_filename
                                except Exception as e:
                                    print(f"Error saving base64 image for question {image_id}: {e}")
                            else:
                                # Assume it's a PIL Image object
                                if hasattr(image_data, 'save'):
                                    # Save as PNG to preserve transparency
                                    image_data.save(image_path, "PNG")
                                    question_data["image"] = image_filename
                                else:
                                    print(f"Unsupported image type for question {image_id}: {type(image_data)}")
                        except Exception as e:
                            print(f"Error processing image for question {image_id}: {e}")
                    
                    # Add to formatted questions
                    formatted_questions.append(question_data)
                
                except Exception as e:
                    print(f"Error processing question {i}: {e}")
                    continue
            
            # Save formatted questions as JSON
            with open("questions.json", "w", encoding="utf-8") as f:
                json.dump(formatted_questions, f, ensure_ascii=False, indent=2)
            
            print(f"\nProcessed {len(formatted_questions)} questions")
            print("Data saved to questions.json")
            print("Images saved to images/ directory")
            print("\nTo use the quiz:")
            print("1. Place questions.json in the same directory as the HTML file")
            print("2. Make sure the images/ directory is also in the same location")
            print("3. Open the HTML file in a browser to start the quiz")
        
        except Exception as e:
            print(f"An error occurred: {e}")
    
    except ImportError as e:
        print(f"Missing required package: {e}")
        print("Please make sure the following packages are installed:")
        print("- datasets")
        print("- tqdm")
        print("- Pillow")
        print("You can install them with: pip install datasets tqdm Pillow")

if __name__ == "__main__":
    print("Checking required packages...")
    check_and_install_dependencies()
    
    # Now check if datasets and tqdm are installed
    # We do this separately to avoid trying to import them before Pillow is installed
    missing_packages = []
    for package in ["datasets", "tqdm"]:
        if importlib.util.find_spec(package) is None:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing required packages: {', '.join(missing_packages)}")
        print("Installing them now...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing_packages)
            print("Packages installed successfully. ✓")
            print("Restarting script with updated dependencies...")
            
            # Restart the script to ensure newly installed packages are available
            os.execv(sys.executable, [sys.executable] + sys.argv)
        except Exception as e:
            print(f"Failed to install required packages: {e}")
            print(f"Please install them manually with: pip install {' '.join(missing_packages)}")
            sys.exit(1)
    
    # If we get here, all dependencies should be installed
    download_hle_quiz_data()