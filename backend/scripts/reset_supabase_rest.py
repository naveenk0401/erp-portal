import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "erp-files")

def reset_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase credentials not found.")
        return

    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }

    # 1. List files
    list_url = f"{SUPABASE_URL}/storage/v1/object/list/{SUPABASE_BUCKET}"
    print(f"Listing files in bucket: {SUPABASE_BUCKET} via REST...")
    
    try:
        response = requests.post(list_url, headers=headers, json={"prefix": ""})
        if response.status_code != 200:
            print(f"Error listing files: {response.status_code} {response.text}")
            return

        files = response.json()
        if not files:
            print("No files found in bucket.")
            return

        file_paths = [f['name'] for f in files if f['name'] != '.emptyFolderPlaceholder']
        
        if file_paths:
            print(f"Deleting files: {file_paths}")
            delete_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}"
            del_response = requests.delete(delete_url, headers=headers, json={"prefixes": file_paths})
            
            if del_response.status_code == 200:
                print("Supabase storage reset complete.")
            else:
                print(f"Error deleting files: {del_response.status_code} {del_response.text}")
        else:
            print("No files to delete.")

    except Exception as e:
        print(f"Error during Supabase REST reset: {e}")

if __name__ == "__main__":
    reset_supabase()
