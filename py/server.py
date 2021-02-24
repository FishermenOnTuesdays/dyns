from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import threading
import logging
from urllib.parse import parse_qs
import json
from subprocess import Popen, PIPE
import time
# from numba import jit, njit
import numpy as np
import pandas as pd
# import os
import sqlite3 as sl


def Solver():
    return Popen(['..\cpp\solver.exe'], shell=True, stdout=PIPE, stdin=PIPE)


starting_time = 0


def Login(requestData):
    con = sl.connect('dyns.db')
    login = requestData['login'][0]
    password = requestData['password'][0]
    users = pd.read_sql("SELECT * FROM USERS WHERE " + "login = '" + login + "' AND password = '" + password + "'", con)
    if users.values.shape[0] > 0:
        user = users.values[0].tolist()
        systems = pd.read_sql("SELECT * FROM DYNAMICSYSTEMS WHERE " + "user_id = '" + str(user[0]) + "'", con)
        ans = systems.values.tolist()
        ans = {
            'user': user,
            'data': ans
        }
        con.close()
        return ans
    con.close()
    return 'access denied'


def deleteUserDynamicSystem(requestData):
    con = sl.connect('dyns.db')
    login = requestData['login'][0]
    password = requestData['password'][0]
    users = pd.read_sql("SELECT * FROM USERS WHERE " + "login = '" + login + "' AND password = '" + password + "'", con)
    if users.values.shape[0] > 0:
        user = users.values[0].tolist()
        user_id = user[0]
        title = requestData['title'][0]
        userDynamicSystemJSON = requestData['data'][0]
        con.execute("DELETE FROM DYNAMICSYSTEMS WHERE user_id = ? AND title = ? AND data = ?",
                    (user_id, title, userDynamicSystemJSON,))
        con.commit()
        con.close()
        return 'success'
    con.close()
    return 'access denied'


def saveUserDynamicSystem(requestData):
    con = sl.connect('dyns.db')
    login = requestData['login'][0]
    password = requestData['password'][0]
    users = pd.read_sql("SELECT * FROM USERS WHERE " + "login = '" + login + "' AND password = '" + password + "'", con)
    if users.values.shape[0] > 0:
        user = users.values[0].tolist()
        user_id = user[0]
        userDynamicSystemJSON = requestData['data'][0]
        title = requestData['title'][0]
        sqlinsert = 'INSERT INTO DYNAMICSYSTEMS (user_id, title, data) values(?, ?, ?)'
        data = [
            (user_id, title, userDynamicSystemJSON),
        ]
        with con:
            con.executemany(sqlinsert, data)
        con.commit()
        con.close()
        return 'success'
    con.close()
    return 'access denied'


def Poincare(data):
    global starting_time
    solver = Solver()
    ans = []
    # make floats
    data['request type'] = int(data['request type'][0])
    data['plane equation[]'] = np.array(data['plane equation[]']).astype(float).tolist()
    data['trajectory[]'] = np.array(
        [data['trajectory[0][]'], data['trajectory[1][]'], data['trajectory[2][]']]
    ).astype(float).transpose().tolist()
    del data['trajectory[0][]']
    del data['trajectory[1][]']
    del data['trajectory[2][]']
    # print('fixed data at', time.time() - starting_time, 'seconds')

    # send json string
    value = json.dumps(data)
    print(value)
    # text_file = open("send.txt", "w")
    # text_file.write(value)
    # text_file.close()
    value = bytes(value, 'UTF-8')  # Needed in Python 3.
    solver.stdin.write(value)
    solver.stdin.flush()
    # print('done')

    res = solver.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    res = json.loads(res.decode('utf-8'))[0]
    res['intersections2D'] = np.array(res['intersections2D']).astype(float).transpose().tolist()
    res['intersections3D'] = np.array(res['intersections3D']).astype(float).transpose().tolist()
    # print('solved at', time.time() - starting_time, 'seconds')
    return json.dumps(res)


def Bifurcation(requestData):
    solver = Solver()
    ans = []
    # make numeric
    requestData['request type'] = int(requestData['request type'][0])
    requestData['start values[]'] = np.array(requestData['start values[]']).astype(float).tolist()
    requestData['time'] = float(requestData['time'][0])
    requestData['dt'] = float(requestData['dt'][0])
    requestData['variables'] = requestData['variables'][0]
    requestData['additional equations'] = requestData['additional equations'][0]
    requestData['ExplicitNumericalMethodCode'] = 0

    requestData['parameter'] = requestData['parameter'][0]
    requestData['range[]'] = np.array(requestData['range[]']).astype(float).tolist()
    requestData['step'] = float(requestData['step'][0])

    # send json string
    value = json.dumps(requestData)
    print(value)
    solver.stdin.write(bytes(value, 'UTF-8'))
    solver.stdin.flush()
    # print('done')
    # start = time.time()
    result = solver.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    ans = result.decode('utf-8')
    # print('solved in', time.time() - start, 'seconds')
    return ans

'''
def Trajectory(requestData):
    solver = Solver()
    ans = []
    # remove additional fairings
    # make numeric
    requestData['request type'] = int(requestData['request type'][0])
    requestData['start values[]'] = np.array(requestData['start values[]']).astype(np.float).tolist()
    requestData['time'] = float(requestData['time'][0])
    requestData['dt'] = float(requestData['dt'][0])
    #
    requestData['variables'] = requestData['variables'][0]
    requestData['additional equations'] = requestData['additional equations'][0]
    if requestData['additional equations'] == ';':
        requestData['additional equations'] = ''
    # send json string
    value = json.dumps(requestData)
    print(value)
    solver.stdin.write(bytes(value, 'UTF-8'))
    solver.stdin.flush()
    # start = time.time()
    result = solver.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    ans.append(result.decode('utf-8'))
    # print('solved in', time.time() - start, 'seconds')
    return ans
'''

#'''
def Trajectory(requestData):
    solver = Solver()
    ans = []
    value = requestData['data'][0]
    print(value)
    solver.stdin.write(bytes(value, 'UTF-8'))
    solver.stdin.flush()
    # start = time.time()
    result = solver.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    ans.append(result.decode('utf-8'))
    # print('solved in', time.time() - start, 'seconds')
    return ans
#'''

def LyapunovMap(requestData):
    solver = Solver()
    ans = []
    # remove additional fairings
    # make numeric
    requestData['request type'] = int(requestData['request type'][0])
    requestData['start values[]'] = np.array(requestData['start values[]']).astype(float).tolist()
    requestData['time'] = float(requestData['time'][0])
    requestData['dt'] = float(requestData['dt'][0])
    #
    requestData['variables'] = requestData['variables'][0]
    requestData['additional equations'] = requestData['additional equations'][0]
    if requestData['additional equations'] == ';':
        requestData['additional equations'] = ''
    requestData['steps[]'] = np.array(requestData['steps[]']).astype(float).tolist()
    requestData['ranges[]'] = np.array([requestData['ranges[0][]'], requestData['ranges[1][]']]).astype(
        np.float).tolist()
    del requestData['ranges[0][]']
    del requestData['ranges[1][]']
    requestData['ExplicitNumericalMethodCode'] = 0
    # send json string
    value = json.dumps(requestData)
    print(value)
    solver.stdin.write(bytes(value, 'UTF-8'))
    solver.stdin.flush()
    # start = time.time()
    result = solver.stdout.readline().strip()
    # print('result = ', result.decode('utf-8'))
    ans.append(result.decode('utf-8'))
    # print('solved in', time.time() - start, 'seconds')
    return ans


class Handler(BaseHTTPRequestHandler):
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
        # print('started', time.time() - starting_time, 'seconds')
        content_length = int(self.headers['Content-Length'])  # <--- Gets the size of data
        post_data = self.rfile.read(content_length)  # <--- Gets the data itself
        # print('read post data in', time.time() - starting_time, 'seconds')
        data = parse_qs(post_data.decode('utf-8'))
        self._set_response()
        # print('parced post data at', time.time() - starting_time, 'seconds')
        answer = 0
        if data['request type'][0] == 'login':
            print('login request')
            answer = Login(data)
        elif data['request type'][0] == 'saveUserDynamicSystem':
            print('saveUserDynamicSystem request')
            answer = saveUserDynamicSystem(data)
        elif data['request type'][0] == 'deleteUserDynamicSystem':
            print('deleteUserDynamicSystem request')
            answer = deleteUserDynamicSystem(data)
        elif data['request type'][0] == '0':
            print('trajectory request')
            answer = Trajectory(data)[0]  # [1:-1]
        elif data['request type'][0] == '1':
            print('Lyapunov map request')
            answer = LyapunovMap(data)[0]  # [1:-1]
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
        print('done in', time.time() - starting_time, 'seconds', 'in thread:', threading.currentThread().getName())


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""
    pass


def run(server_class=HTTPServer, handler_class=Handler, port=5000):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    # httpd = server_class(server_address, handler_class)
    httpd = ThreadedHTTPServer(('0.0.0.0', 5000), Handler)
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
