import random, copy, sys
from dataclasses import dataclass
from turtle import pos, position
from typing import Any, Callable

import numpy as np
# from scipy.spatial import Delaunay
from scipy.optimize import fsolve
from scipy.optimize import minimize

@dataclass
class PointSystem:

    points: list[np.ndarray]
    edges: set[tuple]
    
    N: int                          # number of dimensions
    position: np.ndarray            # position of the center of the rectangle
    size: np.ndarray                # size of each dimension

    V: Callable[[np.ndarray], np.ndarray]
    K: Callable[[np.ndarray], float]

    max_edge: float

    alphas: np.ndarray
    alphasMiddle: np.ndarray
    eps: float

    res: any

    def equations1(self, vars):
        x = vars

        X = self.position[0]
        length = self.size[0]
        x1 = X - length/2
        x2 = X + length/2
        nx = np.array([1])

        # opt_f = lambda x: x if x < 2 else x**2 #np.exp(10000*(np.abs(x)-2)) + 1

        alpha1 = np.abs( ( np.dot(self.V(np.array([(x2+x)/2])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2])) )
        alpha2 = np.abs( ( np.dot(self.V(np.array([(x1+x)/2])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2])) )

        # return (alpha1 + alpha2) / 2
        
        # d1 = np.abs(x - x1)
        # d2 = np.abs(x2 - x)
        # return (alpha1/d1 + alpha2/d2) / 2

        return np.sqrt(alpha1 * alpha2)
        # return 1 / (1/alpha1+1/alpha2)

    def equations2(self, vars):
        x, y = vars

        X, Y = self.position[0], self.position[1]
        width, height = self.size[0], self.size[1]
        x1, y1 = X - width/2, Y - height/2
        x2, y2 = X + width/2, Y + height/2
        nx = np.array([1, 0])
        ny = np.array([0, 1])

        eq1 = ( np.dot(self.V(np.array([(x2+x)/2, y])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2, y]))
        eq2 = ( np.dot(self.V(np.array([(x1+x)/2, y])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2, y]))
        eq3 = ( np.dot(self.V(np.array([x, (y2+y)/2])), ny) * np.abs(y2-y) ) / self.K(np.array([x, (y2+y)/2]))
        eq4 = ( np.dot(self.V(np.array([x, (y1+y)/2])), -ny) * np.abs(y-y1) ) / self.K(np.array([x, (y1+y)/2]))

        return (eq1, eq2, eq3, eq4)

    def __init__(self, N: int, position: np.ndarray, size: np.ndarray, V: Callable[[np.ndarray], np.ndarray], K: Callable[[np.ndarray], float], eps: float):

        if N < 1: raise ValueError
        
        self.N = N
        self.V = V
        self.K = K
        self.position = position
        self.size = size
        self.eps = eps
        
        if N == 1 and False:    # robust optimization technology [FAILED miserably]

            x = position[0]
            length = size[0]
            x1 = x - length/2
            x2 = x + length/2
            nx = np.array([1])

            self.points = set()

            self.points.add(x1)
            self.points.add(x2)

            self.alphasMiddle = np.abs(np.array([
                ( np.dot(self.V(np.array([(x2+x)/2])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2])),
                ( np.dot(self.V(np.array([(x1+x)/2])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2]))
            ]))

            bnds = [ [x1, x2] ]

            self.res = minimize(self.equations1, np.array([x]), bounds=bnds)
            x = self.res.x[0]
            if x == x1 or x == x2:
                x = position[0]
            # if x == x2:
            #     x -= max((x1 + x2)/100, sys.float_info.epsilon)
            # if x == x1:
            #     x += max((x1 + x2)/100, sys.float_info.epsilon)
            self.points.add(x)

            self.max_edge = max(np.abs(x2-x), np.abs(x-x1))

            self.alphas = np.abs(np.array([
                ( np.dot(self.V(np.array([(x2+x)/2])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2])),
                ( np.dot(self.V(np.array([(x1+x)/2])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2]))
            ]))
        
        elif N == 1 and False:    # divide by golden ratio [FAILED] (works worse than division in the middle)

            m = position[0]
            length = size[0]

            x1 = m - length/2
            x2 = m + length/2

            phi = (np.sqrt(5) - 1) / 2
            x = x1 + length * phi

            nx = np.array([1])

            self.points = set()

            self.points.add(x1)
            self.points.add(x2)
            self.points.add(x)

            self.max_edge = max(np.abs(x2-x), np.abs(x-x1))

            self.alphas = np.abs(np.array([
                ( np.dot(self.V(np.array([(x2+x)/2])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2])),
                ( np.dot(self.V(np.array([(x1+x)/2])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2]))
            ]))

        elif N == 1:    # divide in the middle7

            x = position[0]
            length = size[0]

            x1 = x - length/2
            x2 = x + length/2

            nx = np.array([1])

            self.points = set()

            self.points.add(x1)
            self.points.add(x2)
            self.points.add(x)

            self.max_edge = max(np.abs(x2-x), np.abs(x-x1))

            self.alphas = np.abs(np.array([
                ( np.dot(self.V(np.array([(x2+x)/2])), nx) * np.abs(x2-x) ) / self.K(np.array([(x2+x)/2])),
                ( np.dot(self.V(np.array([(x1+x)/2])), -nx) * np.abs(x-x1) ) / self.K(np.array([(x1+x)/2]))
            ]))

        elif N == 2:
            
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
        if self.N == 1:
            if self.max_edge > self.eps:
                return False
        return np.max(self.alphas) < 2
    
    def propagate(self):

        if self.N == 1:

            if self.isValid():
                return
            else:

                PSs = []
                # if self.alphas[0] >= 2 or self.size/2 > self.eps: PSs.append(PointSystem(self.N, np.array([self.position[0] - self.size[0]/4]), self.size/2, self.V, self.K, eps=self.eps))
                PSs.append(PointSystem(self.N, np.array([self.position[0] - self.size[0]/4]), self.size/2, self.V, self.K, eps=self.eps))
                # if self.alphas[1] >= 2 or self.size/2 > self.eps: PSs.append(PointSystem(self.N, np.array([self.position[0] + self.size[0]/4]), self.size/2, self.V, self.K, eps=self.eps))
                PSs.append(PointSystem(self.N, np.array([self.position[0] + self.size[0]/4]), self.size/2, self.V, self.K, eps=self.eps))

                for PS in PSs:
                    if not PS.isValid(): PS.propagate()
                    self.points = self.points | PS.points
        
        elif self.N == 2:

            if self.isValid():
                return
            else:

                PSs = [
                    PointSystem(self.N, np.array([self.position[0] - self.size[0]/4, self.position[1] - self.size[1]/4]), self.size/2, self.V, self.K, eps=self.eps),
                    PointSystem(self.N, np.array([self.position[0] + self.size[0]/4, self.position[1] - self.size[1]/4]), self.size/2, self.V, self.K, eps=self.eps),
                    PointSystem(self.N, np.array([self.position[0] - self.size[0]/4, self.position[1] + self.size[1]/4]), self.size/2, self.V, self.K, eps=self.eps),
                    PointSystem(self.N, np.array([self.position[0] + self.size[0]/4, self.position[1] + self.size[1]/4]), self.size/2, self.V, self.K, eps=self.eps)
                ]

                for PS in PSs:
                    if not PS.isValid(): PS.propagate()
                    self.points = self.points | PS.points
        else:
            raise NotImplementedError

