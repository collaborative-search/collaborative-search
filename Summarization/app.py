from flask import Flask, jsonify, request 
import runner
import retrive_text
from flask.templating import render_template
from flask_cors import CORS
import json
import pickle


app = Flask(__name__)
CORS(app)

with open ('tfidf.pickle','rb') as f:
    tfidf = pickle.load(f)

with open ('classifier.pickle','rb') as f:
    model = pickle.load(f)


  
@app.route('/summary/url', methods = [ 'POST']) 
def home(): 
    if(request.method == 'POST'): 
        body = request.get_json()
        urls = body['urls']
        summary = ""
        sum_dict= {'business':'','tech':'','politics':'','sport':'','entertainment':''}
        for i in range(len(urls)):
            print("COUNT",i)
            document = retrive_text.retrive_text(urls[i])
            summary = runner.runner(document)
            features = tfidf.transform([summary])

            prediction = model.predict(features)
            id_to_category = {0: 'business', 1: 'tech', 2: 'politics', 3: 'sport', 4: 'entertainment'}
            typ = ''
            print('######################################')
            print(prediction)
            print('######################################')
            
            typ = id_to_category[prediction[0]]

            sum_dict[typ] += summary
            # with open('our_summary.txt', 'w') as writer:
            #     writer.write(summary)
        # return render_template('index.html', data={"summary":summary})
        return jsonify({'business':sum_dict['business'],
                        'tech':sum_dict['tech'],
                        'politics':sum_dict['politics'],
                        'sports':sum_dict['sport'],
                        'entertainment':sum_dict['entertainment']})

@app.route('/summary', methods = [ 'GET']) 
def retSummary(): 
    if(request.method == 'GET'): 
        #body = request.get_json()
        urls = request.args.get('url')
        #print(urls)
        summary = ""
        document = retrive_text.retrive_text(urls)
        summary += runner.runner(document)
        # with open('our_summary.txt', 'w') as writer:
        #     writer.write(summary)
        return render_template('index.html', data={"summary":summary})

        #return jsonify({"summary":summary})
@app.route('/summary/show', methods = [ 'GET']) 
def showSummary(): 
    if(request.method == 'GET'): 
        #body = request.get_json()
        business = request.args.get('business')
        tech = request.args.get('tech')
        politics = request.args.get('politics')
        sports = request.args.get('sports')
        entertainment = request.args.get('entertainment')

        data = {}
        if(len(business)>1):
            data['business'] = business
        if(len(tech)>1):
            data['tech'] = tech
        if(len(politics)>1):
            data['politics'] = politics
        if(len(sports)>1):
            data['sports'] = sports
        if(len(entertainment)>1):
            data['entertainment'] = entertainment
        

        # print("#################################")
        # obj = json.loads(summary)
        # print(obj['show'])
        # print("#################################")
        # print(summary)
        # with open('our_summary.txt', 'w') as writer:
        #     writer.write(summary)
        return render_template('multi.html', data=data)

# @app.route('/summary/text/single', methods = [ 'POST']) 
# def home(): 
#     if(request.method == 'POST'): 
#         input_text = request.get_json()
#         summary = runner.runner(input_text['text'])
#         return jsonify({"summary":summary})
  
if __name__ == '__main__': 
  
    app.run(debug = True)