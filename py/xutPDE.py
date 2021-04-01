import sympy as sym

'''
    F * du/dx + G * du/dt = H
                |
    dx/F=dt/G=du/H
                |
    dx/dt=F/G
    du/dt=H/G
'''

x = sym.Symbol('x')
u = sym.Symbol('u')
t = sym.Symbol('t')

F = u
G = x * u
H = t

dxdt = F/G
dudt = H/G

print(dxdt)
print(dudt)

#eqs = [sym.Eq(x.diff(t), dxdt), sym.Eq(u.diff(t), dudt), sym.Eq(t.diff(t), 1)]
#print(sym.solvers.ode.systems.dsolve_system(eqs))

#'''

print(sym.integrate(1/F, x))
print(sym.integrate(1/G, t))
print(sym.integrate(1/H, u))

print(sym.simplify(sym.integrate(1/F, x) - sym.integrate(1/G, t)))
print(sym.simplify(sym.integrate(1/F, x) - sym.integrate(1/H, u)))
print(sym.simplify(sym.integrate(1/G, t) - sym.integrate(1/H, u)))

#'''