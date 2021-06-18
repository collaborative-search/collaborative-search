def graphSets(graph):
    if(len(graph) == 0):
        return []

    if(len(graph) == 1):
        return [list(graph.keys())[0]]

    vCurrent = list(graph.keys())[0]

    graph2 = dict(graph)

    del graph2[vCurrent]

    res1 = graphSets(graph2)
    for v in graph[vCurrent]:
        if(v in graph2):
            del graph2[v]

    res2 = [vCurrent] + graphSets(graph2)
    if(len(res1) > len(res2)):
        return res1
    return res2

def return_independent_set(A):
    V = len(A)
    E = []
    for i in range(len(A)):
        for j in range(i+1, len(A)):
            if(A[i][j] > 0):
                E.append((i, j))
    graph = dict([])
    for i in range(len(E)):
        v1, v2 = E[i]

        if(v1 not in graph):
            graph[v1] = []
        if(v2 not in graph):
            graph[v2] = []

        graph[v1].append(v2)
        graph[v2].append(v1)

    maximalIndependentSet = graphSets(graph)
    return maximalIndependentSet
