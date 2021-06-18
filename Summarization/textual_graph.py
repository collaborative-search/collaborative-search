def count_similar_words(a, b):
    ans = 0
    for i in range(len(a)):
        if a[i] in b:
            ans = ans + 1
    return ans

def _count_common_words(words_sentence_one, words_sentence_two):
    return len(set(words_sentence_one) & set(words_sentence_two))

def _get_similarity(words_sentence_one, words_sentence_two):

    common_word_count = _count_common_words(words_sentence_one, words_sentence_two)

    return common_word_count 

edges = []
def has_edge(sentence1,sentence2):
    edge = (sentence1,sentence2)
    return edge in edges


def find_similarity(sentence1,sentence2,graph):
    similarity = _get_similarity(sentence1, sentence2)
    return similarity

def create_graph(text):
    graph = [[0 for x in range(len(text))] for y in range(len(text))]
    for i in range(0,len(text)):
        sentence_i = text[i].split(' ')
        for j in range(i+1,len(text)):
            sentence_j = text[j].split(' ')
            graph[i][j] = find_similarity(sentence_i,sentence_j,graph)
            edges.append((text[i],text[j]))
    return graph
# def count_similar_words(a, b):
#     ans = 0
#     for i in range(len(a)):
#         if a[i] in b:
#             ans = ans + 1
#     return ans

# def create_graph(text):
#     graph = [[0 for x in range(len(text))] for y in range(len(text))]
#     for i in range(0, len(text)):
#         word_vector_i = text[i].split(' ')
#         for j in range(i+1, len(text)):
#             word_vector_j = text[j].split(' ')
#             similarity = count_similar_words(word_vector_i, word_vector_j)
#             if(similarity > 0):
#                graph[i][j] = similarity
#     return graph




