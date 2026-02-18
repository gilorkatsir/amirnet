
import re
import json

def parse_voc_md(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = re.split(r'##\s+(.+)\n', content)
    
    vocabulary = []
    current_category = "General"
    word_id = 1
    
    # The split results in [preamble, title1, content1, title2, content2, ...]
    # We skip 0 (preamble) and iterate in pairs
    
    for i in range(1, len(sections), 2):
        category_title = sections[i].strip()
        # Extract English part of category if possible "קישורים (Connectors)" -> "Connectors"
        # The file format seems to be "Hebrew (English)"
        match = re.search(r'\((.+)\)', category_title)
        if match:
             category_name = match.group(1)
        else:
             category_name = category_title
             
        table_content = sections[i+1]
        
        # Regex to find table rows: | val | val | val |
        # Skipping separator lines like |---|---|---|
        rows = re.findall(r'\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|', table_content)
        
        for row in rows:
            english = row[0].strip()
            hebrew = row[1].strip()
            example = row[2].strip()
            
            # Skip header row or separator row if regex caught them (basic check)
            if '---' in english or english.lower() == 'english':
                continue
                
            if english:
                vocabulary.append({
                    "id": word_id,
                    "english": english,
                    "hebrew": hebrew,
                    "example": example,
                    "category": category_name,
                    "pos": "general" # Default, as voc.md doesn't have POS
                })
                word_id += 1
                
    return vocabulary

vocabulary = parse_voc_md('/Users/gilorkatsir/amirnet/voc.md')

js_content = f"export const VOCABULARY = {json.dumps(vocabulary, ensure_ascii=False, indent=2)};"

with open('/Users/gilorkatsir/amirnet/vocabulary.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Successfully parsed {len(vocabulary)} words.")
