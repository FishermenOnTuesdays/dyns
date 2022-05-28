import json, time

from flask import Flask, request, render_template, jsonify
# import cexprtk
import sympy
from sympy.abc import x, y, t, u
from sympy.utilities.lambdify import lambdify

import pydyns as dyns
import solvers

app = Flask(__name__)


def FunctionStringToLambda(function_string: str, variables: str) -> callable:
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

@app.route('/', methods=['GET'])
def default():
    return 'DynS Flask server. STATE: OK'

@app.route('/api', methods=['GET', 'POST'])
def api():
    # handle the POST request
    if request.method == 'POST':
        start_time = time.perf_counter()

        request_type = request.form['request type']
        payload = json.loads(request.form['payload'])
        print(request_type, payload)

        match request_type:
            case 'HyperbolicPartialDifferentialEquation':
                response = HyperbolicPartialDifferentialEquation(payload)
            case 'ParabolicPartialDifferentialEquation':
                response = ParabolicPartialDifferentialEquation(payload)
            case '2DimensionalHeatEquation':
                response = TwoDimensionalHeatEquation(payload)
            case _:
                response = jsonify({'error': 'unsupported request type'})

        print(f"--- {request_type} solved in %s seconds ---" % (time.perf_counter() - start_time))
    else:
        response = jsonify({'error': 'unsupported request type'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 200


if __name__ == '__main__':
    app.run(ssl_context=('cert.pem', 'key.pem'), port=5001, host="0.0.0.0")