import random, copy
from dataclasses import dataclass
from turtle import pos, position
from typing import Callable

import numpy as np
from scipy.spatial import Delaunay
from scipy.optimize import fsolve

@dataclass
class PointSystem:

    points: list[np.ndarray]
    edges: set[tuple]
    
    N: int                          # number of dimensions
    position: np.ndarray            # position of the center of the rectangle
    size: np.ndarray                # size of each dimension

    V: Callable[[np.ndarray], np.ndarray]
    K: Callable[[np.ndarray], float]

    alphas: np.ndarray

    # def equations(self, vars):
    #     x, y, aX, aY = vars

    #     X, Y = self.position[0], self.position[1]
    #     width, height = self.size[0], self.size[1]
    #     x1, y1 = X - width/2, Y - height/2
    #     x2, y2 = X + width/2, Y + height/2
    #     nx = np.array([1, 0])
    #     ny = np.array([0, 1])

    #     eq1 = ( np.dot(self.V(np.array([(x2+x)/2, y])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2, y])) - aX
    #     eq2 = ( np.dot(self.V(np.array([(x1+x)/2, y])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2, y])) - aX
    #     eq3 = ( np.dot(self.V(np.array([x, (y2+y)/2])), ny) * np.abs(y2-y) ) / self.K(np.array([x, (y2+y)/2])) - aY
    #     eq4 = ( np.dot(self.V(np.array([x, (y1+y)/2])), -ny) * np.abs(y-y1) ) / self.K(np.array([x, (y1+y)/2])) - aY

    #     return [eq1, eq2, eq3, eq4]

    def __init__(self, N: int, position: np.ndarray, size: np.ndarray, V: Callable[[np.ndarray], np.ndarray], K: Callable[[np.ndarray], float]):

        if N == 2:

            self.N = 2
            self.V = V
            self.K = K
            self.position = position
            self.size = size
            
            x, y = position[0], position[1]
            width, height = size[0], size[1]
            x1, y1 = x - width/2, y - height/2
            x2, y2 = x + width/2, y + height/2
            nx = np.array([1, 0])
            ny = np.array([0, 1])
            
            # X, Y, alphaX, alphaY = fsolve(self.equations, (position[0], position[1], 1.9, 1.9))

            self.points = set()

            self.points.add((x1, y1))
            self.points.add((x1, y2))
            self.points.add((x2, y1))
            self.points.add((x2, y2))

            self.points.add((x1, y))
            self.points.add((x, y2))
            self.points.add((x, y1))
            self.points.add((x2, y))

            self.points.add((x, y))

            self.alphas = np.abs(np.array([
                ( np.dot(self.V(np.array([(x2+x)/2, y])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2, y])),
                ( np.dot(self.V(np.array([(x1+x)/2, y])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2, y])),
                ( np.dot(self.V(np.array([x, (y2+y)/2])), ny) * np.abs(y2-y) ) / self.K(np.array([x, (y2+y)/2])),
                ( np.dot(self.V(np.array([x, (y1+y)/2])), -ny) * np.abs(y-y1) ) / self.K(np.array([x, (y1+y)/2]))
            ]))

        else:
            raise NotImplementedError
        
    def isValid(self) -> bool:
        """ Checks if Peclet numbers meet requirements """
        return np.max(self.alphas) < 2
    
    def propagate(self):
        
        if self.N == 2:

            if self.isValid():
                return
            else:

                PSs = [
                    PointSystem(self.N, np.array([self.position[0] - self.size[0]/4, self.position[1] - self.size[1]/4]), self.size/2, self.V, self.K),
                    PointSystem(self.N, np.array([self.position[0] + self.size[0]/4, self.position[1] - self.size[1]/4]), self.size/2, self.V, self.K),
                    PointSystem(self.N, np.array([self.position[0] - self.size[0]/4, self.position[1] + self.size[1]/4]), self.size/2, self.V, self.K),
                    PointSystem(self.N, np.array([self.position[0] + self.size[0]/4, self.position[1] + self.size[1]/4]), self.size/2, self.V, self.K)
                ]

                for PS in PSs:
                    if not PS.isValid(): PS.propagate()
                    self.points = self.points | PS.points

