import networkx as nx 
import matplotlib.pyplot as plt
from networkx.algorithms.clique import find_cliques as maximal_cliques

def show_graph(graph):
    G = nx.Graph()

    nodes = [ i for i in range(len(graph)) ]

    for i in range (len(nodes)):
        for j in range (len(nodes)):
            if graph[i][j] > 0:
                G.add_edge(i,j,weight=graph[i][j])
    
    plt.subplot(121)
    nx.draw(G, with_labels=True, font_weight='bold')
    plt.show()
    return
