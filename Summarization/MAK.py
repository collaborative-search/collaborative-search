from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tokenize.treebank import TreebankWordDetokenizer
from nltk.stem import PorterStemmer 
from preprocessing.textcleaner import clean_text_by_sentences as _clean_text_by_sentences


def find_alternative(word, index, words):
    ps = PorterStemmer()
    # n=2
    # for i in range(index):
    #     if(word[:n] == words[i][:n]):
    #         return words[i]
    # return word
    return ps.stem(word)
    
# def remove_stop_words_(sentence):

#     stop_words = set(stopwords.words('english'))
#     word_tokens = word_tokenize(sentence)
#     filtered_sentence = []
#     for w in word_tokens:
#         if w not in stop_words:
#             filtered_sentence.append(w)
#     filtered_sentence = TreebankWordDetokenizer().detokenize(filtered_sentence)
#     return filtered_sentence

def remove_stop_words(input_text):
    dummy_text = _clean_text_by_sentences(input_text,"english")
    sentences = [text.token for text in dummy_text]
    return sentences


def MAK(input_text):

    #sentences = input_text.split('.')

    #dummy = _clean_text_by_sentences(input_text,"english")
    #print(dummy)
    sentences = remove_stop_words(input_text)
    #print(sentences)

    # graph = _build_graph(sentences)
    # _set_graph_edge_weights(graph)
    # _remove_unreachable_nodes(graph)

    # print(list(graph.edge_properties.keys()))

    # for c in range(len(sentences)):
    #     sentences[c] = remove_stop_words(sentences[c])
    #sentences = dummy1.copy()
    MAK_text = sentences.copy()

    words = []
    for sentence in sentences:
        words.extend(sentence.split(' '))

    # index = 0
    # for i in range(len(MAK_text)):
    #     words_i = MAK_text[i].split(' ')
    #     for j in range(len(words_i)):
    #         words_i[j] = find_alternative(words_i[j],index,words)
    #         index += 1
    #     MAK_text[i] = TreebankWordDetokenizer().detokenize(words_i)
    return MAK_text


