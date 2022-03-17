import random
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
    boundary_points: list[np.array]

    @staticmethod
    def bin_array(num: int, m: int) -> np.array:
        """Convert a positive integer num into an m-bit bit vector"""
        return np.array(list(np.binary_repr(num).zfill(m))).astype(np.int8)
    
    @staticmethod
    def calculateEdges(triangulation: Delaunay) -> set:
        """Get set of edges from the simplices"""
        edges = set()
        for simplex in triangulation.simplices:
            for i in range(simplex.shape[0]):
                for j in range(i + 1, simplex.shape[0]):
                    edges.add((simplex[i], simplex[j]))
        return edges

    def __init__(self, M: int, N: int):
        self.M = M
        self.N = N
        self.points = np.random.rand(self.M - 4, self.N)
        self.boundary_points = np.array([self.bin_array(i, self.N) for i in range(2**self.N)], dtype=float)
        self.points = np.concatenate(
            (
                self.points,
                self.boundary_points.copy()
            ), axis=0
        )
        self.triangulation = Delaunay(self.points)
        self.edges = self.calculateEdges(self.triangulation)
        self.characteristic_distance = 0
    
    def update(self):
        self.triangulation = Delaunay(self.points)
        self.edges = self.calculateEdges(self.triangulation)

    def evaluate(self, f: callable):
        # f = lambda point: random.random()
        good = 0
        sum_distance = 0
        for edge in self.edges:
            a = self.points[edge[0]]
            b = self.points[edge[1]]
            midPoint = (a + b) / 2
            distance = np.linalg.norm(a - b)
            sum_distance += distance
            PecletNumber = abs(f(midPoint) * distance)

            if PecletNumber < 2:
                good += 1
            
        self.characteristic_distance = sum_distance / self.points.shape[0]

        return good / len(self.edges)

    def RandomWiggle(self):
        for point in self.points:
            if not np.any(np.all(point == self.boundary_points, axis=1)):
                if random.random() < 0.25:
                    offset = np.random.uniform(low=-self.characteristic_distance, high=self.characteristic_distance, size=(self.N,))
                    point += offset
                    if not ((np.zeros(point.shape) < point).min() and (point < np.ones(point.shape)).min()):
                        point -= offset     # вернули обратно
        self.triangulation = None
        self.edges = None
    
    def Add(self):
        for _ in range(self.M):
            if random.random() < 0.01:
                point = np.random.rand(self.N)
                self.points = np.vstack((self.points, point))
                self.M += 1
        self.triangulation = None
        self.edges = None
    
    def Remove(self):
        for _ in range(self.M):
            if random.random() < 0.01:
                point = random.choice(self.points)
                if not np.any(np.all(point == self.boundary_points, axis=1)):
                    self.points = np.delete(self.points, np.argwhere(self.points == point))
                    self.M -= 1
        self.triangulation = None
        self.edges = None

    def Mutate(self):
        self.RandomWiggle()
        # self.Add()
        # self.Remove()
        self.update()
