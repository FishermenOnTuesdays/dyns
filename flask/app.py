import json, time

from flask import Flask, request, render_template, jsonify

import pydyns as dyns

app = Flask(__name__)


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
    pPDE = dyns.ParabolicPartialDifferentialEquation(
                payload['q'],
                payload['k'],
                payload['f'],
                payload['phi'],
                [payload['alpha1'], payload['beta1'], payload['gamma1']],
                [payload['alpha2'], payload['beta2'], payload['gamma2']],
                (payload['a'], payload['b']),
                payload['T'],
                payload['h'],
                payload['tau'],
                10, # payload['rarefaction_ratio_x'],
                10 # payload['rarefaction_ratio_t']
            )
    return jsonify({
        'error': None,
        'z_data': pPDE.Solution().astype(float).tolist(), #json.dumps(hPDE.Solution().astype(float).tolist())
        'x': pPDE.GetXs(),
        't': pPDE.GetTs()
    })


@app.route('/api', methods=['GET', 'POST'])
def api():
    # handle the POST request
    if request.method == 'POST':
        start_time = time.perf_counter()

        request_type = request.form['request type']
        payload = json.loads(request.form['payload'])
        # print(request_type, payload)

        match request_type:
            case 'HyperbolicPartialDifferentialEquation':
                response = HyperbolicPartialDifferentialEquation(payload)
            case 'ParabolicPartialDifferentialEquation':
                response = ParabolicPartialDifferentialEquation(payload)
            case _:
                response = jsonify({'error': 'unsupported request type'})

        print(f"--- {request_type} solved in %s seconds ---" % (time.perf_counter() - start_time))
    else:
        response = jsonify({'error': 'unsupported request type'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 200


if __name__ == '__main__':
    app.run(ssl_context=('cert.pem', 'key.pem'), port=5001, host="0.0.0.0")