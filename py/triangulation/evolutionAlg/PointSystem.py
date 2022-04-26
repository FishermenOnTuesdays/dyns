import random, copy
from dataclasses import dataclass

import numpy as np
from scipy.spatial import Delaunay

@dataclass
class PointSystem:
    points: np.array
    triangulation: Delaunay
    edges: set[tuple]
    characteristic_distance: float
    N: int
    M: int
    boundary_points: np.array
    last_evaluation: float
    min_edge_length: float

    edges_dict: dict

    @staticmethod
    def bin_array(num: int, m: int) -> np.array:
        """Convert a positive integer num into an m-bit bit vector"""
        return np.array(list(np.binary_repr(num).zfill(m))).astype(np.int8)
    
    @staticmethod
    def calculateEdges(triangulation: Delaunay) -> tuple[set, dict]:
        """Get set of edges from the simplices"""
        edges = set()
        edges_dict = dict()
        for simplex in triangulation.simplices:
            for i in range(simplex.shape[0]):
                for j in range(i + 1, simplex.shape[0]):
                    a = simplex[i]
                    b = simplex[j]
                    edges.add((a, b))
                    if not (a in edges_dict):
                        edges_dict[a] = set()
                    if not (b in edges_dict):
                        edges_dict[b] = set()
                    edges_dict[a].add(b)
                    edges_dict[b].add(a)
        return edges, edges_dict

    def __init__(self, M: int, N: int, square_grid=False):
        self.M = M
        self.N = N
        self.boundary_points = np.array([self.bin_array(i, self.N) for i in range(2**self.N)], dtype=float)

        if square_grid:
            h = 1/(np.sqrt(M) - 1)
            points = list()
            for i in np.arange(0, 1 + h, h):
                for j in np.arange(0, 1 + h, h):
                    point = [i, j]
                    points.append(point)
            self.points = np.array(points)
        else:
            self.points = np.random.rand(self.M - 2**self.N, self.N)
            self.points = np.concatenate(
                (
                    self.points,
                    self.boundary_points
                ), axis=0
            )
        
        self.triangulation = Delaunay(self.points)
        self.edges, self.edges_dict = self.calculateEdges(self.triangulation)
        self.characteristic_distance = None
        self.last_evaluation = None
        self.min_edge_length = None
    
    def update(self):
        self.triangulation = Delaunay(self.points)
        self.edges = self.calculateEdges(self.triangulation)

    def evaluate(self, f: callable) -> float:
        # f = lambda point: random.random()
        # good = 0
        sum_distance = 0
        max_PN = 0
        for edge in self.edges:
            a = self.points[edge[0]]
            b = self.points[edge[1]]
            midPoint = (a + b) / 2
            distance = np.linalg.norm(a - b)
            sum_distance += distance
            PecletNumber = abs(f(midPoint) * distance)
            if PecletNumber > max_PN:
                max_PN = PecletNumber
            if self.min_edge_length == None or distance < self.min_edge_length:
                self.min_edge_length = distance
            # if PecletNumber < 2:
            #     good += 1
            
        self.characteristic_distance = sum_distance / self.M
        # self.characteristic_distance = 1 / self.M ** 2 * np.pi

        # return np.log(good / len(self.edges))
        # self.last_evaluation = good / len(self.edges)
        self.last_evaluation = max_PN
        return self.last_evaluation
    
    @staticmethod
    def grad(f: callable, X: float, h: float):
        res = np.zeros(X.shape)
        for index in range(X.shape[0]):
            xa, xb = copy.deepcopy(X), copy.deepcopy(X)
            xa[index] += h/2
            xb[index] -= h/2
            fa = f(xa)
            fb = f(xb)
            res[index] = (fa - fb)/h
        return res

    def RandomWiggle(self, f: callable):
        for point in self.points:
            if not (point in self.boundary_points):
                if random.random() < 0.1:
                    random_offset = np.random.uniform(low=-self.characteristic_distance/np.pi**3, high=self.characteristic_distance/np.pi**3, size=(self.N,))
                    grad_offset = self.grad(f, point, self.min_edge_length / 100) * np.linalg.norm(random_offset) / 10
                    offset = random_offset + grad_offset
                    point += offset
                    if not ((np.zeros(point.shape) < point).min() and (point < np.ones(point.shape)).min()):
                        # ставим на границу за которую вышел
                        point[point > 1] = 1
                        point[point < 0] = 0
                        # point -= offset     # вернули обратно
        self.triangulation = None
        self.edges = None
    
    def Add(self):
        for _ in range(self.M):
            if random.random() < 0.05:
                point = np.random.rand(self.N)
                self.points = np.vstack((self.points, point))
                self.M += 1
        self.triangulation = None
        self.edges = None
    
    def Remove(self):
        for _ in range(self.M):
            if random.random() < 0.05:
                i = random.choice(range(self.M))
                point = self.points[i]
                if not(point in self.boundary_points):
                    self.points = np.delete(self.points, i, axis = 0)
                    self.M -= 1
        self.triangulation = None
        self.edges = None

    def Mutate(self, f: callable):
        self.RandomWiggle(f)
        # if self.last_evaluation < 1:
        self.Add()
        self.Remove()
        self.update()
