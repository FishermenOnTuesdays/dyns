import json, time

from flask import Flask, request, render_template, jsonify

import dyns

app = Flask(__name__)


@app.route('/api', methods=['GET', 'POST'])
def api():
    # handle the POST request
    if request.method == 'POST':
        request_type = request.form['request type']
        payload = json.loads(request.form['payload'])
        # print(request_type, payload)

        if request_type == 'HyperbolicPartialDifferentialEquation':
            start_time = time.time()
            hPDE = dyns.HyperbolicPartialDifferentialEquation(
                payload['f'],
                payload['g'],
                payload['phi'],
                payload['psi'],
                (payload['alpha1'], payload['beta1'], payload['gamma1']),
                (payload['alpha2'], payload['beta2'], payload['gamma2']),
                (payload['a'], payload['b']),
                payload['T'],
                payload['h'],
                payload['tau']
            )
            response = jsonify({
                'error': None,
                'z_data': hPDE.Solution().astype(float).tolist(), #json.dumps(hPDE.Solution().astype(float).tolist())
                'x': hPDE.GetXs(),
                't': hPDE.GetTs()
            })
            print("--- HyperbolicPartialDifferentialEquation solved in %s seconds ---" % (time.time() - start_time))
    else:
        response = jsonify({'error': 'unsupported request type'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 200


if __name__ == '__main__':
    app.run()
