from typing import Callable
import numpy as np
from scipy.optimize import fsolve
from scipy.sparse import csr_matrix
# from joblib import Parallel, delayed
# from numba import jit
MACHINE_EPSILON = np.finfo(float).eps

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

    for n in range(1, M):
        U_half = np.zeros((N_x, N_y))
        for j in range(0, N_y):
            if j == 0:
                U_half[:,0] = np.fromiter(map(lambda x : mu_c(x, Ts[n]), Xs), float)
            elif j == N_y - 1:
                U_half[:,N_y - 1] = np.fromiter(map(lambda x : mu_d(x, Ts[n]), Xs), float)
            else:
                A = np.zeros((N_x, N_x))
                B = np.zeros(N_x)
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
                A = np.zeros((N_y, N_y))
                B = np.zeros(N_y)
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
    U = np.array(list(map(np.transpose, [ut for ut in U])))
    return U, Xs, Ys, Ts

def ParabolicPartialDifferentialEquation(q, k, f, phi, mu_a, mu_b, a: float, b: float, T: float, h: float, tau: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:

    REFINING_ITERATIONS_NUMBER = 32

    def ABCD(Un, Un_1, xs, k, q, f, mu_a, mu_b, t, tau, h, N):

        A = np.zeros(N)
        B = np.zeros(N)
        C = np.zeros(N)
        D = np.zeros(N)

        # A[0] = 0
        # B[0] = 1
        # C[0] = 0
        # D[0] = mu_a(t)

        A[0] = mu_a[1](t) - 1.5 * mu_a[0](t) / h
        B[0] = 1 + 2 * mu_a[0](t) / h
        C[0] = -mu_a[0](t) / (2 * h)
        D[0] = mu_a[2](t)

        A[1: -1] = np.fromiter(map(lambda i: (-1) * tau * q(Un[i], xs[i], t) / (2 * h**2) * (k(Un[i], xs[i], t) + k(Un[i-1], xs[i], t)), range(1, N-1)), float)
        B[1: -1] = np.fromiter(map(lambda i: 1 + tau * q(Un[i], xs[i], t) / (2 * h**2) * (k(Un[i+1], xs[i], t) + 2 * k(Un[i], xs[i], t) + k(Un[i-1], xs[i], t)), range(1, N-1)), float)
        C[1: -1] = np.fromiter(map(lambda i: (-1) * tau * q(Un[i], xs[i], t) / (2 * h**2) * (k(Un[i+1], xs[i], t) + k(Un[i], xs[i], t)), range(1, N-1)), float)
        D[1: -1] = np.fromiter(map(lambda i: Un_1[i] + tau * f(Un[i], xs[i], t), range(1, N-1)), float)

        # A[-1] = 0
        # B[-1] = 1
        # C[-1] = 0
        # D[-1] = mu_b(t)

        last_h = xs[-1]
        A[-1] = mu_b[0](t) * last_h / (h * (h + last_h))
        B[-1] = 1 - mu_b[0](t) * (h + last_h) / (h * last_h)
        C[-1] = mu_b[1](t) + mu_b[0](t) * (2 * last_h + h) / (last_h * (h + last_h))
        D[-1] = mu_b[2](t)

        return A, B, C, D

    def TDMA(A, B, C, D):
        '''TriDiagonal Matrix Algorithm, also known as the Thomas algorithm, a simplified form of Gaussian elimination.'''
        n = len(D)

        alpha = np.zeros(n)
        beta = np.zeros(n)

        for i in range(n):
            if i == 0:
                alpha[0] = (-1) * C[0] / B[0]
                beta[0] = D[0] / B[0]
            elif i < n-1:
                alpha[i] = (-1) * C[i] / (B[i] + A[i] * alpha[i - 1])
                beta[i] = (D[i] - A[i] * beta[i - 1]) / (B[i] + A[i] * alpha[i - 1])
            else:
                alpha[i] = 0
                beta[i] = (D[i] - A[i] * beta[i - 1]) / (B[i] + A[i] * alpha[i - 1])     

        Y = np.zeros(n)
        for i in range(n-1, -1, -1):
            if i == n-1:
                Y[i] = beta[n-1]
            else:
                Y[i] = beta[i] + alpha[i] * Y[i+1]

        return Y

    M = int(T/tau) + 1
    N = int((b-a)/h) + 1
    
    xs = np.linspace(a, b, N)
    ts = np.linspace(0, T, M)

    U = np.zeros((M, N))

    for m, t in enumerate(ts):
        if m == 0:
            U[0] = phi(xs)
        else:
            U[m] = U[m-1]
            for _ in range(REFINING_ITERATIONS_NUMBER):
                U[m] = TDMA(*ABCD(U[m], U[m-1], xs, k, q, f, mu_a, mu_b, t, tau, h, N))

    return U, xs, ts

def GaussianElimination(A: np.ndarray, b: np.ndarray) -> np.ndarray:
    '''Gaussian elimination without changing the input data'''
    # check if the matrix is square
    assert A.shape[0] == A.shape[1], 'Matrix is not square'
    # check if vector b is of the right size
    assert A.shape[0] == b.shape[0], 'Vector b is of the wrong size'
    # check if the matrix is not singular
    assert np.linalg.det(A) != 0, 'Matrix is singular'

    N = A.shape[0]

    # Forward elimination
    for k in range(N-1):
        for i in range(k+1, N):
            if A[i, k] != 0.0:
                lam = A[i, k]/A[k, k]
                A[i, k+1:N] = A[i, k+1:N] - lam*A[k, k+1:N]
                b[i] = b[i] - lam*b[k]
    # Back substitution
    for k in range(N-1, -1, -1):
        b[k] = (b[k] - np.dot(A[k, k+1:N], b[k+1:N]))/A[k, k]
    return b

def GaussianEliminationWithPivot(A: np.ndarray, b: np.ndarray) -> np.ndarray:
    '''Gaussian elimination with the choice of the pivot with the largest absolute value without changing the input data'''
    # check if the matrix is square
    assert A.shape[0] == A.shape[1], 'Matrix is not square'
    # check if vector b is of the right size
    assert A.shape[0] == b.shape[0], 'Vector b is of the wrong size'
    # check if the matrix is not singular
    assert np.linalg.det(A) != 0, 'Matrix is singular'

    N = A.shape[0]

    # Forward elimination
    for k in range(N-1):
        # Search the pivot
        p = np.argmax(np.abs(A[k:N, k])) + k
        assert A[p, k] != 0, 'Matrix is singular!'
        # Change the rows
        if p != k:
            A[[k, p]] = A[[p, k]]
            b[[k, p]] = b[[p, k]]
        # Elimination
        for i in range(k+1, N):
            if A[i, k] != 0.0:
                lam = A[i, k]/A[k, k]
                A[i, k+1:N] = A[i, k+1:N] - lam*A[k, k+1:N]
                b[i] = b[i] - lam*b[k]
    # Back substitution
    for k in range(N-1, -1, -1):
        b[k] = (b[k] - np.dot(A[k, k+1:N], b[k+1:N]))/A[k, k]
    return b

def Seidel(A: np.ndarray, b: np.ndarray, eps: float = MACHINE_EPSILON, max_it: int = 1000) -> np.ndarray:
    x = np.zeros(len(A))
    x_new = np.zeros(len(A))
    it = 0
    while it < max_it:
        for i in range(len(A)):
            x_new[i] = (b[i] - np.sum(A[i][:i] * x_new[:i]) - np.sum(A[i][i+1:] * x[i+1:])) / A[i][i] 
        if np.linalg.norm(x_new - x) < eps:
            break
        x = x_new.copy()
        it += 1
    else:
        raise ValueError('Method did not converge')
    return x

def Jacobi(A: np.ndarray, b: np.ndarray, eps: float = MACHINE_EPSILON, max_it: int = 1000) -> np.ndarray:
    x = x_new = np.zeros(len(A))
    D = np.diag(np.diag(A))
    it = 0
    while it < max_it:
        x_new = x + np.dot(np.linalg.inv(D), b - np.dot(A, x))
        if np.linalg.norm(x_new - x) < eps:
            break
        x = x_new.copy()
        it += 1
    else:
        raise ValueError('Method did not converge')
    return x

# Poisson equation
def min_error(A, b):
    x = np.zeros(len(b))
    A = csr_matrix(A)
    r = A.dot(x) - b
    while np.linalg.norm(r) > 10**(-5):
        r = A.dot(x) - b
        x -= r.dot(r) / r.dot(A.dot(r)) * r
    return x

def min_res(A, b):
    x = np.zeros(len(b))
    A = csr_matrix(A)
    r = A.dot(x) - b
    while np.linalg.norm(r) > 10**(-5):
        r = A.dot(x) - b
        Ar = A.dot(r)
        x -= Ar.dot(r) / Ar.dot(Ar) * r
    return x

def GetPoissonSLE(x_min, x_max, y_min, y_max, border_x_min, border_x_max, border_y_min, border_y_max, f, Nx, Ny):
    hx = (x_max - x_min) / (Nx - 1)
    hy = (y_max - y_min) / (Ny - 1)
    N1 = Nx - 2
    N2 = Ny - 2
    A = np.zeros((N1 * N2, N1 * N2))
    b = np.zeros(N1 * N2)
    for i in range(N2):
        for j in range(N1):
            k = i * N1 + j
            A[k, k] = 2 / hx**2 + 2 / hy**2
            if j > 0:
                A[k, k - 1] = -1/hx**2
            else:
                b[k] += 1/hx**2 * border_x_min(y_min + (i+1) * hy)
            if j < N1 - 1:
                A[k, k + 1] = -1/hx**2
            else:
                b[k] += 1/hx**2 * border_x_max(y_min + (i+1) * hy)
            if i > 0:
                A[k, k - N1] = -1/hy**2
            else:
                b[k] += 1/hy**2 * border_y_min(x_min + (j+1) * hx)
            if i < N2 - 1:
                A[k, k + N1] = -1/hy**2
            else:
                b[k] += 1/hy**2 * border_y_max(x_min + (j+1) * hx)
            b[k] += -f(x_min + (j+1) * hx, y_min + (i+1) * hy)
    return A, b

def PoissonEquationMakeFullSolution(
    x_min: float, x_max: float,
    y_min: float, y_max: float,
    border_x_min: Callable[[float], float], border_x_max: Callable[[float], float],
    border_y_min: Callable[[float], float], border_y_max: Callable[[float], float],
    f: Callable[[float, float], float],
    Nx: int, Ny: int,
    solveSLE: Callable[[np.ndarray, np.ndarray], np.ndarray] = np.linalg.solve
    ) -> np.ndarray:
    ''' Function to solve Poisson equation on rectangle '''
    hx = (x_max - x_min) / (Nx - 1)
    hy = (y_max - y_min) / (Ny - 1)
    N1 = Nx - 2
    N2 = Ny - 2
    A, b = GetPoissonSLE(x_min, x_max, y_min, y_max, border_x_min, border_x_max, border_y_min, border_y_max, f, Nx, Ny)
    u = solveSLE(A, b)
    U = np.zeros((Nx, Ny))
    for i in range(N2):
        for j in range(N1):
            U[j+1][i+1] = u[i * N1 + j]
    for i in range(Nx):
        U[i][0] = border_y_min(x_min + i * hx)
        U[i][Ny-1] = border_y_max(x_min + i * hx)
    for i in range(Ny):
        U[0][i] = border_x_min(y_min + i * hy)
        U[Nx-1][i] = border_x_max(y_min + i * hy)
    return U.T