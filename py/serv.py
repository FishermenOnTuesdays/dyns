from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
from urllib.parse import parse_qs
import json
from subprocess import Popen, PIPE
import os


def calc(data):
    p = Popen(['..\cpp\solver.exe'], shell=True, stdout=PIPE, stdin=PIPE)

    answer = []

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
    answer.append(result.decode('utf-8'))
    return answer


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

        answer = calc(data)
        json_string = json.dumps(answer)
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
