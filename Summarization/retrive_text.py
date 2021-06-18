from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
from tika import parser




def retrive_text(url):
    if url[-4:] == '.pdf':
        raw = parser.from_file(url)
        return raw['content']
    else:
        req = Request(url,headers={'User-Agent': 'Mozilla/5.0'})
        html = urlopen(req).read()
        soup = BeautifulSoup(html, features="html.parser")

        
        for script in soup(["script", "style"]):
            script.extract() 

        
        text = soup.get_text()

        
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return text