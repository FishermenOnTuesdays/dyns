import socket
import json
import struct


def read_blob(sock, size):
    buf = ""
    while len(buf) != size:
        ret = sock.recv(size - len(buf))
        if not ret:
            raise Exception("Socket closed")
        ret += buf
    return buf


def read_long(sock):
    size = struct.calcsize("L")
    data = read_blob(sock, size)
    return struct.unpack("L", data)


serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

host = socket.gethostname()
port = 5000

buffer_size = 4096

serverSocket.bind((host, port))
serverSocket.listen(10)

print("Listening on %s:%s..." % (host, str(port)))

while True:
    clientSocket, address = serverSocket.accept()

    # read data size first, then the whole data and decode as json
    datasize = read_long(clientSocket)
    data = read_blob(clientSocket, datasize)
    jdata = json.load(data.decode('utf-8'))

    print("Connection received from %s..." % str(address))
    clientSocket.sendall(struct.pack("L", len(jdata)))
    clientSocket.sendall(jdata)
    clientSocket.close()
