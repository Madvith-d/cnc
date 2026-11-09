# tcp_client.py - requests a file from the server and saves it
import socket
import sys
import os

SERVER_ADDRESS = ("127.0.0.1", 8888)  # (IP address, port) of the server
BUFFER_SIZE = 1024

# create a TCP socket and connect to the server
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    client_socket.connect(SERVER_ADDRESS)
except ConnectionRefusedError:
    sys.exit("Could not connect to the server. Is tcp_server.py running?")

file_name = input("Enter the file name: ").strip()
if file_name == "":
    client_socket.close()
    sys.exit("No file name entered.")

# send the file name, then read until the server closes the connection
client_socket.sendall(file_name.encode())
file_contents = b""
while True:
    chunk = client_socket.recv(BUFFER_SIZE)
    if not chunk:  # empty bytes: the server has closed
        break
    file_contents += chunk
client_socket.close()

if file_contents == b"File not found":
    print("File not found on the server.")
else:
    print("File contents:")
    print(file_contents.decode(errors="replace"))
    save_name = "received_" + os.path.basename(file_name)
    with open(save_name, "wb") as file:
        file.write(file_contents)
    print("File received and saved as '" + save_name + "'")