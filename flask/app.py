import json, time

from flask import Flask, request, render_template, jsonify
# import cexprtk
import sympy
from sympy.abc import x, y, t, u
from sympy.utilities.lambdify import lambdify
import pandas as pd
import numpy as np
import sqlite3 as sl

import pydyns as dyns
import solvers

app = Flask(__name__)

# TECHICAL
def FunctionStringToLambda(function_string: str, variables: str) -> callable:
    """ Takes a string and returns a lambda function """
    expr = sympy.sympify(function_string)
    match variables:
        case 'x':
            # return lambda x, y: expr.evalf(subs={'x': x, 'y': y})#cexprtk.evaluate_expression(function_string, {'x': x, 'y': y})
            return lambdify((x), expr, modules=['numpy', 'sympy'])
        case 't':
            # return lambda x, y: expr.evalf(subs={'x': x, 'y': y})#cexprtk.evaluate_expression(function_string, {'x': x, 'y': y})
            return lambdify((t), expr, modules=['numpy', 'sympy'])
        case 'xy':
            # return lambda x, y: expr.evalf(subs={'x': x, 'y': y})#cexprtk.evaluate_expression(function_string, {'x': x, 'y': y})
            return lambdify((x, y), expr, modules=['numpy', 'sympy'])
        case 'xt':
            # return lambda x, t: expr.evalf(subs={'x': x, 't': t})#cexprtk.evaluate_expression(function_string, {'x': x, 't': t})
            return lambdify((x, t), expr, modules=['numpy', 'sympy'])
        case 'yt':
            # return lambda y, t: expr.evalf(subs={'y': y, 't': t})#cexprtk.evaluate_expression(function_string, {'y': y, 't': t})
            return lambdify((y, t), expr, modules=['numpy', 'sympy'])
        case 'xyt':
            # return lambda x, y, t: expr.evalf(subs={'x': x, 'y': y, 't': t})#cexprtk.evaluate_expression(function_string, {'x': x, 'y': y, 't': t})
            return lambdify((x, y, t), expr, modules=['numpy', 'sympy'])
        case 'uxt':
            # return lambda x, y, t: expr.evalf(subs={'x': x, 'y': y, 't': t})#cexprtk.evaluate_expression(function_string, {'x': x, 'y': y, 't': t})
            return lambdify((u, x, t), expr, modules=['numpy', 'sympy'])
        case _:
            raise NotImplementedError

# DYNS FUNCTIONS
def HyperbolicPartialDifferentialEquation(payload):

    hPDE = dyns.HyperbolicPartialDifferentialEquation(
                payload['f'],
                payload['g'],
                payload['q'],
                payload['phi'],
                payload['psi'],
                (payload['alpha1'], payload['beta1'], payload['gamma1']),
                (payload['alpha2'], payload['beta2'], payload['gamma2']),
                (payload['a'], payload['b']),
                payload['T'],
                payload['h'],
                payload['tau']
            )
    return jsonify({
        'error': None,
        'z_data': hPDE.Solution().astype(float).tolist(), #json.dumps(hPDE.Solution().astype(float).tolist())
        'x': hPDE.GetXs(),
        't': hPDE.GetTs()
    })

def ParabolicPartialDifferentialEquation(payload):
    # pPDE = dyns.ParabolicPartialDifferentialEquation(
    #             payload['q'],
    #             payload['k'],
    #             payload['f'],
    #             payload['phi'],
    #             [payload['alpha1'], payload['beta1'], payload['gamma1']],
    #             [payload['alpha2'], payload['beta2'], payload['gamma2']],
    #             (payload['a'], payload['b']),
    #             payload['T'],
    #             payload['h'],
    #             payload['tau'],
    #             1, # payload['rarefaction_ratio_x'],
    #             1 # payload['rarefaction_ratio_t']
    #         )
    U, Xs, Ts = solvers.ParabolicPartialDifferentialEquation(
                FunctionStringToLambda(payload['q'], 'uxt'),
                FunctionStringToLambda(payload['k'], 'uxt'),
                FunctionStringToLambda(payload['f'], 'uxt'),
                FunctionStringToLambda(payload['phi'], 'x'),
                [FunctionStringToLambda(payload['alpha1'], 't'), FunctionStringToLambda(payload['beta1'], 't'), FunctionStringToLambda(payload['gamma1'], 't')],
                [FunctionStringToLambda(payload['alpha2'], 't'), FunctionStringToLambda(payload['beta2'], 't'), FunctionStringToLambda(payload['gamma2'], 't')],
                payload['a'], payload['b'],
                payload['T'],
                payload['h'],
                payload['tau'],
                # 1, # payload['rarefaction_ratio_x'],
                # 1 # payload['rarefaction_ratio_t']
            )
    return jsonify({
        'error': None,
        'z_data': U.tolist(),#pPDE.Solution().astype(float).tolist(), #json.dumps(hPDE.Solution().astype(float).tolist())
        'x': Xs.tolist(),#pPDE.GetXs(),
        't': Ts.tolist()#pPDE.GetTs()
    })

def TwoDimensionalHeatEquation(payload):

    U, Xs, Ys, Ts = solvers.TwoDimensionalHeatEquation(
        FunctionStringToLambda(payload['qxyX'], 'xy'),
        FunctionStringToLambda(payload['KxyX'], 'xy'),
        FunctionStringToLambda(payload['qxyY'], 'xy'),
        FunctionStringToLambda(payload['KxyY'], 'xy'),
	    FunctionStringToLambda(payload['fxyt'], 'xyt'),
        payload['a'],
        payload['b'],
        payload['c'],
        payload['d'],
        payload['T'],
        FunctionStringToLambda(payload['mu_a'], 'yt'),
        FunctionStringToLambda(payload['mu_b'], 'yt'),
        FunctionStringToLambda(payload['mu_c'], 'xt'),
        FunctionStringToLambda(payload['mu_d'], 'xt'),
        FunctionStringToLambda(payload['u0'], 'xy'),
        payload['hx'],
        payload['hy'],
        payload['tau']
    )
    return jsonify({
        'error': None,
        'u': U.tolist(),
        'x': Xs.tolist(),
        'y': Ys.tolist(),
        't': Ts.tolist(),
    })

def SecondOrderODE(request):
    print(request)  # log input data
    # request = json.loads(request)
    functions = [(f, 'x') for f in request['functions']]
    boundaries = np.asarray(request['boundaries'])
    bounds = (request['bounds'][0], request['bounds'][1])
    Num = (request['N'])
    solver = dyns.SecondOrderODESolver(functions, boundaries, bounds, Num)
    solution = solver.GetSolution()
    return jsonify(solution.tolist())

# LEGACY FUNCTIONS
def MainTrajectory(payload):
    dynamic_system = dyns.DynamicSystem(payload['start values[]'], payload['functions[]'], payload['variables'], payload['additional equations'])
    dynamic_system.SetDt(payload['dt'])
    match payload['ExplicitNumericalMethodCode']:
        case 0:
            dynamic_system.explicit_method = dyns.DynamicSystem.ExplicitNumericalMethod.RungeKuttaFourthOrder;
        case 1:
            dynamic_system.explicit_method = dyns.DynamicSystem.ExplicitNumericalMethod.AdaptiveRungeKuttaFourthOrder;
        case 2:
            dynamic_system.explicit_method = dyns.DynamicSystem.ExplicitNumericalMethod.FixedVRungeKuttaFourthOrder;
        case 3:
            dynamic_system.explicit_method = dyns.DynamicSystem.ExplicitNumericalMethod.EulerExplicit;
        case _:
            pass
    trajectoryPointList = dynamic_system.GetTrajectory(payload['time'])
    timeSequence = dynamic_system.GetTimeSequence()
    comment = dynamic_system.GetErrorComment()
    if comment == "Infinity trajectory":
        dynamic_system.SetCurrentPointOfTrajectory(payload['starting_values'])
    dynamic_system.SetDt(payload['dt'])
    series_of_spectrum_lyapunov_exponents = dynamic_system.GetTimeSeriesSpectrumLyapunov(payload['time']);
    variables = payload['variables'].split(', ')
    # dt = payload['dt']

    # convert trajectory list to dict by variable
    trajectory = {
        't': timeSequence
    }
    trajlen = len(trajectoryPointList)
    if (trajlen > 0):
        maxtrajlen = 100000
        step = trajlen // maxtrajlen
        if step < 1: step = 1
        for i in range(0, trajlen - 1, step):
            point = trajectoryPointList[i]
            for j, var in enumerate(variables):
                if var not in trajectory:
                    trajectory[var] = []
                trajectory[var].append(float(point[j]))

    return jsonify({
        'trajectory': trajectory,
        'time sequence': timeSequence,
        'series of spectrum lyapunov exponents': series_of_spectrum_lyapunov_exponents,
        'comment': comment
    })

# DB FUNCTIONS
def Login(payload):
    con = sl.connect('dyns.db')
    login = payload['login']
    password = payload['password']
    users = pd.read_sql("SELECT * FROM USERS WHERE " + "login = '" + login + "' AND password = '" + password + "'", con)
    if users.values.shape[0] > 0:
        user = users.values[0].tolist()
        systems = pd.read_sql("SELECT * FROM DYNAMICSYSTEMS WHERE " + "user_id = '" + str(user[0]) + "'", con)
        con.close()
        return jsonify({
            'user': user,
            'data': systems.values.tolist()
        })
    con.close()
    return jsonify('access denied')

def saveUserDynamicSystem(payload):
    con = sl.connect('dyns.db')
    login = payload['login']
    password = payload['password']
    users = pd.read_sql("SELECT * FROM USERS WHERE " + "login = '" + login + "' AND password = '" + password + "'", con)
    if users.values.shape[0] > 0:
        user = users.values[0].tolist()
        user_id = user[0]
        userDynamicSystemJSON = payload['data']
        title = payload['title']
        sqlinsert = 'INSERT INTO DYNAMICSYSTEMS (user_id, title, data) values(?, ?, ?)'
        data = [
            (user_id, title, userDynamicSystemJSON),
        ]
        with con:
            con.executemany(sqlinsert, data)
        con.commit()
        con.close()
        return jsonify('success')
    con.close()
    return jsonify('access denied')

def deleteUserDynamicSystem(payload):
    con = sl.connect('dyns.db')
    login = payload['login']
    password = payload['password']
    users = pd.read_sql("SELECT * FROM USERS WHERE " + "login = '" + login + "' AND password = '" + password + "'", con)
    if users.values.shape[0] > 0:
        user = users.values[0].tolist()
        user_id = user[0]
        title = payload['title']
        userDynamicSystemJSON = payload['data']
        con.execute("DELETE FROM DYNAMICSYSTEMS WHERE user_id = ? AND title = ? AND data = ?",
                    (user_id, title, userDynamicSystemJSON,))
        con.commit()
        con.close()
        return jsonify('success')
    con.close()
    return jsonify('access denied')



@app.route('/status', methods=['GET'])
def default():
    return 'DynS Flask server. STATE: OK'

@app.route('/', methods=['GET', 'POST'])
def api():
    # handle the POST request
    if request.method == 'POST':
        start_time = time.perf_counter()
        request_type = request.form['request type']

        match request_type:
            case 'HyperbolicPartialDifferentialEquation':
                payload = json.loads(request.form['payload'])
                response = HyperbolicPartialDifferentialEquation(payload)
            case 'ParabolicPartialDifferentialEquation':
                payload = json.loads(request.form['payload'])
                response = ParabolicPartialDifferentialEquation(payload)
            case '2DimensionalHeatEquation':
                payload = json.loads(request.form['payload'])
                response = TwoDimensionalHeatEquation(payload)
            case 'SecondOrderODESolver':
                response = SecondOrderODE(json.loads(request.form['data']))
            case 'login':
                response = Login(request.form)
            case 'saveUserDynamicSystem':
                response = saveUserDynamicSystem(request.form)
            case 'deleteUserDynamicSystem':
                response = deleteUserDynamicSystem(request.form)
            case '0':
                response = MainTrajectory(json.loads(request.form['data']))
            case _:
                response = jsonify({'error': 'unsupported request type'})

        print(f"--- {request_type} solved in %s seconds ---" % (time.perf_counter() - start_time))
    else:
        response = jsonify({'error': 'unsupported request type'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 200


if __name__ == '__main__':
#    app.run(ssl_context=('cert.pem', 'key.pem'), port=5001, host="0.0.0.0", threaded=True)
    app.run(port=5001, host="0.0.0.0", threaded=True)