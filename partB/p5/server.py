# tcp_server.py - sends the requested file to the client
import socket
import os

HOST = "127.0.0.1"  # this computer only (localhost)
PORT = 8888  # port number the server listens on
BUFFER_SIZE = 1024  # maximum bytes received by one recv()

# create a TCP socket, bind it to (HOST, PORT) and start listening
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind((HOST, PORT))
server_socket.listen(1)
print("Server is listening on", HOST, "port", PORT)

try:
    while True:
        client_socket, client_address = server_socket.accept()
        with client_socket:
            print("Accepted connection from", client_address)

            # receive the file name sent by the client
            file_name = client_socket.recv(BUFFER_SIZE).decode()
            print("Received file name =", file_name)

            # send the contents if the file exists, otherwise an error text
            if os.path.isfile(file_name):
                with open(file_name, "rb") as file:
                    client_socket.sendall(file.read())
                print("File sent")
            else:
                client_socket.sendall(b"File not found")
                print("File not found")
except KeyboardInterrupt:
    print("\nServer stopped")
finally:
    server_socket.close()