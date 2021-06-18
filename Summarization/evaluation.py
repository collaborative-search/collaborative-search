from rouge import Rouge 
import runner
from summa.summarizer import summarize
import retrive_text
from tqdm import tqdm

document = []

# with open("dataset/val.txt.src","r") as input:
#     for _ in range(0,1):
#         document.append(input.readline())
    # document += input.readline()


rouge = Rouge()
p_sum = 0
r_sum = 0
count = 0
document = retrive_text.retrive_text()
for i in tqdm(range(0,1)):
    our_summary = runner.runner(document)
    ref_summary = summarize(document, words=500)
    with open('our_summary.txt', 'w') as writer:
        writer.write(our_summary)

    with open('ref_summary.txt', 'w') as writer:
        writer.write(ref_summary)
    print(i+1,"summary completed")
    try:
        scores = rouge.get_scores(our_summary,ref_summary)[0]['rouge-1']
        #print(i+1,"rouge completed")
        p_sum += scores['p']
        r_sum += scores['r']
        count+=1
    except:
        pass

print('Precision is ',(p_sum/count)*100)
print('Recall is ',(r_sum/count)*100)
