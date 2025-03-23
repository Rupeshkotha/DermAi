import os
import requests
import re
import json
from dotenv import load_dotenv
from functools import lru_cache

# Load environment variables
load_dotenv()

class GPTHandler:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.api_url = os.getenv("OPENROUTER_API_URL")
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables")
        
        if not self.api_url:
            raise ValueError("OPENROUTER_API_URL not found in environment variables")

    def clean_text(self, text):
        """Clean and format text"""
        # Remove markdown symbols and special characters
        text = re.sub(r'^[-*#•]+\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\\boxed{|}', '', text)
        text = re.sub(r'\*+', '', text)
        # Remove backticks and code block markers
        text = re.sub(r'`{1,3}', '', text)
        # Remove stray brackets and braces
        text = re.sub(r'^\s*[}\]]\s*$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*[{]\s*$', '', text, flags=re.MULTILINE)
        # Remove multiple newlines and spaces
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'\s+', ' ', text)
        # Remove any remaining special characters at the end of the text
        text = re.sub(r'[`~{}[\]\\]*$', '', text)
        return text.strip()

    def parse_sections(self, content):
        """Parse the content into structured sections"""
        sections = {
            "overview": "",
            "symptoms": [],
            "treatment": [],
            "medical_care": [],
            "prevention": []
        }
        
        current_section = None
        lines = content.split('\n')
        
        for line in lines:
            line = self.clean_text(line)
            if not line:
                continue
                
            # Check for section headers
            if "Medical Description:" in line:
                current_section = "overview"
                continue
            elif "Symptoms & Signs:" in line:
                current_section = "symptoms"
                continue
            elif "Treatment Options:" in line:
                current_section = "treatment"
                continue
            elif "When to Seek Medical Care:" in line:
                current_section = "medical_care"
                continue
            elif "Prevention & Management:" in line:
                current_section = "prevention"
                continue
            
            # Skip lines that are just special characters or formatting
            if re.match(r'^[\s`~{}[\]\\]*$', line):
                continue
                
            # Add content to appropriate section
            if current_section:
                if current_section == "overview":
                    if sections["overview"]:
                        sections["overview"] += "\n"
                    sections["overview"] += line
                else:
                    # Only add non-empty lines that aren't just special characters
                    if line and not re.match(r'^[\s`~{}[\]\\]*$', line):
                        sections[current_section].append(line)
        
        # Clean up the sections
        sections["overview"] = sections["overview"].strip()
        for key in ["symptoms", "treatment", "medical_care", "prevention"]:
            # Remove any items that are just special characters or empty
            sections[key] = [
                item.strip() 
                for item in sections[key] 
                if item.strip() and not re.match(r'^[\s`~{}[\]\\]*$', item.strip())
            ]
            
            # Clean up the last item in each section
            if sections[key]:
                sections[key][-1] = re.sub(r'[`~{}[\]\\]*$', '', sections[key][-1])
        
        return sections

    @lru_cache(maxsize=100)
    def get_disease_info(self, disease_name):
        """Get detailed information about a skin disease using GPT"""
        try:
            prompt = f"""Provide comprehensive medical information about {disease_name}. Format your response exactly as follows:

Medical Description:
Provide a clear overview of the condition, including affected areas, appearance, and typical patient demographics.

Symptoms & Signs:
List all common symptoms and signs, including early warning signs and how symptoms progress.

Treatment Options:
List all available treatment options, including medical treatments, home remedies, and recommended medications.

When to Seek Medical Care:
List specific warning signs, emergency symptoms, and risk factors that require medical attention.

Prevention & Management:
List lifestyle recommendations, preventive measures, and daily care tips.

Important formatting rules:
1. Use only plain text - no special characters, bullet points, or markdown
2. Each section should start with the exact section name followed by a colon
3. Each item should be on a new line
4. Do not use any special characters like •, -, or *
5. Keep the information clear and concise
6. Ensure all sections are filled with relevant information"""

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Skin Disease Detection System"
            }

            data = {
                "model": "deepseek/deepseek-r1-zero:free",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a medical expert specializing in dermatology. Provide clear, structured information using only plain text. Use consistent formatting with clear section headers and simple line breaks between items. Do not use any special characters or formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }

            response = requests.post(
                self.api_url,
                headers=headers,
                json=data
            )

            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Parse the content into structured sections
                sections = self.parse_sections(content)
                
                # Ensure all sections have content
                if not sections["prevention"]:
                    sections["prevention"] = [
                        "Maintain good skin hygiene",
                        "Keep skin moisturized",
                        "Avoid known triggers",
                        "Manage stress levels",
                        "Follow a healthy diet",
                        "Protect skin from extreme weather",
                        "Regular medical check-ups"
                    ]
                
                return sections
            else:
                raise Exception(f"API request failed with status {response.status_code}: {response.text}")

        except Exception as e:
            print("Error details:", str(e))
            raise Exception(f"Error getting disease information: {str(e)}") 