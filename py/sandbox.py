import numpy as np
import matplotlib.pyplot as plt
import dyns

functions = [
    ("cos(x)", "x"),
    ("sin(x)", "x"),
    ("1 - cos(x) - sin(x)", "x")
]
boundaries = [
    [-1, 1, 0],
    [ 0, 1, 1.3818]
]
boundaries = np.asarray(boundaries)

for i in range(2):
    for j in range(3):
        l = []
        for p in range(-10, 10):
            boundaries = [
                [-1, 1, 0],
                [ 0, 1, 1.3818]
            ]
            boundaries[i][j] = p
            solver = dyns.SecondOrderODESolver(functions, boundaries, (0, 1), 100)
            #print(solver.GetSolution())
            MatrixForSolution = solver.GetMatrixForSolution()
            #print(MatrixForSolution)
            c = np.linalg.cond(MatrixForSolution)
            l.append(c)
            #print(solver.GetConditionNumber())
        plt.plot([p for p in range(-10, 10)], l, label='B'+str(i)+str(j))
        plt.legend(loc='best')
        #plt.xlabel('x')
        plt.grid()
plt.show()