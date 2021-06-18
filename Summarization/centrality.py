import networkx as nx 
import matplotlib.pyplot as plt
from networkx.algorithms.clique import find_cliques as maximal_cliques

def node_centrality(graph):
    G = nx.Graph()

    nodes = [ i for i in range(len(graph)) ]

    for i in range (len(nodes)):
        for j in range (len(nodes)):
            if graph[i][j] > 0:
                G.add_edge(i,j,weight=graph[i][j])

    try :
        centrality = nx.eigenvector_centrality(G,weight='weight')
    except :
        centrality = { i:0 for i in range (len(graph)) }

    return centrality
