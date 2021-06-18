import textual_graph
import MIS_algorithm
import MIS_nx
import MAK
import centrality
import show_graph
from summa.preprocessing.textcleaner import clean_text_by_sentences as _clean_text_by_sentences


def remove_stop_words(input_text):
    dummy_text = _clean_text_by_sentences(input_text,"english")
    sentences = [text.text for text in dummy_text]
    return sentences

def runner(text):
    MAK_text = MAK.MAK(text)
    #print(len(MAK_text))
    #print("MAK text")
    #print(MAK_text)
    initial_graph = textual_graph.create_graph(MAK_text)
    #show_graph.show_graph(initial_graph)
    #print(initial_graph)
    #print("start1")
    maximalIndependentSet = MIS_nx.return_independent_set(initial_graph)
    #print(maximalIndependentSet)
    final_sentences = []
    final_MAK_text = []
    #print(text)
    sentences = remove_stop_words(text)
    #print(sentences[0],MAK_text[0])
    #print(maximalIndependentSet)

    maximalIndependentSet = list(maximalIndependentSet)
    #print(maximalIndependentSet)

    for i in range(len(MAK_text)):
        if(i not in maximalIndependentSet):
            final_sentences.append(sentences[i])
            final_MAK_text.append(MAK_text[i])



    #print("start2")
    final_graph = textual_graph.create_graph(final_sentences)
    #show_graph.show_graph(final_graph)

    C  = centrality.node_centrality(final_graph)
    #print(C)
    dest_summary_wc = len(text.split())//5
    # print(dest_summary_wc)
    #print("Length",len(text.split())//4)
    #dest_summary_wc = len(text.split())//6
    #dest_summary_wc = 500
    C_sorted = dict(sorted(C.items(), key=lambda item: item[1],reverse=True))
    #print(C_sorted)
    final_sentences_ind = []

    for key,value in C_sorted.items():
        dest_summary_wc -= len(final_sentences[key].split(' '))
        if(dest_summary_wc < 0):
            break
        final_sentences_ind.append(key)
        
    final_sentences_ind.sort()

    final_summary = []
    for ind in final_sentences_ind:
        final_summary.append(final_sentences[ind])

    return "\n".join([sentence for sentence in final_summary])
    # return final_summary 









