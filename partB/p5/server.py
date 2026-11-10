
import socket
import os

# Define server address and port number
server_address = ('localhost', 8888)

# Create a TCP socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to the server address
server_socket.bind(server_address)

# Listen for incoming client connections
server_socket.listen(1)

print("Server is listening for incoming connections...")

while True:

    # Accept a client connection
    client_socket, client_address = server_socket.accept()

    print("Accepted connection from", client_address)

    # Receive the file name from the client
    file_name = client_socket.recv(1024).decode()

    print("Received file name =", file_name)

    # Check whether the requested file exists
    if os.path.exists(file_name):

        # Open the file in read binary mode
        with open(file_name, 'rb') as file:

            # Read the contents of the file
            file_contents = file.read()

        # Send file contents to the client
        client_socket.send(file_contents)

    else:

        # Send an error message if file does not exist
        client_socket.send(b'File not found')

    # Close the client connection
    client_socket.close()
