from flask import Flask, jsonify, request 
from flask.templating import render_template
from flask_cors import CORS
import pickle
import urllib.request as urllib2

app = Flask(__name__)
CORS(app)

def calculatePageSize(url):
    try:
        r = urllib2.urlopen(url)
        #print (len(r.read()))
        return len(r.read()) / 1024
    except:
        return 0

with open ('decisiontree.pickle','rb') as f:
    decisiontree = pickle.load(f)
    # print(decisiontree.predict([[0,1,3,2,0]]))
  

@app.route('/userinterest', methods = [ 'POST']) 
def home(): 
    if(request.method == 'POST'): 
        body = request.get_json()
        data = body['data']

        url = data['url']
        
        timespent = data['timespent'] / 1000
        avgscroll = data['avgscroll']
        clickthrough = data['clickthrough']
        pagesize = calculatePageSize(url)


        timespent_ch = 0
        avgscroll_ch = 0
        clickthrough_ch = 0
        pagesize_ch = 0


        #Normalize Time spent
        if(timespent < 15):
            timespent_ch = 0
        elif(timespent <60):
            timespent_ch = 1
        elif(timespent < 180):
            timespent_ch = 2
        else:
            timespent_ch = 3

        
        #Normalize Avg Scroll
        if(avgscroll < 50):
            avgscroll_ch = 0
        elif(avgscroll < 300):
            avgscroll_ch = 1
        elif(avgscroll < 900):
            avgscroll_ch = 2
        else:
            avgscroll_ch = 3

        #Normalize Clickthrough
        if(clickthrough < 0.25):
            clickthrough_ch = 0
        elif(clickthrough_ch < 0.7):
            clickthrough_ch = 2
        else:
            clickthrough_ch = 3

        #Normalize PagSize 
        if(pagesize < 50):
            pagesize_ch = 0
        elif(pagesize < 150):
            pagesize_ch  = 1
        elif(pagesize < 500):
            pagesize_ch = 2
        else: 
            pagesize_ch = 3



        print(timespent_ch,avgscroll_ch,clickthrough_ch,pagesize_ch)


        interest = decisiontree.predict([[
                                        timespent_ch,
                                        avgscroll_ch,
                                        clickthrough_ch,
                                        pagesize_ch
                                    ]])

        print(interest)

        return jsonify({"interest":interest[0]})

@app.route('/dummy', methods = [ 'GET']) 
def retSummary(): 
    if(request.method == 'GET'): 
        return render_template('1.html', data={})

if __name__ == '__main__': 
  
    app.run(host="localhost", port=5050, debug=True)