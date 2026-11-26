
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

if not api_key:
    print("ERROR: Gemini API key not found.")
else:
    try:
        client = genai.Client(api_key=api_key)

        print("Testing Gemini connection...")
        print("Model:", model)

        response = client.models.generate_content(
            model=model,
            contents="Reply with exactly: Gemini connection successful."
        )

        print("\nSUCCESS!")
        print("Gemini response:", response.text)

    except Exception as e:
        print("\nGEMINI CONNECTION FAILED")
        print("Error type:", type(e).__name__)
        print("Error details:", str(e))
