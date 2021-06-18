import networkx as nx
from networkx.algorithms.approximation.independent_set import maximum_independent_set
from networkx.algorithms.mis import maximal_independent_set


def choose_best_MIS(G):
    maximum = maximum_independent_set(G)
    maximal_sets = [maximal_independent_set(G) for _ in range(0,10)]
    maxLen = len(maximum)
    index = -1
    for i in range(0,len(maximal_sets)):
        if(len(maximal_sets[i]) > maxLen):
            maxLen = len(maximal_sets[i])
            index = i
    if(index != -1):
        #print("Hi")
        return maximal_sets[index]
    return maximum


def return_independent_set(graph): 
    G = nx.Graph()
    nodes = [ i for i in range(len(graph)) ]
    for i in range (len(graph)):
        for j in range (len(graph)):
            if graph[i][j] > 0:
                G.add_edge(i,j)

    #MIS = choose_best_MIS(G)
    #print(MIS)
    return maximum_independent_set(G)