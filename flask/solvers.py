import numpy as np
from scipy.optimize import fsolve
# from joblib import Parallel, delayed
# from numba import jit

# @jit
def TwoDimensionalHeatEquation(
    q_x, k_x, q_y, k_y, f, a: float, b: float, c: float, d: float, T: float, mu_a, mu_b, mu_c, mu_d, u0,
    h_x: float, h_y: float, tau: float
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:

    # k_x = lambda x, y : 1
    # k_y = lambda x, y : 1
    # q_x = lambda x, y : 1
    # q_y = lambda x, y : 1

    # f = lambda x, y, t : 0

    # mu_a = lambda y, t : 0
    # mu_b = lambda y, t : 0
    # mu_c = lambda x, t : 0
    # mu_d = lambda x, t : 0

    # u0 = lambda x, y : 1

    # tau = 0.01
    # h_x = 0.05
    # h_y = 0.05
    M = int(T/tau) + 1
    N_x = int((b-a)/h_x) + 1
    N_y = int((d-c)/h_y) + 1
    U = np.zeros((M, N_x, N_y))
    Xs = np.linspace(a, b, N_x)
    Ys = np.linspace(c, d, N_y)
    Ts = np.linspace(0, T, M)

    for i in range(N_x):
        for j in range(N_y):
            U[0][i][j] = u0(Xs[i], Ys[j])

    A = np.zeros((N_x, N_x))
    B = np.zeros(N_x)

    for n in range(1, M):
        U_half = np.zeros((N_x, N_y))
        for j in range(0, N_y):
            if j == 0:
                U_half[:,0] = np.fromiter(map(lambda x : mu_c(x, Ts[n]), Xs), float)
            elif j == N_y - 1:
                U_half[:,N_y - 1] = np.fromiter(map(lambda x : mu_d(x, Ts[n]), Xs), float)
            else:
                A.fill(0)
                B.fill(0)
                for i in range(0, N_x):
                    if i == 0:
                        A[0][0] = 1
                        B[0] = mu_a(Ys[j], Ts[n])
                    elif i == N_x-1:
                        A[N_x - 1][N_x - 1] = 1
                        B[N_x - 1] = mu_b(Ys[j], Ts[n])
                    else:
                        A[i][i-1] = tau/2/h_x**2*q_x(Xs[i], Ys[j])*k_x((Xs[i]+Xs[i-1])/2, Ys[j])
                        A[i][i] = -(1 + tau/2/h_x**2*q_x(Xs[i], Ys[j])*(k_x((Xs[i]+Xs[i+1])/2, Ys[j]) + k_x((Xs[i]+Xs[i-1])/2, Ys[j])))
                        A[i][i+1] = tau/2/h_x**2*q_x(Xs[i], Ys[j])*k_x((Xs[i]+Xs[i+1])/2, Ys[j])
                        B[i] = -(U[n-1][i][j] + tau/2 * (f(Xs[i], Ys[j], (Ts[n]+Ts[n-1])/2) + q_y(Xs[i], Ys[j])/h_y**2*(k_y(Xs[i], (Ys[j]+Ys[j+1])/2)*(U[n-1][i][j+1] - U[n-1][i][j]) - k_y(Xs[i], (Ys[j]+Ys[j-1])/2)*(U[n-1][i][j] - U[n-1][i][j-1]))))
                U_half[:,j] = np.linalg.solve(A, B)
        
        for i in range(0, N_x):
            if i == 0:
                U[n][0] = np.fromiter(map(lambda y : mu_a(y, Ts[n]), Ys), float)
            elif i == N_x - 1:
                U[n][N_x - 1] = np.fromiter(map(lambda y : mu_b(y, Ts[n]), Ys), float)
            else:
                A.fill(0)
                B.fill(0)
                for j in range(0, N_y):
                    if j == 0:
                        A[0][0] = 1
                        B[0] = mu_c(Xs[i], Ts[n])
                    elif j == N_y-1:
                        A[N_y - 1][N_y - 1] = 1
                        B[N_y - 1] = mu_d(Xs[i], Ts[n])
                    else:
                        A[j][j-1] = tau/2/h_y**2*q_y(Xs[i], Ys[j])*k_y(Xs[i], (Ys[j]+Ys[j-1])/2)
                        A[j][j] = -(1 + tau/2/h_y**2*q_y(Xs[i], Ys[j])*(k_y(Xs[i], (Ys[j]+Ys[j-1])/2) + k_y(Xs[i], (Ys[j]+Ys[j+1])/2)))
                        A[j][j+1] = tau/2/h_y**2*q_y(Xs[i], Ys[j])*k_y(Xs[i], (Ys[j]+Ys[j+1])/2)
                        B[j] = -(U_half[i][j] + tau/2 * (f(Xs[i], Ys[j], Ts[n]) + q_x(Xs[i], Ys[j])/h_x**2*(k_x((Xs[i] + Xs[i+1])/2, Ys[j])*(U_half[i+1][j] - U_half[i][j]) - k_x((Xs[i]+Xs[i-1])/2, Ys[j])*(U_half[i][j] - U_half[i-1][j]))))
                U[n][i] = np.linalg.solve(A, B)
    
    return U, Xs, Ys, Ts

    # # a = 0
    # # b = 1
    # # c = 0
    # # d = 1
    # # T = 2
    # # tau = 0.01
    # # h_x = 0.05
    # # h_y = 0.05
    # M = int(T/tau) + 1
    # N_x = int((b-a)/h_x) + 1
    # N_y = int((d-c)/h_y) + 1
    # U = np.zeros((M, N_x, N_y))
    # Xs = np.linspace(a, b, N_x)
    # Ys = np.linspace(c, d, N_y)
    # Ts = np.linspace(0, T, M)

    # for i in range(N_x):
    #     for j in range(N_y):
    #         U[0][i][j] = U0(Xs[i], Ys[j])

    # for n in range(1, M):
    #     U_half = np.zeros((N_x, N_y))
    #     for j in range(0, N_y):
    #         if j == 0:
    #             U_half[:,0] = np.zeros(N_x)
    #         elif j == N_y - 1:
    #             U_half[:,N_y - 1] = np.zeros(N_x)
    #         else:
    #             A = np.zeros((N_x, N_x))
    #             B = np.zeros(N_x)
    #             for i in range(0, N_x):
    #                 if i == 0:
    #                     A[0][0] = 1
    #                     B[0] = 0
    #                 elif i == N_x-1:
    #                     A[N_x - 1][N_x - 1] = 1
    #                     B[N_x - 1] = 0
    #                 else:
    #                     A[i][i-1] = tau/2/h_x**2
    #                     A[i][i] = -(tau/h_x**2 + 1)
    #                     A[i][i+1] = tau/2/h_x**2
    #                     B[i] = -(tau/2/h_y**2*(U[n-1][i][j+1]-2*U[n-1][i][j]+U[n-1][i][j-1]) + U[n-1][i][j])
    #             U_half[:,j] = np.linalg.solve(A, B)
    #     for i in range(0, N_x):
    #         if i == 0:
    #             U[n][0] = np.zeros(N_y)
    #         elif i == N_x - 1:
    #             U[n][N_x - 1] = np.zeros(N_y)
    #         else:
    #             A = np.zeros((N_y, N_y))
    #             B = np.zeros(N_y)
    #             for j in range(0, N_y):
    #                 if j == 0:
    #                     A[0][0] = 1
    #                     B[0] = 0
    #                 elif j == N_y-1:
    #                     A[N_y - 1][N_y - 1] = 1
    #                     B[N_y - 1] = 0
    #                 else:
    #                     A[j][j-1] = tau/2/h_y**2
    #                     A[j][j] = -(tau/h_y**2 + 1)
    #                     A[j][j+1] = tau/2/h_y**2
    #                     B[j] = -(tau/2/h_x**2*(U_half[i+1][j]-2*U_half[i][j]+U_half[i-1][j]) + U_half[i][j])
    #             U[n][i] = np.linalg.solve(A, B)
    
    # return U, Xs, Ys, Ts