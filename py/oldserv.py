from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
from urllib.parse import parse_qs
import json
from subprocess import Popen, PIPE
import os

def Poincare(data):
    p = Popen(['..\cpp\Poincare.exe'], shell=True, stdout=PIPE, stdin=PIPE)

    out = ''

    for eq_param in ['A', 'B', 'C', 'D']:
        value = str(data[eq_param][0]) + '\n'
        #out += value
        value = bytes(value, 'UTF-8')  # Needed in Python 3.
        p.stdin.write(value)
        p.stdin.flush()

    n = int(data['N'][0])

    # send number of input params
    value = data['N'][0] + '\n'
    #out += value
    value = bytes(value, 'UTF-8')  # Needed in Python 3.
    p.stdin.write(value)
    p.stdin.flush()
    for i in range(n):
        for x in ['x1[]', 'x2[]', 'x3[]']:
            value = str(data[x][i]) + ' '
            #out += value
            value = bytes(value, 'UTF-8')  # Needed in Python 3.
            p.stdin.write(value)
        value = '\n'
        #out += value
        value = bytes(value, 'UTF-8')  # Needed in Python 3.
        p.stdin.write(value)
        p.stdin.flush()

    #print(out)
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
    #print(answer)
    #print(out)
    return answer

def calc(data):
    p = Popen(['..\cpp\solver.exe'], shell=True, stdout=PIPE, stdin=PIPE)

    ans = []

    # send number of input params
    value = str((len(data) - 2)//2) + '\n'
    #Вprint(value[:-1])
    value = bytes(value, 'UTF-8')  # Needed in Python 3.
    p.stdin.write(value)
    p.stdin.flush()

    for param in data:
        value = str(data[param][0]) + '\n'
        #print(value[:-1])
        value = bytes(value, 'UTF-8')  # Needed in Python 3.
        p.stdin.write(value)
        p.stdin.flush()

    result = p.stdout.readline().strip()
    print(result.decode('utf-8'))
    ans.append(result.decode('utf-8'))

    return ans


class S(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        #print('out', self.headers)

    def do_GET(self):
        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        self._set_response()
        self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])  # <--- Gets the size of data
        post_data = self.rfile.read(content_length)  # <--- Gets the data itself
        #print('in', self.headers)
        # logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
        #             str(self.path), str(self.headers), post_data.decode('utf-8'))
        data = parse_qs(post_data.decode('utf-8'))
        print(data)

        # print(post_data.decode('utf-8'))

        self._set_response()
        answer = 0
        if data['type'][0] == 'main':
            answer = calc(data)
        elif data['type'][0] == 'Poincare':
            answer = Poincare(data)
        json_string = json.dumps(answer)
        #print('json')
        #print(json_string.encode(encoding='utf_8'))
        self.wfile.write(json_string.encode(encoding='utf_8'))
        # self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))


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
