from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
from urllib.parse import parse_qs
import json
from subprocess import Popen, PIPE
import time
from numba import jit, njit
import numpy as np
import os

'''
def Poincare(data):
    p = Popen(['..\cpp\Poincare.exe'], shell=True, stdout=PIPE, stdin=PIPE)

    out = ''

    for eq_param in ['A', 'B', 'C', 'D']:
        value = str(data[eq_param][0]) + '\n'
        # out += value
        value = bytes(value, 'UTF-8')  # Needed in Python 3.
        p.stdin.write(value)
        p.stdin.flush()

    n = int(data['N'][0])

    # send number of input params
    value = data['N'][0] + '\n'
    # out += value
    value = bytes(value, 'UTF-8')  # Needed in Python 3.
    p.stdin.write(value)
    p.stdin.flush()
    for i in range(n):
        for x in ['x1[]', 'x2[]', 'x3[]']:
            value = str(data[x][i]) + ' '
            # out += value
            value = bytes(value, 'UTF-8')  # Needed in Python 3.
            p.stdin.write(value)
        value = '\n'
        # out += value
        value = bytes(value, 'UTF-8')  # Needed in Python 3.
        p.stdin.write(value)
        p.stdin.flush()

    # print(out)
    n = int(p.stdout.readline().strip().decode('utf-8'))
    print(n)
    answer = {}
    answer['N'] = n
    answer['x'] = []
    answer['y'] = []
    answer['z'] = []
    answer['X'] = []
    answer['Y'] = []
    answer['D'] = data['D']
    for i in range(n):
        x, y, z = map(float, p.stdout.readline().strip().decode('utf-8').split())
        answer['x'].append(x)
        answer['y'].append(y)
        answer['z'].append(z)
    for i in range(n):
        x, y = map(float, p.stdout.readline().strip().decode('utf-8').split())
        answer['X'].append(x)
        answer['Y'].append(y)
    # print(answer)
    # print(out)
    return answer
'''

starting_time = 0


def Poincare(data):
    global starting_time
    p = Popen(['..\cpp\solver.exe'], shell=True, stdout=PIPE, stdin=PIPE)
    ans = []
    # make floats
    data['request type'] = int(data['request type'][0])
    data['plane equation[]'] = np.array(data['plane equation[]']).astype(np.float).tolist()
    data['trajectory[]'] = np.array(
        [data['trajectory[0][]'], data['trajectory[1][]'], data['trajectory[2][]']]
    ).astype(np.float).transpose().tolist()
    del data['trajectory[0][]']
    del data['trajectory[1][]']
    del data['trajectory[2][]']
    #print('fixed data at', time.time() - starting_time, 'seconds')

    # send json string
    value = json.dumps(data)
    # print(value)
    text_file = open("send.txt", "w")
    text_file.write(value)
    text_file.close()
    value = bytes(value, 'UTF-8')  # Needed in Python 3.
    p.stdin.write(value)
    p.stdin.flush()
    # print('done')

    res = p.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    res = json.loads(res.decode('utf-8'))[0]
    res['intersections2D'] = np.array(res['intersections2D']).astype(np.float).transpose().tolist()
    res['intersections3D'] = np.array(res['intersections3D']).astype(np.float).transpose().tolist()
    #print('solved at', time.time() - starting_time, 'seconds')
    return json.dumps(res)

def Bifurcation(data):
    p = Popen(['..\cpp\solver.exe'], shell=True, stdout=PIPE, stdin=PIPE)
    ans = []
    # make numeric
    data['request type'] = int(data['request type'][0])
    data['start values[]'] = np.array(data['start values[]']).astype(np.float).tolist()
    data['time'] = float(data['time'][0])
    data['dt'] = float(data['dt'][0])
    data['variables'] = data['variables'][0]
    data['additional equations'] = data['additional equations'][0]
    data['parameter'] = data['parameter'][0]
    data['range[]'] = np.array(data['range[]']).astype(np.float).tolist()
    data['step'] = float(data['step'][0])


    # send json string
    value = json.dumps(data)

    value = bytes(value, 'UTF-8')  # Needed in Python 3.
    print(value)
    p.stdin.write(value)
    p.stdin.flush()
    # print('done')
    start = time.time()

    result = p.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    ans = result.decode('utf-8')
    #print('solved in', time.time() - start, 'seconds')
    return ans


def calc(data):
    p = Popen(['..\cpp\solver.exe'], shell=True, stdout=PIPE, stdin=PIPE)
    ans = []
    # make numeric
    data['request type'] = int(data['request type'][0])
    data['start values[]'] = np.array(data['start values[]']).astype(np.float).tolist()
    data['time'] = float(data['time'][0])
    data['dt'] = float(data['dt'][0])
    data['variables'] = data['variables'][0]
    data['additional equations'] = data['additional equations'][0]
    # print('data', data)
    if data['request type'] == 1:
        data['steps[]'] = np.array(data['steps[]']).astype(np.float).tolist()
        data['ranges[]'] = np.array([data['ranges[0][]'], data['ranges[1][]']]).astype(np.float).tolist()
        del data['ranges[0][]']
        del data['ranges[1][]']

    # send json string
    value = json.dumps(data)
    print(value)
    value = bytes(value, 'UTF-8')  # Needed in Python 3.
    p.stdin.write(value)
    p.stdin.flush()
    # print('done')
    start = time.time()

    result = p.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    ans.append(result.decode('utf-8'))
    #print('solved in', time.time() - start, 'seconds')
    return ans


class S(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        # print('out', self.headers)

    def do_GET(self):
        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        self._set_response()
        self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))

    def do_POST(self):
        global starting_time
        starting_time = time.time()
        #print('started', time.time() - starting_time, 'seconds')
        content_length = int(self.headers['Content-Length'])  # <--- Gets the size of data
        post_data = self.rfile.read(content_length)  # <--- Gets the data itself
        #print('read post data in', time.time() - starting_time, 'seconds')
        data = parse_qs(post_data.decode('utf-8'))
        self._set_response()
        #print('parced post data at', time.time() - starting_time, 'seconds')
        answer = 0
        if data['request type'][0] == '0':
            print('trajectory request')
            answer = calc(data)[0]  # [1:-1]
        elif data['request type'][0] == '1':
            print('Lyapunov map request')
            answer = calc(data)[0]  # [1:-1]
        elif data['request type'][0] == '2':
            print('Bifurcation request')
            answer = Bifurcation(data)
        elif data['request type'][0] == '3':
            print('Poincare request')
            answer = Poincare(data)
        json_string = json.dumps(answer)
        # print('json')
        # print(json_string.encode(encoding='utf_8'))
        self.wfile.write(json_string.encode(encoding='utf_8'))
        # self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))
        print('done in', time.time() - starting_time, 'seconds')


def run(server_class=HTTPServer, handler_class=S, port=5000):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')


if __name__ == '__main__':
    from sys import argv

    if len(argv) == 2:
        # int(argv[1])
        run(port=5000)
    else:
        run()
